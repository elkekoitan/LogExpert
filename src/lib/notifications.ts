import nodemailer from 'nodemailer'
import { supabase } from '@/lib/supabase'
import type { Incident, User } from '@/types'

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export class NotificationService {
  // Send email notification
  static async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string
  ) {
    try {
      const transporter = createTransporter()
      
      const mailOptions = {
        from: `LogExpert <${process.env.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      }

      const result = await transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId, error: null }
    } catch (error) {
      console.error('Send email error:', error)
      return { success: false, messageId: null, error: error as Error }
    }
  }

  // Send incident notification
  static async sendIncidentNotification(
    incident: Incident,
    type: 'created' | 'acknowledged' | 'resolved' | 'escalated',
    recipients: User[]
  ) {
    try {
      const subject = this.getIncidentEmailSubject(incident, type)
      const html = this.getIncidentEmailTemplate(incident, type)
      
      const emails = recipients.map(user => user.email)
      
      const result = await this.sendEmail(emails, subject, html)
      
      // Log notification in database
      if (result.success) {
        await this.logNotification({
          type: 'email',
          recipients: emails,
          subject,
          incidentId: incident.id,
          status: 'sent',
        })
      }

      return result
    } catch (error) {
      console.error('Send incident notification error:', error)
      return { success: false, messageId: null, error: error as Error }
    }
  }

  // Send monitor alert
  static async sendMonitorAlert(
    monitor: any,
    status: 'down' | 'up',
    recipients: User[]
  ) {
    try {
      const subject = `Monitor Alert: ${monitor.name} is ${status.toUpperCase()}`
      const html = this.getMonitorAlertTemplate(monitor, status)
      
      const emails = recipients.map(user => user.email)
      
      const result = await this.sendEmail(emails, subject, html)
      
      // Log notification
      if (result.success) {
        await this.logNotification({
          type: 'email',
          recipients: emails,
          subject,
          monitorId: monitor.id,
          status: 'sent',
        })
      }

      return result
    } catch (error) {
      console.error('Send monitor alert error:', error)
      return { success: false, messageId: null, error: error as Error }
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(user: User) {
    try {
      const subject = 'Welcome to LogExpert!'
      const html = this.getWelcomeEmailTemplate(user)
      
      const result = await this.sendEmail(user.email, subject, html)
      
      if (result.success) {
        await this.logNotification({
          type: 'email',
          recipients: [user.email],
          subject,
          userId: user.id,
          status: 'sent',
        })
      }

      return result
    } catch (error) {
      console.error('Send welcome email error:', error)
      return { success: false, messageId: null, error: error as Error }
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string, resetLink: string) {
    try {
      const subject = 'Reset your LogExpert password'
      const html = this.getPasswordResetTemplate(resetLink)
      
      const result = await this.sendEmail(email, subject, html)
      
      if (result.success) {
        await this.logNotification({
          type: 'email',
          recipients: [email],
          subject,
          status: 'sent',
        })
      }

      return result
    } catch (error) {
      console.error('Send password reset email error:', error)
      return { success: false, messageId: null, error: error as Error }
    }
  }

  // Browser push notification
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      // This would integrate with a push notification service like Firebase
      // For now, we'll just log it
      console.log('Push notification:', { userId, title, body, data })
      
      await this.logNotification({
        type: 'push',
        recipients: [userId],
        subject: title,
        status: 'sent',
        metadata: { body, data },
      })

      return { success: true, error: null }
    } catch (error) {
      console.error('Send push notification error:', error)
      return { success: false, error: error as Error }
    }
  }

  // Slack notification (webhook)
  static async sendSlackNotification(
    webhookUrl: string,
    message: string,
    channel?: string
  ) {
    try {
      const payload = {
        text: message,
        channel,
        username: 'LogExpert',
        icon_emoji: ':warning:',
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`)
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Send Slack notification error:', error)
      return { success: false, error: error as Error }
    }
  }

  // Log notification in database
  private static async logNotification(notification: {
    type: string
    recipients: string[]
    subject: string
    incidentId?: string
    monitorId?: string
    userId?: string
    status: string
    metadata?: any
  }) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          type: notification.type,
          recipients: notification.recipients,
          subject: notification.subject,
          incident_id: notification.incidentId,
          monitor_id: notification.monitorId,
          user_id: notification.userId,
          status: notification.status,
          metadata: notification.metadata || {},
        }])

      if (error) {
        console.error('Log notification error:', error)
      }
    } catch (error) {
      console.error('Log notification error:', error)
    }
  }

  // Email templates
  private static getIncidentEmailSubject(incident: Incident, type: string): string {
    const severityText = incident.severity.toUpperCase()
    switch (type) {
      case 'created':
        return `🚨 [${severityText}] New Incident: ${incident.title}`
      case 'acknowledged':
        return `✅ [${severityText}] Incident Acknowledged: ${incident.title}`
      case 'resolved':
        return `🎉 [${severityText}] Incident Resolved: ${incident.title}`
      case 'escalated':
        return `⚠️ [${severityText}] Incident Escalated: ${incident.title}`
      default:
        return `[${severityText}] Incident Update: ${incident.title}`
    }
  }

  private static getIncidentEmailTemplate(incident: Incident, type: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const incidentUrl = `${baseUrl}/incidents/${incident.id}`
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>LogExpert Incident Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #6A5AF9; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">LogExpert</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
              <h2 style="color: #dc3545; margin-top: 0;">Incident ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
              
              <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #495057;">${incident.title}</h3>
                <p><strong>Severity:</strong> <span style="color: #dc3545;">${incident.severity.toUpperCase()}</span></p>
                <p><strong>Status:</strong> ${incident.status}</p>
                <p><strong>Source:</strong> ${incident.source}</p>
                ${incident.description ? `<p><strong>Description:</strong> ${incident.description}</p>` : ''}
                <p><strong>Created:</strong> ${new Date(incident.createdAt).toLocaleString()}</p>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${incidentUrl}" style="background: #6A5AF9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  View Incident Details
                </a>
              </div>
            </div>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6c757d;">
              <p>This is an automated notification from LogExpert. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private static getMonitorAlertTemplate(monitor: any, status: string): string {
    const statusColor = status === 'down' ? '#dc3545' : '#28a745'
    const statusIcon = status === 'down' ? '🔴' : '🟢'
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>LogExpert Monitor Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #6A5AF9; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">LogExpert Monitor Alert</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
              <h2 style="color: ${statusColor}; margin-top: 0;">${statusIcon} Monitor ${status.toUpperCase()}</h2>
              
              <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #495057;">${monitor.name}</h3>
                <p><strong>Status:</strong> <span style="color: ${statusColor};">${status.toUpperCase()}</span></p>
                <p><strong>URL:</strong> ${monitor.url}</p>
                <p><strong>Type:</strong> ${monitor.type}</p>
                <p><strong>Last Check:</strong> ${monitor.last_check ? new Date(monitor.last_check).toLocaleString() : 'Never'}</p>
              </div>
            </div>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6c757d;">
              <p>This is an automated notification from LogExpert. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private static getWelcomeEmailTemplate(user: User): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to LogExpert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #6A5AF9; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to LogExpert!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
              <h2 style="color: #495057; margin-top: 0;">Hi ${user.firstName}! 👋</h2>
              
              <p>Welcome to LogExpert, the modern log management platform that helps you monitor, analyze, and troubleshoot your applications with ease.</p>
              
              <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #6A5AF9;">Get Started</h3>
                <ul style="padding-left: 20px;">
                  <li>Set up your first monitor</li>
                  <li>Start sending logs to LogExpert</li>
                  <li>Configure incident notifications</li>
                  <li>Invite your team members</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/dashboard" style="background: #6A5AF9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
              
              <p>If you have any questions, feel free to reach out to our support team. We're here to help!</p>
            </div>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6c757d;">
              <p>Thanks for choosing LogExpert!</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private static getPasswordResetTemplate(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #6A5AF9; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Reset Your Password</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
              <p>You requested to reset your password for your LogExpert account.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: #6A5AF9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p>This link will expire in 24 hours. If you didn't request this password reset, you can safely ignore this email.</p>
            </div>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6c757d;">
              <p>This is an automated email from LogExpert. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}
