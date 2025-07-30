'use client'

import React from 'react'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingLayoutProps {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
  title: string
  subtitle?: string
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-text-primary">LogExpert</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-8 rounded-full transition-colors',
                  i < currentStep
                    ? 'bg-primary-500'
                    : i === currentStep
                    ? 'bg-primary-300'
                    : 'bg-gray-300 dark:bg-gray-600'
                )}
              />
            ))}
          </div>
          <p className="text-center text-sm text-text-muted">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>

        {/* Content */}
        <div className="glass-effect rounded-xl border border-gray-200/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
