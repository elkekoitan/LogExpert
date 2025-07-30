import Stripe from 'stripe'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Client-side Stripe configuration
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
}

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '1,000 logs per month',
      '7 days retention',
      '1 monitor',
      'Basic support',
    ],
    limits: {
      logsPerMonth: 1000,
      retentionDays: 7,
      monitors: 1,
      incidents: 10,
      users: 1,
    },
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    features: [
      '100,000 logs per month',
      '30 days retention',
      '10 monitors',
      'Email support',
      'Incident management',
    ],
    limits: {
      logsPerMonth: 100000,
      retentionDays: 30,
      monitors: 10,
      incidents: 100,
      users: 5,
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: [
      '1,000,000 logs per month',
      '90 days retention',
      'Unlimited monitors',
      'Priority support',
      'Advanced analytics',
      'API access',
    ],
    limits: {
      logsPerMonth: 1000000,
      retentionDays: 90,
      monitors: -1, // Unlimited
      incidents: -1, // Unlimited
      users: 20,
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    features: [
      'Unlimited logs',
      '1 year retention',
      'Unlimited monitors',
      '24/7 support',
      'Custom integrations',
      'SSO',
      'Dedicated support',
    ],
    limits: {
      logsPerMonth: -1, // Unlimited
      retentionDays: 365,
      monitors: -1, // Unlimited
      incidents: -1, // Unlimited
      users: -1, // Unlimited
    },
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// Stripe webhook events
export const STRIPE_WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const

// Helper functions
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function getPlanByPriceId(priceId: string): SubscriptionPlan | null {
  for (const [key, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.priceId === priceId) {
      return key as SubscriptionPlan
    }
  }
  return null
}

export function isFeatureAvailable(
  userPlan: SubscriptionPlan,
  feature: keyof typeof SUBSCRIPTION_PLANS.FREE.limits,
  currentUsage: number
): boolean {
  const plan = SUBSCRIPTION_PLANS[userPlan]
  const limit = plan.limits[feature]
  
  // -1 means unlimited
  if (limit === -1) return true
  
  return currentUsage < limit
}

export function getUsagePercentage(
  userPlan: SubscriptionPlan,
  feature: keyof typeof SUBSCRIPTION_PLANS.FREE.limits,
  currentUsage: number
): number {
  const plan = SUBSCRIPTION_PLANS[userPlan]
  const limit = plan.limits[feature]
  
  // -1 means unlimited
  if (limit === -1) return 0
  
  return Math.min((currentUsage / limit) * 100, 100)
}
