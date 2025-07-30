'use client'

import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { IncidentCard } from '@/components/incidents/IncidentCard'
import { IncidentFilters } from '@/components/incidents/IncidentFilters'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import type { Incident } from '@/types'

// Mock data
const generateMockIncidents = (): Incident[] => {
  const titles = [
    'API Response Time High',
    'Database Connection Pool Exhausted',
    'SSL Certificate Expiring Soon',
    'Memory Usage Critical',
    'Disk Space Low',
    'Service Unavailable',
    'Authentication Service Down',
    'Payment Gateway Timeout',
    'Cache Server Unreachable',
    'Load Balancer Health Check Failed'
  ]

  const sources = [
    'api.example.com',
    'db-prod-01',
    'www.example.com',
    'worker-02',
    'auth-service',
    'payment-gateway',
    'cache-redis-01',
    'lb-nginx-01'
  ]

  const statuses: Incident['status'][] = ['triggered', 'acknowledged', 'resolved']
  const severities: Incident['severity'][] = ['p1', 'p2', 'p3', 'p4']

  return Array.from({ length: 20 }, (_, i) => {
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      id: `inc-${i + 1}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: Math.random() > 0.5 ? 'Automated alert triggered by monitoring system' : undefined,
      status,
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      assigneeId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 5) + 1}` : undefined,
      assignee: Math.random() > 0.3 ? {
        id: `user-${Math.floor(Math.random() * 5) + 1}`,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'sre',
        companySize: '51-200',
        createdAt,
        updatedAt: createdAt,
      } : undefined,
      createdAt,
      updatedAt: createdAt,
      resolvedAt: status === 'resolved' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
      timeline: [
        {
          id: `timeline-${i}-1`,
          type: 'created',
          message: 'Incident created automatically',
          timestamp: createdAt,
        }
      ],
      metadata: {
        alertId: `alert-${Math.random().toString(36).substr(2, 9)}`,
        monitorId: `monitor-${Math.floor(Math.random() * 10) + 1}`,
      }
    }
  })
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filters, setFilters] = useState<any>({})
  const [loading, setLoading] = useState(false)

  // Initialize data
  useEffect(() => {
    setIncidents(generateMockIncidents())
  }, [])

  // Filter incidents based on current filters
  const filteredIncidents = incidents.filter(incident => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!incident.title.toLowerCase().includes(searchLower) &&
          !incident.source.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(incident.status)) {
        return false
      }
    }

    // Severity filter
    if (filters.severity && filters.severity.length > 0) {
      if (!filters.severity.includes(incident.severity)) {
        return false
      }
    }

    // Time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date()
      const incidentDate = new Date(incident.createdAt)
      
      switch (filters.timeRange) {
        case 'today':
          if (incidentDate.toDateString() !== now.toDateString()) {
            return false
          }
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (incidentDate < weekAgo) {
            return false
          }
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (incidentDate < monthAgo) {
            return false
          }
          break
      }
    }

    return true
  })

  // Calculate stats
  const stats = {
    total: filteredIncidents.length,
    triggered: filteredIncidents.filter(i => i.status === 'triggered').length,
    acknowledged: filteredIncidents.filter(i => i.status === 'acknowledged').length,
    resolved: filteredIncidents.filter(i => i.status === 'resolved').length,
  }

  const handleStatusChange = async (incidentId: string, status: Incident['status']) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            status,
            updatedAt: new Date().toISOString(),
            resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
            timeline: [
              ...incident.timeline,
              {
                id: `timeline-${Date.now()}`,
                type: status === 'acknowledged' ? 'acknowledged' : 'resolved',
                message: `Incident ${status}`,
                timestamp: new Date().toISOString(),
              }
            ]
          }
        : incident
    ))
    setLoading(false)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  return (
    <AppLayout
      title="Incidents"
      description={`${stats.total} incidents found`}
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Incident
        </Button>
      }
    >
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-text-secondary">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">
                    {stats.total}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-text-secondary">
                    Triggered
                  </p>
                  <p className="text-2xl font-bold text-status-triggered">
                    {stats.triggered}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-status-triggered" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-text-secondary">
                    Acknowledged
                  </p>
                  <p className="text-2xl font-bold text-status-acknowledged">
                    {stats.acknowledged}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-status-acknowledged" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-text-secondary">
                    Resolved
                  </p>
                  <p className="text-2xl font-bold text-status-resolved">
                    {stats.resolved}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-status-resolved" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <IncidentFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Incidents List */}
        <div className="space-y-4">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-text-primary">
                No incidents found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-text-secondary">
                No incidents match your current filters.
              </p>
              <div className="mt-6">
                <Button onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            filteredIncidents
              .sort((a, b) => {
                // Sort by status priority (triggered > acknowledged > resolved)
                const statusPriority = { triggered: 3, acknowledged: 2, resolved: 1 }
                const statusDiff = statusPriority[b.status] - statusPriority[a.status]
                if (statusDiff !== 0) return statusDiff
                
                // Then by creation date (newest first)
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              })
              .map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onStatusChange={handleStatusChange}
                />
              ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
