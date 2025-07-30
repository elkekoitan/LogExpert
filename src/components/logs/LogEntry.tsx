'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn, formatRelativeTime, getLogLevelColor } from '@/lib/utils'
import type { LogEntry as LogEntryType } from '@/types'

interface LogEntryProps {
  log: LogEntryType
  expanded?: boolean
  onToggleExpand?: () => void
  searchTerm?: string
}

export function LogEntry({ 
  log, 
  expanded = false, 
  onToggleExpand,
  searchTerm = ''
}: LogEntryProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(log, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const highlightText = (text: string, term: string) => {
    if (!term) return text
    
    const regex = new RegExp(`(${term})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-background-tertiary transition-colors">
      {/* Main log entry */}
      <div 
        className="flex items-start space-x-3 p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Expand/Collapse Icon */}
        <button className="mt-1 text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Timestamp */}
        <div className="flex-shrink-0 w-32">
          <time className="text-xs text-gray-500 dark:text-text-muted font-mono">
            {new Date(log.timestamp).toLocaleTimeString()}
          </time>
        </div>

        {/* Log Level */}
        <div className="flex-shrink-0">
          <Badge 
            variant={log.level as any}
            size="sm"
            className="font-mono"
          >
            {log.level.toUpperCase()}
          </Badge>
        </div>

        {/* Source */}
        <div className="flex-shrink-0 w-24">
          <span className="text-xs text-gray-500 dark:text-text-muted truncate">
            {log.source}
          </span>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-text-primary break-words">
            {highlightText(log.message, searchTerm)}
          </p>
          
          {/* Tags */}
          {log.tags && log.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {log.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleCopy()
            }}
            className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          {log.traceId && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-secondary"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 ml-7 border-l-2 border-gray-200 dark:border-gray-600">
          <div className="bg-gray-50 dark:bg-background-tertiary rounded-lg p-4">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div>
                <span className="font-medium text-gray-500 dark:text-text-muted">Timestamp:</span>
                <span className="ml-2 text-gray-900 dark:text-text-primary font-mono">
                  {new Date(log.timestamp).toISOString()}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-500 dark:text-text-muted">Source:</span>
                <span className="ml-2 text-gray-900 dark:text-text-primary">
                  {log.source}
                </span>
              </div>
              
              {log.userId && (
                <div>
                  <span className="font-medium text-gray-500 dark:text-text-muted">User ID:</span>
                  <span className="ml-2 text-gray-900 dark:text-text-primary font-mono">
                    {log.userId}
                  </span>
                </div>
              )}
              
              {log.sessionId && (
                <div>
                  <span className="font-medium text-gray-500 dark:text-text-muted">Session ID:</span>
                  <span className="ml-2 text-gray-900 dark:text-text-primary font-mono">
                    {log.sessionId}
                  </span>
                </div>
              )}
              
              {log.traceId && (
                <div>
                  <span className="font-medium text-gray-500 dark:text-text-muted">Trace ID:</span>
                  <span className="ml-2 text-gray-900 dark:text-text-primary font-mono">
                    {log.traceId}
                  </span>
                </div>
              )}
              
              {log.spanId && (
                <div>
                  <span className="font-medium text-gray-500 dark:text-text-muted">Span ID:</span>
                  <span className="ml-2 text-gray-900 dark:text-text-primary font-mono">
                    {log.spanId}
                  </span>
                </div>
              )}
            </div>

            {/* Full message */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">
                Message
              </h4>
              <pre className="text-sm text-gray-900 dark:text-text-primary whitespace-pre-wrap break-words">
                {log.message}
              </pre>
            </div>

            {/* Metadata JSON */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">
                  Metadata
                </h4>
                <pre className="text-xs text-gray-900 dark:text-text-primary bg-white dark:bg-background-primary rounded border p-3 overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Copy notification */}
            {copied && (
              <div className="mt-2 text-xs text-status-success">
                Copied to clipboard!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
