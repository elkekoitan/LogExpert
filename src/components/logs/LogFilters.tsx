'use client'

import React from 'react'
import { Search, Filter, Calendar, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { LogFilter, LogLevel } from '@/types'

interface LogFiltersProps {
  filters: LogFilter
  onFiltersChange: (filters: LogFilter) => void
  onClearFilters: () => void
}

const logLevels: { value: LogLevel; label: string }[] = [
  { value: 'trace', label: 'Trace' },
  { value: 'debug', label: 'Debug' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
  { value: 'fatal', label: 'Fatal' },
]

const timeRanges = [
  { value: 'last-15m', label: 'Last 15 minutes' },
  { value: 'last-1h', label: 'Last hour' },
  { value: 'last-4h', label: 'Last 4 hours' },
  { value: 'last-24h', label: 'Last 24 hours' },
  { value: 'last-7d', label: 'Last 7 days' },
  { value: 'custom', label: 'Custom range' },
]

const commonSources = [
  { value: 'api-server', label: 'API Server' },
  { value: 'worker', label: 'Worker' },
  { value: 'database', label: 'Database' },
  { value: 'auth-service', label: 'Auth Service' },
  { value: 'payment-gateway', label: 'Payment Gateway' },
]

export function LogFilters({ filters, onFiltersChange, onClearFilters }: LogFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    })
  }

  const handleLevelToggle = (level: LogLevel) => {
    const currentLevels = filters.level || []
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level]
    
    onFiltersChange({
      ...filters,
      level: newLevels,
    })
  }

  const handleSourceToggle = (source: string) => {
    const currentSources = filters.source || []
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source]
    
    onFiltersChange({
      ...filters,
      source: newSources,
    })
  }

  const handleTimeRangeSelect = (value: string) => {
    // Convert time range to actual dates
    const now = new Date()
    let start: Date
    
    switch (value) {
      case 'last-15m':
        start = new Date(now.getTime() - 15 * 60 * 1000)
        break
      case 'last-1h':
        start = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case 'last-4h':
        start = new Date(now.getTime() - 4 * 60 * 60 * 1000)
        break
      case 'last-24h':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'last-7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      default:
        return // Handle custom range separately
    }
    
    onFiltersChange({
      ...filters,
      timeRange: {
        start: start.toISOString(),
        end: now.toISOString(),
      },
    })
  }

  const hasActiveFilters = () => {
    return (
      (filters.level && filters.level.length > 0) ||
      (filters.source && filters.source.length > 0) ||
      (filters.search && filters.search.length > 0) ||
      filters.timeRange
    )
  }

  const getSelectedTimeRange = () => {
    if (!filters.timeRange) return 'last-1h'
    
    const now = new Date()
    const start = new Date(filters.timeRange.start)
    const diffMs = now.getTime() - start.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes <= 15) return 'last-15m'
    if (diffMinutes <= 60) return 'last-1h'
    if (diffMinutes <= 240) return 'last-4h'
    if (diffMinutes <= 1440) return 'last-24h'
    if (diffMinutes <= 10080) return 'last-7d'
    return 'custom'
  }

  return (
    <div className="space-y-4">
      {/* Search and Time Range */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search logs... (e.g., level:error, user_id:123)"
            value={filters.search || ''}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Dropdown
            options={timeRanges}
            value={getSelectedTimeRange()}
            onSelect={handleTimeRangeSelect}
            className="w-48"
          />
          
          {hasActiveFilters() && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {/* Log Level Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-text-secondary">
            Level:
          </span>
          {logLevels.map((level) => {
            const isSelected = filters.level?.includes(level.value)
            return (
              <button
                key={level.value}
                onClick={() => handleLevelToggle(level.value)}
                className={cn(
                  'px-3 py-1 text-xs rounded-full border transition-colors',
                  isSelected
                    ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-500/20 dark:border-primary-500 dark:text-primary-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {level.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Source Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-text-secondary">
            Source:
          </span>
          {commonSources.map((source) => {
            const isSelected = filters.source?.includes(source.value)
            return (
              <button
                key={source.value}
                onClick={() => handleSourceToggle(source.value)}
                className={cn(
                  'px-3 py-1 text-xs rounded-full border transition-colors',
                  isSelected
                    ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-500/20 dark:border-primary-500 dark:text-primary-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {source.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-text-muted">
            Active filters:
          </span>
          
          {filters.level?.map((level) => (
            <Badge
              key={level}
              variant="outline"
              className="text-xs"
            >
              level:{level}
              <button
                onClick={() => handleLevelToggle(level)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.source?.map((source) => (
            <Badge
              key={source}
              variant="outline"
              className="text-xs"
            >
              source:{source}
              <button
                onClick={() => handleSourceToggle(source)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
