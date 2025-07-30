'use client'

import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { LogEntry } from '@/components/logs/LogEntry'
import { LogHistogram } from '@/components/logs/LogHistogram'
import { LogFilters } from '@/components/logs/LogFilters'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Download, RefreshCw, Play, Pause } from 'lucide-react'
import type { LogEntry as LogEntryType, LogFilter, LogHistogramData } from '@/types'

// Mock data
const generateMockLogs = (): LogEntryType[] => {
  const sources = ['api-server-01', 'worker-02', 'auth-service', 'payment-gateway', 'database']
  const levels: LogEntryType['level'][] = ['info', 'warn', 'error', 'debug']
  const messages = [
    'User authentication successful',
    'Database connection established',
    'Payment processing completed',
    'Failed to connect to external API',
    'High memory usage detected',
    'Cache miss for user session',
    'Request processed successfully',
    'Invalid request parameters',
    'Service health check passed',
    'Background job completed'
  ]

  return Array.from({ length: 100 }, (_, i) => ({
    id: `log-${i}`,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    metadata: {
      requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
      userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
      duration: Math.floor(Math.random() * 1000),
    },
    tags: Math.random() > 0.7 ? ['production', 'critical'] : undefined,
    userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
    sessionId: Math.random() > 0.3 ? `session-${Math.random().toString(36).substr(2, 9)}` : undefined,
    traceId: Math.random() > 0.6 ? `trace-${Math.random().toString(36).substr(2, 16)}` : undefined,
  }))
}

const generateMockHistogram = (): LogHistogramData[] => {
  const now = new Date()
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toISOString(),
    count: Math.floor(Math.random() * 1000) + 100,
  }))
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntryType[]>([])
  const [histogramData, setHistogramData] = useState<LogHistogramData[]>([])
  const [filters, setFilters] = useState<LogFilter>({})
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [loading, setLoading] = useState(false)

  // Initialize data
  useEffect(() => {
    setLogs(generateMockLogs())
    setHistogramData(generateMockHistogram())
  }, [])

  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!log.message.toLowerCase().includes(searchLower) &&
          !log.source.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Level filter
    if (filters.level && filters.level.length > 0) {
      if (!filters.level.includes(log.level)) {
        return false
      }
    }

    // Source filter
    if (filters.source && filters.source.length > 0) {
      if (!filters.source.includes(log.source)) {
        return false
      }
    }

    // Time range filter
    if (filters.timeRange) {
      const logTime = new Date(log.timestamp).getTime()
      const startTime = new Date(filters.timeRange.start).getTime()
      const endTime = new Date(filters.timeRange.end).getTime()
      if (logTime < startTime || logTime > endTime) {
        return false
      }
    }

    return true
  })

  const handleToggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLogs(generateMockLogs())
    setHistogramData(generateMockHistogram())
    setLoading(false)
  }

  const handleExport = () => {
    // Export filtered logs as JSON
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `logs-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleTimeRangeSelect = (start: string, end: string) => {
    setFilters(prev => ({
      ...prev,
      timeRange: { start, end }
    }))
  }

  return (
    <AppLayout
      title="Logs"
      description={`${filteredLogs.length.toLocaleString()} logs found`}
      actions={
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={isLiveMode ? 'text-status-success' : ''}
          >
            {isLiveMode ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Live
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Paused
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Filters */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
          <LogFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Histogram */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
          <LogHistogram
            data={histogramData}
            timeRange="Last 24 hours"
            onTimeRangeSelect={handleTimeRangeSelect}
          />
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-auto">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 dark:text-text-muted">
                  No logs found matching your filters
                </p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredLogs
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((log) => (
                  <LogEntry
                    key={log.id}
                    log={log}
                    expanded={expandedLogs.has(log.id)}
                    onToggleExpand={() => handleToggleExpand(log.id)}
                    searchTerm={filters.search}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Live mode indicator */}
        {isLiveMode && (
          <div className="flex-shrink-0 p-2 bg-status-success/10 border-t border-status-success/20">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 text-status-success">
                <div className="w-2 h-2 bg-status-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live mode active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
