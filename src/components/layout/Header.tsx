'use client'

import React from 'react'
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  description?: string
  actions?: React.ReactNode
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

export function Header({ 
  title, 
  description, 
  actions, 
  onToggleSidebar,
  sidebarCollapsed 
}: HeaderProps) {
  const [isDark, setIsDark] = React.useState(true)

  const toggleTheme = () => {
    setIsDark(!isDark)
    // In a real app, you'd update the theme context/store here
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-background-secondary">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page Title */}
          {title && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-text-primary">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-gray-500 dark:text-text-secondary">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="hidden flex-1 max-w-lg mx-8 md:block">
          <Input
            type="text"
            placeholder="Search logs, incidents, monitors..."
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Search button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary md:hidden"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-status-error"></span>
          </Button>

          {/* Custom Actions */}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
