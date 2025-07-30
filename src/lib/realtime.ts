import React from 'react'
import { supabase } from '@/lib/supabase'
import type { LogEntry, Incident } from '@/types'

export class RealtimeService {
  private static subscriptions: Map<string, any> = new Map()

  // Subscribe to real-time log updates
  static subscribeToLogs(
    callback: (payload: { eventType: string; new: LogEntry; old?: LogEntry }) => void,
    filters?: { source?: string; level?: string }
  ) {
    const channelName = `logs-${Math.random().toString(36).substr(2, 9)}`
    
    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'logs',
          filter: filters?.source ? `source=eq.${filters.source}` : undefined,
        },
        (payload) => {
          // Apply client-side filtering if needed
          if (filters?.level && payload.new?.level !== filters.level) {
            return
          }
          
          callback({
            eventType: payload.eventType,
            new: payload.new as LogEntry,
            old: payload.old as LogEntry,
          })
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)
    return channelName
  }

  // Subscribe to real-time incident updates
  static subscribeToIncidents(
    callback: (payload: { eventType: string; new: Incident; old?: Incident }) => void
  ) {
    const channelName = `incidents-${Math.random().toString(36).substr(2, 9)}`
    
    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as Incident,
            old: payload.old as Incident,
          })
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)
    return channelName
  }

  // Subscribe to incident timeline updates
  static subscribeToIncidentTimeline(
    incidentId: string,
    callback: (payload: { eventType: string; new: any; old?: any }) => void
  ) {
    const channelName = `incident-timeline-${incidentId}`
    
    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incident_timeline',
          filter: `incident_id=eq.${incidentId}`,
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)
    return channelName
  }

  // Subscribe to monitor status changes
  static subscribeToMonitors(
    callback: (payload: { eventType: string; new: any; old?: any }) => void
  ) {
    const channelName = `monitors-${Math.random().toString(36).substr(2, 9)}`
    
    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'monitors',
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)
    return channelName
  }

  // Subscribe to user presence (for collaborative features)
  static subscribeToPresence(
    roomId: string,
    userInfo: { id: string; name: string; avatar?: string },
    onPresenceChange: (presences: any[]) => void
  ) {
    const channelName = `presence-${roomId}`
    
    let channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        const presences = Object.values(newState).flat()
        onPresenceChange(presences)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userInfo)
        }
      })

    this.subscriptions.set(channelName, channel)
    return channelName
  }

  // Unsubscribe from a channel
  static unsubscribe(channelName: string) {
    const channel = this.subscriptions.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(channelName)
    }
  }

  // Unsubscribe from all channels
  static unsubscribeAll() {
    for (const [channelName, channel] of this.subscriptions) {
      supabase.removeChannel(channel)
    }
    this.subscriptions.clear()
  }

  // Send real-time broadcast message
  static async broadcast(
    channelName: string,
    event: string,
    payload: any
  ) {
    const channel = this.subscriptions.get(channelName)
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      })
    }
  }

  // Subscribe to broadcast messages
  static subscribeToBroadcast(
    channelName: string,
    event: string,
    callback: (payload: any) => void
  ) {
    let channel = supabase
      .channel(channelName)
      .on('broadcast', { event }, callback)
      .subscribe()

    this.subscriptions.set(channelName, channel)
    return channelName
  }
}

// React hook for real-time logs
export function useRealtimeLogs(
  filters?: { source?: string; level?: string }
) {
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    setIsConnected(true)

    const subscription = RealtimeService.subscribeToLogs(
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setLogs(prev => [payload.new, ...prev.slice(0, 999)]) // Keep last 1000 logs
        } else if (payload.eventType === 'UPDATE') {
          setLogs(prev => prev.map(log =>
            log.id === payload.new.id ? payload.new : log
          ))
        } else if (payload.eventType === 'DELETE') {
          setLogs(prev => prev.filter(log => log.id !== payload.old?.id))
        }
      },
      filters
    )

    return () => {
      RealtimeService.unsubscribe(subscription)
      setIsConnected(false)
    }
  }, [filters])

  return { logs, isConnected }
}

// React hook for real-time incidents
export function useRealtimeIncidents() {
  const [incidents, setIncidents] = React.useState<Incident[]>([])
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    setIsConnected(true)
    
    const subscription = RealtimeService.subscribeToIncidents(
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncidents(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setIncidents(prev => prev.map(incident => 
            incident.id === payload.new.id ? payload.new : incident
          ))
        } else if (payload.eventType === 'DELETE') {
          setIncidents(prev => prev.filter(incident => incident.id !== payload.old?.id))
        }
      }
    )

    return () => {
      RealtimeService.unsubscribe(subscription)
      setIsConnected(false)
    }
  }, [])

  return { incidents, isConnected }
}

// React hook for presence
export function usePresence(
  roomId: string,
  userInfo: { id: string; name: string; avatar?: string }
) {
  const [presences, setPresences] = React.useState<any[]>([])
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    setIsConnected(true)

    const subscription = RealtimeService.subscribeToPresence(
      roomId,
      userInfo,
      setPresences
    )

    return () => {
      RealtimeService.unsubscribe(subscription)
      setIsConnected(false)
    }
  }, [roomId, userInfo])

  return { presences, isConnected }
}
