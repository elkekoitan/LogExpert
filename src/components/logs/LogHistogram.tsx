'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatRelativeTime } from '@/lib/utils'
import type { LogHistogramData } from '@/types'

interface LogHistogramProps {
  data: LogHistogramData[]
  timeRange: string
  onTimeRangeSelect?: (start: string, end: string) => void
}

export function LogHistogram({ data, timeRange, onTimeRangeSelect }: LogHistogramProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-background-secondary border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
            {new Date(label).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-text-secondary">
            Logs: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const handleBarClick = (data: any) => {
    if (onTimeRangeSelect && data) {
      const startTime = new Date(data.timestamp)
      const endTime = new Date(startTime.getTime() + 60000) // 1 minute interval
      onTimeRangeSelect(startTime.toISOString(), endTime.toISOString())
    }
  }

  const formatXAxisLabel = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getBarColor = (entry: LogHistogramData) => {
    if (entry.level) {
      switch (entry.level) {
        case 'error':
        case 'fatal':
          return '#EF4444' // red
        case 'warn':
          return '#F59E0B' // orange
        case 'info':
          return '#3B82F6' // blue
        default:
          return '#6B7280' // gray
      }
    }
    return '#6A5AF9' // primary
  }

  const totalLogs = data.reduce((sum, item) => sum + item.count, 0)
  const maxCount = Math.max(...data.map(item => item.count))
  const avgCount = Math.round(totalLogs / data.length)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Log Volume</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-text-muted">
            <span>Total: <span className="font-medium text-gray-900 dark:text-text-primary">{totalLogs.toLocaleString()}</span></span>
            <span>Peak: <span className="font-medium text-gray-900 dark:text-text-primary">{maxCount.toLocaleString()}</span></span>
            <span>Avg: <span className="font-medium text-gray-900 dark:text-text-primary">{avgCount.toLocaleString()}</span></span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatXAxisLabel}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#6A5AF9"
                radius={[2, 2, 0, 0]}
                onClick={handleBarClick}
                className="cursor-pointer hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Time range indicator */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-text-muted">
          <span>
            {data.length > 0 && formatRelativeTime(data[0].timestamp)}
          </span>
          <span className="font-medium">
            {timeRange}
          </span>
          <span>
            {data.length > 0 && formatRelativeTime(data[data.length - 1].timestamp)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
