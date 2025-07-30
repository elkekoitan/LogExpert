import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client component client (for use in client components)
export const createSupabaseClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server component client (for use in server components)
export const createSupabaseServerClient = () => createServerClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
    },
  }
)

// Admin client (for server-side operations that require elevated permissions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: string
          company_size: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role: string
          company_size: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: string
          company_size?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      logs: {
        Row: {
          id: string
          timestamp: string
          level: string
          message: string
          source: string
          metadata: any
          tags?: string[]
          user_id?: string
          session_id?: string
          trace_id?: string
          span_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          timestamp: string
          level: string
          message: string
          source: string
          metadata?: any
          tags?: string[]
          user_id?: string
          session_id?: string
          trace_id?: string
          span_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          timestamp?: string
          level?: string
          message?: string
          source?: string
          metadata?: any
          tags?: string[]
          user_id?: string
          session_id?: string
          trace_id?: string
          span_id?: string
          created_at?: string
        }
      }
      incidents: {
        Row: {
          id: string
          title: string
          description?: string
          status: string
          severity: string
          source: string
          assignee_id?: string
          created_at: string
          updated_at: string
          resolved_at?: string
          metadata: any
        }
        Insert: {
          id?: string
          title: string
          description?: string
          status: string
          severity: string
          source: string
          assignee_id?: string
          created_at?: string
          updated_at?: string
          resolved_at?: string
          metadata?: any
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          severity?: string
          source?: string
          assignee_id?: string
          created_at?: string
          updated_at?: string
          resolved_at?: string
          metadata?: any
        }
      }
      incident_timeline: {
        Row: {
          id: string
          incident_id: string
          type: string
          message: string
          user_id?: string
          timestamp: string
          metadata?: any
        }
        Insert: {
          id?: string
          incident_id: string
          type: string
          message: string
          user_id?: string
          timestamp?: string
          metadata?: any
        }
        Update: {
          id?: string
          incident_id?: string
          type?: string
          message?: string
          user_id?: string
          timestamp?: string
          metadata?: any
        }
      }
      monitors: {
        Row: {
          id: string
          name: string
          type: string
          url?: string
          config: any
          status: string
          last_check?: string
          next_check?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          url?: string
          config: any
          status: string
          last_check?: string
          next_check?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          url?: string
          config?: any
          status?: string
          last_check?: string
          next_check?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: string
          plan: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: string
          plan: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          status?: string
          plan?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
