'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  Monitor, 
  Phone, 
  Settings, 
  HelpCircle,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview and metrics'
  },
  {
    name: 'Logs',
    href: '/logs',
    icon: FileText,
    description: 'Search and analyze logs'
  },
  {
    name: 'Incidents',
    href: '/incidents',
    icon: AlertTriangle,
    badge: '3',
    description: 'Manage incidents and alerts'
  },
  {
    name: 'Monitors',
    href: '/monitors',
    icon: Monitor,
    description: 'Uptime and performance monitoring'
  },
  {
    name: 'On-call',
    href: '/on-call',
    icon: Phone,
    description: 'Schedule and escalation'
  },
]

const bottomNavigation: NavItem[] = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account and preferences'
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Documentation and support'
  },
]

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      'flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-background-secondary',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-text-primary">
              LogExpert
            </span>
          </div>
        )}
        
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 mx-auto">
            <FileText className="h-5 w-5 text-white" />
          </div>
        )}
        
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              'text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary',
              collapsed && 'hidden'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-text-secondary dark:hover:bg-background-tertiary dark:hover:text-text-primary'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-400 group-hover:text-gray-500 dark:text-text-muted dark:group-hover:text-text-secondary'
              )} />
              
              {!collapsed && (
                <>
                  <span className="ml-3 flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-3 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 px-2 py-4 dark:border-gray-700">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-text-secondary dark:hover:bg-background-tertiary dark:hover:text-text-primary'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-400 group-hover:text-gray-500 dark:text-text-muted dark:group-hover:text-text-secondary'
              )} />
              
              {!collapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-gray-600 hover:text-gray-900 dark:text-text-secondary dark:hover:text-text-primary"
          >
            <User className="h-5 w-5" />
          </Button>
        ) : (
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
                John Doe
              </p>
              <p className="text-xs text-gray-500 dark:text-text-muted">
                john@example.com
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Collapse Toggle (when collapsed) */}
      {collapsed && onToggleCollapse && (
        <div className="border-t border-gray-200 p-2 dark:border-gray-700">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-full text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
