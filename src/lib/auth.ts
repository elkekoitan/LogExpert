import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { supabase, createSupabaseServerClient } from '@/lib/supabase'
import type { User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d'

export class AuthManager {
  // Generate JWT token
  static generateToken(payload: any): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  // Verify JWT token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // Get current user from request
  static async getCurrentUser(request: Request): Promise<User | null> {
    try {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
      }

      const token = authHeader.substring(7)
      const decoded = this.verifyToken(token)
      
      if (!decoded.sub) {
        return null
      }

      // Get user from Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.sub)
        .single()

      if (error || !user) {
        return null
      }

      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // Middleware for protected routes
  static async requireAuth(request: Request): Promise<{ user: User | null; error: string | null }> {
    const user = await this.getCurrentUser(request)
    
    if (!user) {
      return { user: null, error: 'Authentication required' }
    }

    return { user, error: null }
  }

  // Check if user has permission
  static hasPermission(user: User, permission: string): boolean {
    // Basic role-based permissions
    const rolePermissions = {
      'software-engineer': ['read:logs', 'read:incidents', 'create:incidents'],
      'devops': ['read:logs', 'read:incidents', 'create:incidents', 'update:incidents', 'read:monitors', 'create:monitors'],
      'sre': ['read:logs', 'read:incidents', 'create:incidents', 'update:incidents', 'delete:incidents', 'read:monitors', 'create:monitors', 'update:monitors', 'delete:monitors'],
      'manager': ['read:logs', 'read:incidents', 'create:incidents', 'update:incidents', 'read:monitors', 'read:users'],
      'founder': ['*'], // All permissions
      'other': ['read:logs', 'read:incidents'],
    }

    const userPermissions = rolePermissions[user.role] || []
    
    // Check for wildcard permission
    if (userPermissions.includes('*')) {
      return true
    }

    return userPermissions.includes(permission)
  }

  // Rate limiting
  static async checkRateLimit(
    identifier: string, 
    maxRequests: number = 100, 
    windowMs: number = 60000
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const now = Date.now()
      const windowStart = now - windowMs
      
      // Get recent requests from cache/database
      // For now, we'll use a simple in-memory store
      // In production, use Redis or similar
      const key = `rate_limit:${identifier}`
      
      // This is a simplified implementation
      // In production, use a proper rate limiting solution
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: Date.now() + windowMs,
      }
    }
  }

  // Session management
  static async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    try {
      const sessionToken = this.generateToken({ sub: userId, type: 'session' })
      
      // Store session in database
      const { data, error } = await supabase
        .from('user_sessions')
        .insert([{
          user_id: userId,
          session_token: sessionToken,
          user_agent: userAgent,
          ip_address: ipAddress,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }])
        .select()
        .single()

      if (error) throw error

      return { session: data, token: sessionToken, error: null }
    } catch (error) {
      console.error('Create session error:', error)
      return { session: null, token: null, error: error as Error }
    }
  }

  // Validate session
  static async validateSession(sessionToken: string) {
    try {
      const decoded = this.verifyToken(sessionToken)
      
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('*, users(*)')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !session) {
        return { user: null, session: null, error: 'Invalid session' }
      }

      return { user: session.users, session, error: null }
    } catch (error) {
      console.error('Validate session error:', error)
      return { user: null, session: null, error: 'Invalid session' }
    }
  }

  // Revoke session
  static async revokeSession(sessionToken: string) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Revoke session error:', error)
      return { error: error as Error }
    }
  }

  // Revoke all user sessions
  static async revokeAllUserSessions(userId: string) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Revoke all user sessions error:', error)
      return { error: error as Error }
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions() {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Cleanup expired sessions error:', error)
      return { error: error as Error }
    }
  }

  // Two-factor authentication
  static generateTOTPSecret(): string {
    // Generate a random secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  // Verify TOTP code
  static verifyTOTP(secret: string, token: string): boolean {
    // This is a simplified implementation
    // In production, use a proper TOTP library like 'otplib'
    return token.length === 6 && /^\d+$/.test(token)
  }

  // Password strength validation
  static validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long')
    } else {
      score += 1
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter')
    } else {
      score += 1
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter')
    } else {
      score += 1
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number')
    } else {
      score += 1
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character')
    } else {
      score += 1
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    }
  }
}
