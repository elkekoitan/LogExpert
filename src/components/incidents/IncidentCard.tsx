'use client'

import React from 'react'
import Link from 'next/link'
import { 
  AlertTriangle, 
  Clock, 
  User, 
  MoreHorizontal,
  CheckCircle,
  UserCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatRelativeTime, formatDuration, getIncidentStatusColor } from '@/lib/utils'
import type { Incident } from '@/types'

interface IncidentCardProps {
  incident: Incident
  onStatusChange?: (incidentId: string, status: Incident['status']) => void
  onAssigneeChange?: (incidentId: string, assigneeId: string) => void
}

export function IncidentCard({ 
  incident, 
  onStatusChange, 
  onAssigneeChange 
}: IncidentCardProps) {
  const getStatusIcon = (status: Incident['status']) => {
    switch (status) {
      case 'triggered':
        return <AlertTriangle className="h-4 w-4" />
      case 'acknowledged':
        return <UserCheck className="h-4 w-4" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'p1':
        return 'bg-severity-p1 text-white'
      case 'p2':
        return 'bg-severity-p2 text-white'
      case 'p3':
        return 'bg-severity-p3 text-white'
      case 'p4':
        return 'bg-severity-p4 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const handleAcknowledge = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onStatusChange) {
      onStatusChange(incident.id, 'acknowledged')
    }
  }

  const handleResolve = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onStatusChange) {
      onStatusChange(incident.id, 'resolved')
    }
  }

  const duration = incident.resolvedAt 
    ? new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()
    : Date.now() - new Date(incident.createdAt).getTime()

  return (
    <Link href={`/incidents/${incident.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* Left side - Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                {/* Status Badge */}
                <Badge 
                  variant={incident.status as any}
                  className="flex items-center space-x-1"
                >
                  {getStatusIcon(incident.status)}
                  <span className="capitalize">{incident.status}</span>
                </Badge>

                {/* Severity Badge */}
                <Badge 
                  className={getSeverityColor(incident.severity)}
                  size="sm"
                >
                  {incident.severity.toUpperCase()}
                </Badge>

                {/* Duration */}
                <div className="flex items-center text-xs text-gray-500 dark:text-text-muted">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(duration)}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-1 truncate">
                {incident.title}
              </h3>

              {/* Description */}
              {incident.description && (
                <p className="text-sm text-gray-600 dark:text-text-secondary mb-3 line-clamp-2">
                  {incident.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-text-muted">
                <span>
                  <strong>Source:</strong> {incident.source}
                </span>
                <span>
                  <strong>Created:</strong> {formatRelativeTime(incident.createdAt)}
                </span>
                {incident.assignee && (
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span>{incident.assignee.firstName} {incident.assignee.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Quick Actions */}
              {incident.status === 'triggered' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAcknowledge}
                  className="text-xs"
                >
                  Acknowledge
                </Button>
              )}

              {incident.status !== 'resolved' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResolve}
                  className="text-xs"
                >
                  Resolve
                </Button>
              )}

              {/* More Actions */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Open dropdown menu
                }}
                className="h-8 w-8"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timeline Preview */}
          {incident.timeline && incident.timeline.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-text-muted">
                Latest: {incident.timeline[incident.timeline.length - 1].message}
                <span className="ml-2">
                  {formatRelativeTime(incident.timeline[incident.timeline.length - 1].timestamp)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
