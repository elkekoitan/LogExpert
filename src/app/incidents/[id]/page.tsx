'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  UserCheck,
  Clock,
  User,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  MessageCircle,
  Bell
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { formatRelativeTime, formatDuration } from '@/lib/utils'
import type { Incident, IncidentTimelineEntry } from '@/types'

// Mock incident data
const getMockIncident = (id: string): Incident => ({
  id,
  title: 'API Response Time High',
  description: 'API response times have exceeded the 95th percentile threshold of 500ms for the past 15 minutes. This is affecting user experience and may lead to timeouts.',
  status: 'triggered',
  severity: 'p1',
  source: 'api.example.com',
  assigneeId: 'user-1',
  assignee: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'sre',
    companySize: '51-200',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  createdAt: '2024-01-15T14:30:00Z',
  updatedAt: '2024-01-15T14:30:00Z',
  timeline: [
    {
      id: 'timeline-1',
      type: 'created',
      message: 'Incident created automatically by monitor: API Response Time',
      timestamp: '2024-01-15T14:30:00Z',
    },
    {
      id: 'timeline-2',
      type: 'notification_sent',
      message: 'Notifications sent to John Doe, Jane Smith via Slack, Email',
      timestamp: '2024-01-15T14:30:30Z',
    },
    {
      id: 'timeline-3',
      type: 'comment',
      message: 'Investigating the issue. Response times are 3x normal. Checking database connections.',
      userId: 'user-1',
      user: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'sre',
        companySize: '51-200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      timestamp: '2024-01-15T14:45:00Z',
    },
  ],
  metadata: {
    alertId: 'alert-12345',
    monitorId: 'monitor-api-response-time',
    threshold: '500ms',
    currentValue: '1.2s',
  }
})

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      setIncident(getMockIncident(params.id as string))
    }
  }, [params.id])

  if (!incident) {
    return <div>Loading...</div>
  }

  const handleStatusChange = async (status: Incident['status']) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newTimelineEntry: IncidentTimelineEntry = {
      id: `timeline-${Date.now()}`,
      type: status === 'acknowledged' ? 'acknowledged' : 'resolved',
      message: `Incident ${status}`,
      userId: 'current-user',
      timestamp: new Date().toISOString(),
    }

    setIncident(prev => prev ? {
      ...prev,
      status,
      updatedAt: new Date().toISOString(),
      resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
      timeline: [...prev.timeline, newTimelineEntry]
    } : null)
    
    setLoading(false)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const commentEntry: IncidentTimelineEntry = {
      id: `timeline-${Date.now()}`,
      type: 'comment',
      message: newComment,
      userId: 'current-user',
      timestamp: new Date().toISOString(),
    }

    setIncident(prev => prev ? {
      ...prev,
      timeline: [...prev.timeline, commentEntry]
    } : null)
    
    setNewComment('')
    setLoading(false)
  }

  const getStatusIcon = (status: Incident['status']) => {
    switch (status) {
      case 'triggered':
        return <AlertTriangle className="h-5 w-5" />
      case 'acknowledged':
        return <UserCheck className="h-5 w-5" />
      case 'resolved':
        return <CheckCircle className="h-5 w-5" />
    }
  }

  const getTimelineIcon = (type: IncidentTimelineEntry['type']) => {
    switch (type) {
      case 'created':
        return <AlertTriangle className="h-4 w-4 text-status-triggered" />
      case 'acknowledged':
        return <UserCheck className="h-4 w-4 text-status-acknowledged" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-status-resolved" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'notification_sent':
        return <Bell className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const duration = incident.resolvedAt 
    ? new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()
    : Date.now() - new Date(incident.createdAt).getTime()

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Badge 
                  variant={incident.status as any}
                  className="flex items-center space-x-1"
                >
                  {getStatusIcon(incident.status)}
                  <span className="capitalize">{incident.status}</span>
                </Badge>
                
                <Badge 
                  variant={incident.severity as any}
                  size="sm"
                >
                  {incident.severity.toUpperCase()}
                </Badge>
                
                <span className="text-sm text-gray-500 dark:text-text-muted">
                  #{incident.id}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">
                {incident.title}
              </h1>

              {incident.description && (
                <p className="text-gray-600 dark:text-text-secondary">
                  {incident.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {incident.status === 'triggered' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('acknowledged')}
                  loading={loading}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Acknowledge
                </Button>
              )}

              {incident.status !== 'resolved' && (
                <Button
                  onClick={() => handleStatusChange('resolved')}
                  loading={loading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resolve
                </Button>
              )}

              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incident.timeline.map((entry, index) => (
                    <div key={entry.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                          {getTimelineIcon(entry.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
                            {entry.type === 'comment' && entry.user 
                              ? `${entry.user.firstName} ${entry.user.lastName} commented`
                              : entry.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                            }
                          </p>
                          <time className="text-xs text-gray-500 dark:text-text-muted">
                            {formatRelativeTime(entry.timestamp)}
                          </time>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-text-secondary mt-1">
                          {entry.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleAddComment()
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      loading={loading}
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Incident Details */}
            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-text-muted">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant={incident.status as any}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-text-muted">
                    Severity
                  </label>
                  <div className="mt-1">
                    <Badge variant={incident.severity as any}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-text-muted">
                    Assignee
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    {incident.assignee ? (
                      <>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-xs">
                          {incident.assignee.firstName[0]}{incident.assignee.lastName[0]}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-text-primary">
                          {incident.assignee.firstName} {incident.assignee.lastName}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-text-muted">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-text-muted">
                    Duration
                  </label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-text-primary">
                    {formatDuration(duration)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-text-muted">
                    Created
                  </label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-text-primary">
                    {new Date(incident.createdAt).toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-text-muted">
                    Source
                  </label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-text-primary">
                    {incident.source}
                  </div>
                </div>

                {incident.metadata.monitorId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-text-muted">
                      Monitor
                    </label>
                    <div className="mt-1">
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        {incident.metadata.monitorId}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Related Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-500 dark:text-text-muted">
                    Response Time Chart
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
