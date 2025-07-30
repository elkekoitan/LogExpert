'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Phone, 
  Calendar, 
  Clock,
  User,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Mock data
const scheduleData = {
  currentWeek: {
    start: '2024-01-15',
    end: '2024-01-21',
  },
  schedule: [
    {
      day: 'Monday',
      date: '2024-01-15',
      primary: { name: 'John Doe', avatar: 'JD', status: 'active' },
      secondary: { name: 'Jane Smith', avatar: 'JS', status: 'backup' },
    },
    {
      day: 'Tuesday',
      date: '2024-01-16',
      primary: { name: 'John Doe', avatar: 'JD', status: 'active' },
      secondary: { name: 'Jane Smith', avatar: 'JS', status: 'backup' },
    },
    {
      day: 'Wednesday',
      date: '2024-01-17',
      primary: { name: 'Mike Johnson', avatar: 'MJ', status: 'active' },
      secondary: { name: 'Sarah Wilson', avatar: 'SW', status: 'backup' },
    },
    {
      day: 'Thursday',
      date: '2024-01-18',
      primary: { name: 'Mike Johnson', avatar: 'MJ', status: 'active' },
      secondary: { name: 'Sarah Wilson', avatar: 'SW', status: 'backup' },
    },
    {
      day: 'Friday',
      date: '2024-01-19',
      primary: { name: 'Sarah Wilson', avatar: 'SW', status: 'active' },
      secondary: { name: 'John Doe', avatar: 'JD', status: 'backup' },
    },
    {
      day: 'Saturday',
      date: '2024-01-20',
      primary: { name: 'Sarah Wilson', avatar: 'SW', status: 'active' },
      secondary: { name: 'John Doe', avatar: 'JD', status: 'backup' },
    },
    {
      day: 'Sunday',
      date: '2024-01-21',
      primary: { name: 'Jane Smith', avatar: 'JS', status: 'active' },
      secondary: { name: 'Mike Johnson', avatar: 'MJ', status: 'backup' },
    },
  ],
  team: [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'SRE', phone: '+1 (555) 123-4567' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'DevOps', phone: '+1 (555) 234-5678' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Engineer', phone: '+1 (555) 345-6789' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'SRE', phone: '+1 (555) 456-7890' },
  ]
}

export default function OnCallPage() {
  const [currentWeek, setCurrentWeek] = useState(0)

  const getCurrentOnCall = () => {
    const today = new Date().getDay()
    const todaySchedule = scheduleData.schedule[today === 0 ? 6 : today - 1] // Adjust for Sunday = 0
    return todaySchedule
  }

  const currentOnCall = getCurrentOnCall()

  return (
    <AppLayout
      title="On-call Schedule"
      description="Manage your team's on-call rotation and escalation policies"
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Export Schedule
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Current On-call Status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Currently On-call
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white font-semibold">
                    {currentOnCall.primary.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">
                      {currentOnCall.primary.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-text-muted">
                      Primary on-call
                    </p>
                  </div>
                </div>
                <Badge variant="success" className="flex items-center">
                  <div className="w-2 h-2 bg-status-success rounded-full mr-2"></div>
                  Active
                </Badge>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">
                    {currentOnCall.secondary.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
                      {currentOnCall.secondary.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-text-muted">
                      Secondary on-call
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-text-secondary">
                  Team Members
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-text-primary">
                  {scheduleData.team.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-text-secondary">
                  Active Schedules
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-text-primary">
                  1
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-text-secondary">
                  This Week
                </span>
                <span className="text-sm text-gray-900 dark:text-text-primary">
                  Jan 15 - 21
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weekly Schedule</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-4">
                  January 15 - 21, 2024
                </span>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
              {scheduleData.schedule.map((day, index) => {
                const isToday = new Date().toDateString() === new Date(day.date).toDateString()
                
                return (
                  <div
                    key={day.date}
                    className={`p-4 rounded-lg border ${
                      isToday 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-text-primary">
                        {day.day}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-text-muted">
                        {new Date(day.date).getDate()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-xs font-medium">
                          {day.primary.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-text-primary truncate">
                            {day.primary.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-text-muted">
                            Primary
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">
                          {day.secondary.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-text-primary truncate">
                            {day.secondary.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-text-muted">
                            Secondary
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {scheduleData.team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-text-primary">
                      {member.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-text-muted">
                      {member.role}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-text-muted">
                      {member.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-text-muted">
                      {member.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
