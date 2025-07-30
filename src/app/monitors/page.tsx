'use client'

import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  Plus, 
  Monitor, 
  Globe, 
  Shield, 
  Wifi, 
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Play
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { Monitor as MonitorType } from '@/types'

// Mock data
const generateMockMonitors = (): MonitorType[] => {
  const names = [
    'API Health Check',
    'Website Uptime',
    'Database Connection',
    'Payment Gateway',
    'Authentication Service',
    'CDN Performance',
    'SSL Certificate',
    'Load Balancer',
    'Cache Server',
    'Email Service'
  ]

  const urls = [
    'https://api.example.com/health',
    'https://www.example.com',
    'tcp://db.example.com:5432',
    'https://payments.example.com/status',
    'https://auth.example.com/health',
    'https://cdn.example.com',
    'https://www.example.com',
    'https://lb.example.com/health',
    'tcp://cache.example.com:6379',
    'https://mail.example.com/health'
  ]

  const types: MonitorType['type'][] = ['http', 'ping', 'tcp', 'ssl']
  const statuses: MonitorType['status'][] = ['up', 'down', 'paused']

  return Array.from({ length: 10 }, (_, i) => ({
    id: `monitor-${i + 1}`,
    name: names[i],
    type: types[Math.floor(Math.random() * types.length)],
    url: urls[i],
    config: {
      interval: [60, 300, 600][Math.floor(Math.random() * 3)],
      timeout: [5, 10, 30][Math.floor(Math.random() * 3)],
      retries: [1, 2, 3][Math.floor(Math.random() * 3)],
      expectedStatusCode: 200,
    },
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastCheck: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
    nextCheck: new Date(Date.now() + Math.random() * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<MonitorType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | MonitorType['status']>('all')

  useEffect(() => {
    setMonitors(generateMockMonitors())
  }, [])

  const filteredMonitors = monitors.filter(monitor => {
    const matchesSearch = monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         monitor.url?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || monitor.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: monitors.length,
    up: monitors.filter(m => m.status === 'up').length,
    down: monitors.filter(m => m.status === 'down').length,
    paused: monitors.filter(m => m.status === 'paused').length,
  }

  const getStatusIcon = (status: MonitorType['status']) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="h-4 w-4 text-status-success" />
      case 'down':
        return <XCircle className="h-4 w-4 text-status-error" />
      case 'paused':
        return <Pause className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: MonitorType['type']) => {
    switch (type) {
      case 'http':
        return <Globe className="h-4 w-4" />
      case 'ping':
        return <Wifi className="h-4 w-4" />
      case 'tcp':
        return <Monitor className="h-4 w-4" />
      case 'ssl':
        return <Shield className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const handleToggleStatus = (monitorId: string) => {
    setMonitors(prev => prev.map(monitor => 
      monitor.id === monitorId 
        ? { 
            ...monitor, 
            status: monitor.status === 'paused' ? 'up' : 'paused',
            updatedAt: new Date().toISOString()
          }
        : monitor
    ))
  }

  return (
    <AppLayout
      title="Monitors"
      description={`${stats.total} monitors • ${stats.up} up • ${stats.down} down`}
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Monitor
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
                    Total Monitors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">
                    {stats.total}
                  </p>
                </div>
                <Monitor className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-text-secondary">
                    Up
                  </p>
                  <p className="text-2xl font-bold text-status-success">
                    {stats.up}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-status-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-text-secondary">
                    Down
                  </p>
                  <p className="text-2xl font-bold text-status-error">
                    {stats.down}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-status-error" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-text-secondary">
                    Paused
                  </p>
                  <p className="text-2xl font-bold text-gray-500">
                    {stats.paused}
                  </p>
                </div>
                <Pause className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search monitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'up', 'down', 'paused'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Monitors Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredMonitors.map((monitor) => (
            <Card key={monitor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(monitor.status)}
                      <Badge 
                        variant={monitor.status === 'up' ? 'success' : monitor.status === 'down' ? 'error' : 'default'}
                        className="capitalize"
                      >
                        {monitor.status}
                      </Badge>
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-text-muted">
                        {getTypeIcon(monitor.type)}
                        <span className="text-xs uppercase">{monitor.type}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-1">
                      {monitor.name}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-text-secondary mb-3 truncate">
                      {monitor.url}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-text-muted">
                      <div>
                        <span className="font-medium">Interval:</span> {monitor.config.interval}s
                      </div>
                      <div>
                        <span className="font-medium">Timeout:</span> {monitor.config.timeout}s
                      </div>
                      <div>
                        <span className="font-medium">Last Check:</span> {formatRelativeTime(monitor.lastCheck!)}
                      </div>
                      <div>
                        <span className="font-medium">Next Check:</span> {formatRelativeTime(monitor.nextCheck!)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(monitor.id)}
                    >
                      {monitor.status === 'paused' ? (
                        <>
                          <Play className="mr-1 h-3 w-3" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="mr-1 h-3 w-3" />
                          Pause
                        </>
                      )}
                    </Button>

                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Uptime Chart Placeholder */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500 dark:text-text-muted">
                      Uptime Chart (Last 24h)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMonitors.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-text-primary">
              No monitors found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-text-secondary">
              {searchTerm ? 'No monitors match your search.' : 'Get started by creating your first monitor.'}
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Monitor
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
