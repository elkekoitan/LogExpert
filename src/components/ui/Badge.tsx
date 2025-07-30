'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        primary:
          'border-transparent bg-primary-500 text-white',
        secondary:
          'border-transparent bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
        success:
          'border-transparent bg-status-success text-white',
        warning:
          'border-transparent bg-status-warning text-white',
        error:
          'border-transparent bg-status-error text-white',
        info:
          'border-transparent bg-status-info text-white',
        outline:
          'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
        // Status-specific variants
        triggered:
          'border-transparent bg-status-triggered text-white',
        acknowledged:
          'border-transparent bg-status-acknowledged text-white',
        resolved:
          'border-transparent bg-status-resolved text-white',
        // Severity variants
        p1: 'border-transparent bg-severity-p1 text-white',
        p2: 'border-transparent bg-severity-p2 text-white',
        p3: 'border-transparent bg-severity-p3 text-white',
        p4: 'border-transparent bg-severity-p4 text-white',
        // Log level variants
        trace: 'border-transparent bg-gray-400 text-white',
        debug: 'border-transparent bg-gray-500 text-white',
        info: 'border-transparent bg-status-info text-white',
        warn: 'border-transparent bg-status-warning text-white',
        error: 'border-transparent bg-status-error text-white',
        fatal: 'border-transparent bg-red-800 text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
