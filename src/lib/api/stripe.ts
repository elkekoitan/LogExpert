import { stripe, SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe'

export class StripeService {
  // Create Stripe customer
  static async createCustomer(email: string, name: string, userId: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      })

      return { customer, error: null }
    } catch (error) {
      console.error('Create customer error:', error)
      return { customer: null, error: error as Error }
    }
  }

  // Create checkout session
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
      })

      return { session, error: null }
    } catch (error) {
      console.error('Create checkout session error:', error)
      return { session: null, error: error as Error }
    }
  }

  // Create billing portal session
  static async createBillingPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })

      return { session, error: null }
    } catch (error) {
      console.error('Create billing portal session error:', error)
      return { session: null, error: error as Error }
    }
  }

  // Get customer subscriptions
  static async getCustomerSubscriptions(customerId: string) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.default_payment_method'],
      })

      return { subscriptions: subscriptions.data, error: null }
    } catch (error) {
      console.error('Get customer subscriptions error:', error)
      return { subscriptions: [], error: error as Error }
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })

      return { subscription, error: null }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      return { subscription: null, error: error as Error }
    }
  }

  // Reactivate subscription
  static async reactivateSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      })

      return { subscription, error: null }
    } catch (error) {
      console.error('Reactivate subscription error:', error)
      return { subscription: null, error: error as Error }
    }
  }

  // Update subscription
  static async updateSubscription(subscriptionId: string, newPriceId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      })

      return { subscription: updatedSubscription, error: null }
    } catch (error) {
      console.error('Update subscription error:', error)
      return { subscription: null, error: error as Error }
    }
  }

  // Get usage for current billing period
  static async getUsageForBillingPeriod(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const currentPeriodStart = subscription.current_period_start
      const currentPeriodEnd = subscription.current_period_end

      // Mock usage data for demo
      const usage = {
        logs: 1500,
        monitors: 3,
        incidents: 5,
        periodStart: new Date(currentPeriodStart * 1000),
        periodEnd: new Date(currentPeriodEnd * 1000),
      }

      return { usage, error: null }
    } catch (error) {
      console.error('Get usage error:', error)
      return { usage: null, error: error as Error }
    }
  }

  // Handle webhook events
  static async handleWebhookEvent(event: any) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionChange(event.data.object)
          break
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object)
          break
        
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object)
          break
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object)
          break
        
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Handle webhook event error:', error)
      return { success: false, error: error as Error }
    }
  }

  // Handle subscription change
  private static async handleSubscriptionChange(subscription: any) {
    const customerId = subscription.customer
    const subscriptionId = subscription.id
    const status = subscription.status
    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    // Get price ID to determine plan
    const priceId = subscription.items.data[0]?.price?.id
    let plan = 'free'

    for (const [key, planData] of Object.entries(SUBSCRIPTION_PLANS)) {
      if (planData.priceId === priceId) {
        plan = key.toLowerCase()
        break
      }
    }

    // Log subscription change for demo
    console.log('Subscription changed:', {
      customerId,
      subscriptionId,
      status,
      plan,
      currentPeriodStart: currentPeriodStart.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
    })
  }

  // Handle subscription deleted
  private static async handleSubscriptionDeleted(subscription: any) {
    const subscriptionId = subscription.id
    console.log('Subscription deleted:', subscriptionId)
  }

  // Handle payment succeeded
  private static async handlePaymentSucceeded(invoice: any) {
    const subscriptionId = invoice.subscription
    console.log('Payment succeeded for subscription:', subscriptionId)
  }

  // Handle payment failed
  private static async handlePaymentFailed(invoice: any) {
    const subscriptionId = invoice.subscription
    console.log('Payment failed for subscription:', subscriptionId)
  }
}
