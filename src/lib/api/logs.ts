import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { LogEntry, LogFilter, LogLevel } from '@/types'

export class LogsService {
  // Get logs with filtering and pagination
  static async getLogs(filters: LogFilter = {}, page = 1, limit = 100) {
    try {
      let query = supabase
        .from('logs')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.level && filters.level.length > 0) {
        query = query.in('level', filters.level)
      }

      if (filters.source && filters.source.length > 0) {
        query = query.in('source', filters.source)
      }

      if (filters.search) {
        query = query.or(`message.ilike.%${filters.search}%,source.ilike.%${filters.search}%`)
      }

      if (filters.timeRange) {
        query = query
          .gte('timestamp', filters.timeRange.start)
          .lte('timestamp', filters.timeRange.end)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query
        .order('timestamp', { ascending: false })
        .range(from, to)

      if (error) throw error

      return {
        logs: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: (count || 0) > page * limit,
          hasPrev: page > 1,
        },
        error: null
      }
    } catch (error) {
      console.error('Get logs error:', error)
      return {
        logs: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        error: error as Error
      }
    }
  }

  // Create new log entry
  static async createLog(logData: Omit<LogEntry, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabaseAdmin
        .from('logs')
        .insert([logData])
        .select()
        .single()

      if (error) throw error
      return { log: data, error: null }
    } catch (error) {
      console.error('Create log error:', error)
      return { log: null, error: error as Error }
    }
  }

  // Bulk create log entries
  static async createLogs(logsData: Omit<LogEntry, 'id' | 'created_at'>[]) {
    try {
      const { data, error } = await supabaseAdmin
        .from('logs')
        .insert(logsData)
        .select()

      if (error) throw error
      return { logs: data || [], error: null }
    } catch (error) {
      console.error('Bulk create logs error:', error)
      return { logs: [], error: error as Error }
    }
  }

  // Get log by ID
  static async getLogById(id: string) {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { log: data, error: null }
    } catch (error) {
      console.error('Get log by ID error:', error)
      return { log: null, error: error as Error }
    }
  }

  // Get log histogram data for charts
  static async getLogHistogram(timeRange: { start: string; end: string }, interval = '1 hour') {
    try {
      const { data, error } = await supabase.rpc('get_log_histogram', {
        start_time: timeRange.start,
        end_time: timeRange.end,
        time_interval: interval
      })

      if (error) throw error
      return { histogram: data || [], error: null }
    } catch (error) {
      console.error('Get log histogram error:', error)
      return { histogram: [], error: error as Error }
    }
  }

  // Get log sources
  static async getLogSources() {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('source')
        .order('source')

      if (error) throw error

      const uniqueSources = Array.from(new Set(data?.map(item => item.source) || []))
      return { sources: uniqueSources, error: null }
    } catch (error) {
      console.error('Get log sources error:', error)
      return { sources: [], error: error as Error }
    }
  }

  // Get log levels distribution
  static async getLogLevelsDistribution(timeRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('logs')
        .select('level')

      if (timeRange) {
        query = query
          .gte('timestamp', timeRange.start)
          .lte('timestamp', timeRange.end)
      }

      const { data, error } = await query

      if (error) throw error

      const distribution = data?.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1
        return acc
      }, {} as Record<LogLevel, number>) || {}

      return { distribution, error: null }
    } catch (error) {
      console.error('Get log levels distribution error:', error)
      return { distribution: {}, error: error as Error }
    }
  }

  // Delete old logs (cleanup)
  static async deleteOldLogs(olderThan: string) {
    try {
      const { error } = await supabaseAdmin
        .from('logs')
        .delete()
        .lt('timestamp', olderThan)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Delete old logs error:', error)
      return { error: error as Error }
    }
  }

  // Search logs with advanced query
  static async searchLogs(query: string, filters: LogFilter = {}) {
    try {
      let supabaseQuery = supabase
        .from('logs')
        .select('*')

      // Full-text search
      if (query) {
        supabaseQuery = supabaseQuery.textSearch('message', query)
      }

      // Apply additional filters
      if (filters.level && filters.level.length > 0) {
        supabaseQuery = supabaseQuery.in('level', filters.level)
      }

      if (filters.source && filters.source.length > 0) {
        supabaseQuery = supabaseQuery.in('source', filters.source)
      }

      if (filters.timeRange) {
        supabaseQuery = supabaseQuery
          .gte('timestamp', filters.timeRange.start)
          .lte('timestamp', filters.timeRange.end)
      }

      const { data, error } = await supabaseQuery
        .order('timestamp', { ascending: false })
        .limit(1000)

      if (error) throw error
      return { logs: data || [], error: null }
    } catch (error) {
      console.error('Search logs error:', error)
      return { logs: [], error: error as Error }
    }
  }

  // Get logs by trace ID
  static async getLogsByTraceId(traceId: string) {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('trace_id', traceId)
        .order('timestamp', { ascending: true })

      if (error) throw error
      return { logs: data || [], error: null }
    } catch (error) {
      console.error('Get logs by trace ID error:', error)
      return { logs: [], error: error as Error }
    }
  }

  // Get logs by session ID
  static async getLogsBySessionId(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })

      if (error) throw error
      return { logs: data || [], error: null }
    } catch (error) {
      console.error('Get logs by session ID error:', error)
      return { logs: [], error: error as Error }
    }
  }
}
