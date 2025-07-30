// User and Authentication Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  companySize: CompanySize
  avatar?: string
  createdAt: string
  updatedAt: string
}

export type UserRole = 
  | 'software-engineer'
  | 'devops'
  | 'sre'
  | 'manager'
  | 'founder'
  | 'other'

export type CompanySize = 
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-1000'
  | '1000+'

export type InitialGoal = 
  | 'monitor'
  | 'logs'
  | 'oncall'

// Log Types
export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  source: string
  metadata: Record<string, any>
  tags?: string[]
  userId?: string
  sessionId?: string
  traceId?: string
  spanId?: string
}

export type LogLevel = 
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'fatal'

export interface LogFilter {
  level?: LogLevel[]
  source?: string[]
  timeRange?: TimeRange
  search?: string
  tags?: string[]
}

export interface TimeRange {
  start: string
  end: string
}

// Incident Types
export interface Incident {
  id: string
  title: string
  description?: string
  status: IncidentStatus
  severity: IncidentSeverity
  source: string
  assigneeId?: string
  assignee?: User
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  duration?: number
  timeline: IncidentTimelineEntry[]
  metadata: Record<string, any>
}

export type IncidentStatus = 
  | 'triggered'
  | 'acknowledged'
  | 'resolved'

export type IncidentSeverity = 
  | 'p1'  // Critical
  | 'p2'  // High
  | 'p3'  // Medium
  | 'p4'  // Low

export interface IncidentTimelineEntry {
  id: string
  type: IncidentTimelineType
  message: string
  userId?: string
  user?: User
  timestamp: string
  metadata?: Record<string, any>
}

export type IncidentTimelineType = 
  | 'created'
  | 'acknowledged'
  | 'resolved'
  | 'comment'
  | 'status_change'
  | 'assignment_change'
  | 'severity_change'
  | 'notification_sent'

// Monitor Types
export interface Monitor {
  id: string
  name: string
  type: MonitorType
  url?: string
  config: MonitorConfig
  status: MonitorStatus
  lastCheck?: string
  nextCheck?: string
  createdAt: string
  updatedAt: string
}

export type MonitorType = 
  | 'http'
  | 'ping'
  | 'tcp'
  | 'ssl'
  | 'keyword'

export type MonitorStatus = 
  | 'up'
  | 'down'
  | 'paused'
  | 'maintenance'

export interface MonitorConfig {
  interval: number // in seconds
  timeout: number // in seconds
  retries: number
  expectedStatusCode?: number
  expectedKeyword?: string
  headers?: Record<string, string>
}

// Dashboard and Analytics Types
export interface DashboardMetric {
  id: string
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  unit?: string
  format?: 'number' | 'percentage' | 'duration' | 'bytes'
}

export interface ChartDataPoint {
  timestamp: string
  value: number
  label?: string
}

export interface LogHistogramData {
  timestamp: string
  count: number
  level?: LogLevel
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignupForm {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  companySize: CompanySize
  initialGoal: InitialGoal
}

export interface CreateIncidentForm {
  title: string
  description?: string
  severity: IncidentSeverity
  source: string
  assigneeId?: string
}

// UI State Types
export interface UIState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  loading: boolean
  error?: string
}

// Search and Filter Types
export interface SearchQuery {
  query: string
  filters: Record<string, any>
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  pagination?: {
    page: number
    limit: number
  }
}

// Notification Types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
