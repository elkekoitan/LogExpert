import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { User, SignupForm, LoginForm } from '@/types'

export class AuthService {
  // Sign up new user
  static async signUp(data: SignupForm) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
            company_size: data.companySize,
          }
        }
      })

      if (authError) throw authError

      return { user: authData.user, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error as Error }
    }
  }

  // Sign in user
  static async signIn(data: LoginForm) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError

      return { user: authData.user, session: authData.session, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, session: null, error: error as Error }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error as Error }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error: error as Error }
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { profile: data, error: null }
    } catch (error) {
      console.error('Get user profile error:', error)
      return { profile: null, error: error as Error }
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { profile: data, error: null }
    } catch (error) {
      console.error('Update user profile error:', error)
      return { profile: null, error: error as Error }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error as Error }
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: error as Error }
    }
  }

  // Sign in with OAuth (Google, GitHub)
  static async signInWithOAuth(provider: 'google' | 'github') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      return { data: null, error: error as Error }
    }
  }

  // Get all users (for assignments)
  static async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role')
        .order('first_name')

      if (error) throw error
      return { users: data, error: null }
    } catch (error) {
      console.error('Get all users error:', error)
      return { users: [], error: error as Error }
    }
  }
}
