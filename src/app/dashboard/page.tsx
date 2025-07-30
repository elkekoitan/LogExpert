'use client'

import React from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  Server,
  Users,
  Plus
} from 'lucide-react'

// Mock data
const metrics = [
  {
    title: 'Total Logs',
    value: '2.4M',
    change: '+12%',
    changeType: 'increase' as const,
    icon: Activity,
  },
  {
    title: 'Active Incidents',
    value: '3',
    change: '-2',
    changeType: 'decrease' as const,
    icon: AlertTriangle,
  },
  {
    title: 'Uptime',
    value: '99.9%',
    change: '+0.1%',
    changeType: 'increase' as const,
    icon: CheckCircle,
  },
  {
    title: 'Response Time',
    value: '245ms',
    change: '-15ms',
    changeType: 'decrease' as const,
    icon: Clock,
  },
]

const recentIncidents = [
  {
    id: 'INC-001',
    title: 'API Response Time High',
    status: 'triggered' as const,
    severity: 'p1' as const,
    time: '2 hours ago',
  },
  {
    id: 'INC-002',
    title: 'Database Connection Pool Exhausted',
    status: 'acknowledged' as const,
    severity: 'p2' as const,
    time: '4 hours ago',
  },
  {
    id: 'INC-003',
    title: 'SSL Certificate Expiring Soon',
    status: 'resolved' as const,
    severity: 'p3' as const,
    time: '1 day ago',
  },
]

const recentLogs = [
  {
    id: '1',
    timestamp: '2024-01-15 14:30:25',
    level: 'error' as const,
    message: 'Failed to connect to database: connection timeout',
    source: 'api-server-01',
  },
  {
    id: '2',
    timestamp: '2024-01-15 14:29:18',
    level: 'warn' as const,
    message: 'High memory usage detected: 85% of available memory',
    source: 'worker-02',
  },
  {
    id: '3',
    timestamp: '2024-01-15 14:28:45',
    level: 'info' as const,
    message: 'User authentication successful',
    source: 'auth-service',
  },
  {
    id: '4',
    timestamp: '2024-01-15 14:27:32',
    level: 'error' as const,
    message: 'Payment processing failed: invalid card number',
    source: 'payment-gateway',
  },
]

export default function DashboardPage() {
  return (
    <AppLayout
      title="Dashboard"
      description="Overview of your logs, incidents, and system health"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Monitor
        </Button>
      }
    >
      <div className="p-6 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-text-secondary">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">
                        {metric.value}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-500/10">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="h-4 w-4 text-status-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-status-success" />
                    )}
                    <span className="ml-1 text-sm font-medium text-status-success">
                      {metric.change}
                    </span>
                    <span className="ml-1 text-sm text-gray-500 dark:text-text-muted">
                      from last week
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Incidents
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant={incident.status}>
                        {incident.status}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
                          {incident.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-text-muted">
                          {incident.id} • {incident.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant={incident.severity} size="sm">
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Logs
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={log.level === 'warn' ? 'warning' : log.level as any} size="sm">
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-text-muted">
                          {log.timestamp}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-text-muted">
                        {log.source}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-text-primary">
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-success/10">
                  <Server className="h-4 w-4 text-status-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
                    API Services
                  </p>
                  <p className="text-xs text-status-success">All systems operational</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-warning/10">
                  <Activity className="h-4 w-4 text-status-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
                    Database
                  </p>
                  <p className="text-xs text-status-warning">Minor issues detected</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-success/10">
                  <Users className="h-4 w-4 text-status-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
                    User Services
                  </p>
                  <p className="text-xs text-status-success">All systems operational</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
