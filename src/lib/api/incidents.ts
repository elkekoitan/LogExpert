import { supabase } from '@/lib/supabase'
import type { Incident, IncidentTimelineEntry, CreateIncidentForm } from '@/types'

export class IncidentsService {
  // Get all incidents with assignee details
  static async getIncidents() {
    try {
      const { data, error } = await supabase.rpc('get_incidents_with_assignee')

      if (error) throw error

      const incidents = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        severity: item.severity,
        source: item.source,
        assigneeId: item.assignee_id,
        assignee: item.assignee_id ? {
          id: item.assignee_id,
          email: item.assignee_email,
          firstName: item.assignee_first_name,
          lastName: item.assignee_last_name,
          role: 'sre', // Default role
          companySize: '51-200', // Default company size
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        resolvedAt: item.resolved_at,
        timeline: [], // Will be loaded separately
        metadata: item.metadata || {},
      })) || []

      return { incidents, error: null }
    } catch (error) {
      console.error('Get incidents error:', error)
      return { incidents: [], error: error as Error }
    }
  }

  // Get incident by ID with timeline
  static async getIncidentById(id: string) {
    try {
      // Get incident details
      const { data: incidentData, error: incidentError } = await supabase
        .from('incidents')
        .select(`
          *,
          assignee:users(id, email, first_name, last_name, role, company_size)
        `)
        .eq('id', id)
        .single()

      if (incidentError) throw incidentError

      // Get timeline
      const { data: timelineData, error: timelineError } = await supabase.rpc('get_incident_timeline', {
        incident_id: id
      })

      if (timelineError) throw timelineError

      const timeline = timelineData?.map((item: any) => ({
        id: item.id,
        type: item.type,
        message: item.message,
        userId: item.user_id,
        user: item.user_id ? {
          id: item.user_id,
          email: item.user_email,
          firstName: item.user_first_name,
          lastName: item.user_last_name,
          role: 'sre',
          companySize: '51-200',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : undefined,
        timestamp: item.timestamp,
        metadata: item.metadata || {},
      })) || []

      const incident: Incident = {
        id: incidentData.id,
        title: incidentData.title,
        description: incidentData.description,
        status: incidentData.status,
        severity: incidentData.severity,
        source: incidentData.source,
        assigneeId: incidentData.assignee_id,
        assignee: incidentData.assignee ? {
          id: incidentData.assignee.id,
          email: incidentData.assignee.email,
          firstName: incidentData.assignee.first_name,
          lastName: incidentData.assignee.last_name,
          role: incidentData.assignee.role,
          companySize: incidentData.assignee.company_size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : undefined,
        createdAt: incidentData.created_at,
        updatedAt: incidentData.updated_at,
        resolvedAt: incidentData.resolved_at,
        timeline,
        metadata: incidentData.metadata || {},
      }

      return { incident, error: null }
    } catch (error) {
      console.error('Get incident by ID error:', error)
      return { incident: null, error: error as Error }
    }
  }

  // Create new incident
  static async createIncident(incidentData: CreateIncidentForm) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert([{
          title: incidentData.title,
          description: incidentData.description,
          severity: incidentData.severity,
          source: incidentData.source,
          assignee_id: incidentData.assigneeId,
          status: 'triggered',
        }])
        .select()
        .single()

      if (error) throw error

      // Add initial timeline entry
      await this.addTimelineEntry(data.id, {
        type: 'created',
        message: 'Incident created',
        userId: undefined, // System created
      })

      return { incident: data, error: null }
    } catch (error) {
      console.error('Create incident error:', error)
      return { incident: null, error: error as Error }
    }
  }

  // Update incident
  static async updateIncident(id: string, updates: Partial<Incident>) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          severity: updates.severity,
          assignee_id: updates.assigneeId,
          resolved_at: updates.status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Add timeline entry for status change
      if (updates.status) {
        await this.addTimelineEntry(id, {
          type: updates.status === 'acknowledged' ? 'acknowledged' : 'resolved',
          message: `Incident ${updates.status}`,
          userId: undefined, // Current user
        })
      }

      return { incident: data, error: null }
    } catch (error) {
      console.error('Update incident error:', error)
      return { incident: null, error: error as Error }
    }
  }

  // Delete incident
  static async deleteIncident(id: string) {
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Delete incident error:', error)
      return { error: error as Error }
    }
  }

  // Add timeline entry
  static async addTimelineEntry(incidentId: string, entry: {
    type: IncidentTimelineEntry['type']
    message: string
    userId?: string
    metadata?: any
  }) {
    try {
      const { data, error } = await supabase
        .from('incident_timeline')
        .insert([{
          incident_id: incidentId,
          type: entry.type,
          message: entry.message,
          user_id: entry.userId,
          metadata: entry.metadata || {},
        }])
        .select()
        .single()

      if (error) throw error
      return { timelineEntry: data, error: null }
    } catch (error) {
      console.error('Add timeline entry error:', error)
      return { timelineEntry: null, error: error as Error }
    }
  }

  // Add comment to incident
  static async addComment(incidentId: string, message: string, userId: string) {
    try {
      return await this.addTimelineEntry(incidentId, {
        type: 'comment',
        message,
        userId,
      })
    } catch (error) {
      console.error('Add comment error:', error)
      return { timelineEntry: null, error: error as Error }
    }
  }

  // Acknowledge incident
  static async acknowledgeIncident(id: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update({
          status: 'acknowledged',
          assignee_id: userId,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Add timeline entry
      await this.addTimelineEntry(id, {
        type: 'acknowledged',
        message: 'Incident acknowledged',
        userId,
      })

      return { incident: data, error: null }
    } catch (error) {
      console.error('Acknowledge incident error:', error)
      return { incident: null, error: error as Error }
    }
  }

  // Resolve incident
  static async resolveIncident(id: string, userId: string, resolutionNote?: string) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Add timeline entry
      await this.addTimelineEntry(id, {
        type: 'resolved',
        message: resolutionNote || 'Incident resolved',
        userId,
      })

      return { incident: data, error: null }
    } catch (error) {
      console.error('Resolve incident error:', error)
      return { incident: null, error: error as Error }
    }
  }

  // Get incident statistics
  static async getIncidentStats(timeRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('incidents')
        .select('status, severity, created_at')

      if (timeRange) {
        query = query
          .gte('created_at', timeRange.start)
          .lte('created_at', timeRange.end)
      }

      const { data, error } = await query

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        triggered: data?.filter(i => i.status === 'triggered').length || 0,
        acknowledged: data?.filter(i => i.status === 'acknowledged').length || 0,
        resolved: data?.filter(i => i.status === 'resolved').length || 0,
        p1: data?.filter(i => i.severity === 'p1').length || 0,
        p2: data?.filter(i => i.severity === 'p2').length || 0,
        p3: data?.filter(i => i.severity === 'p3').length || 0,
        p4: data?.filter(i => i.severity === 'p4').length || 0,
      }

      return { stats, error: null }
    } catch (error) {
      console.error('Get incident stats error:', error)
      return { stats: null, error: error as Error }
    }
  }
}
