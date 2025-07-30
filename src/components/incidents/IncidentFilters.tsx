'use client'

import React from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Incident } from '@/types'

interface IncidentFiltersProps {
  filters: {
    search?: string
    status?: Incident['status'][]
    severity?: Incident['severity'][]
    assignee?: string[]
    timeRange?: string
  }
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

const statusOptions = [
  { value: 'triggered', label: 'Triggered' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
]

const severityOptions = [
  { value: 'p1', label: 'P1 - Critical' },
  { value: 'p2', label: 'P2 - High' },
  { value: 'p3', label: 'P3 - Medium' },
  { value: 'p4', label: 'P4 - Low' },
]

const timeRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

export function IncidentFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: IncidentFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    })
  }

  const handleStatusToggle = (status: Incident['status']) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    
    onFiltersChange({
      ...filters,
      status: newStatuses,
    })
  }

  const handleSeverityToggle = (severity: Incident['severity']) => {
    const currentSeverities = filters.severity || []
    const newSeverities = currentSeverities.includes(severity)
      ? currentSeverities.filter(s => s !== severity)
      : [...currentSeverities, severity]
    
    onFiltersChange({
      ...filters,
      severity: newSeverities,
    })
  }

  const handleTimeRangeSelect = (value: string) => {
    onFiltersChange({
      ...filters,
      timeRange: value,
    })
  }

  const hasActiveFilters = () => {
    return (
      (filters.status && filters.status.length > 0) ||
      (filters.severity && filters.severity.length > 0) ||
      (filters.search && filters.search.length > 0) ||
      (filters.timeRange && filters.timeRange !== 'all')
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Time Range */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search incidents..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Dropdown
            options={timeRangeOptions}
            value={filters.timeRange || 'all'}
            onSelect={handleTimeRangeSelect}
            className="w-40"
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
      <div className="space-y-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-text-secondary">
            Status:
          </span>
          {statusOptions.map((status) => {
            const isSelected = filters.status?.includes(status.value as Incident['status'])
            return (
              <button
                key={status.value}
                onClick={() => handleStatusToggle(status.value as Incident['status'])}
                className={cn(
                  'px-3 py-1 text-xs rounded-full border transition-colors',
                  isSelected
                    ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-500/20 dark:border-primary-500 dark:text-primary-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {status.label}
              </button>
            )
          })}
        </div>

        {/* Severity Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-text-secondary">
            Severity:
          </span>
          {severityOptions.map((severity) => {
            const isSelected = filters.severity?.includes(severity.value as Incident['severity'])
            return (
              <button
                key={severity.value}
                onClick={() => handleSeverityToggle(severity.value as Incident['severity'])}
                className={cn(
                  'px-3 py-1 text-xs rounded-full border transition-colors',
                  isSelected
                    ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-500/20 dark:border-primary-500 dark:text-primary-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {severity.label}
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
          
          {filters.status?.map((status) => (
            <Badge
              key={status}
              variant="outline"
              className="text-xs"
            >
              status:{status}
              <button
                onClick={() => handleStatusToggle(status)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.severity?.map((severity) => (
            <Badge
              key={severity}
              variant="outline"
              className="text-xs"
            >
              severity:{severity}
              <button
                onClick={() => handleSeverityToggle(severity)}
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
