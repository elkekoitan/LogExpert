import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/lib/api/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle = 'monthly' } = await request.json()

    // For demo purposes, we'll use placeholder data
    const user = { id: 'demo-user-id' }
    const profile = {
      email: 'demo@example.com',
      first_name: 'Demo',
      last_name: 'User'
    }

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan || !plan.priceId) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Create new customer for demo
    const { customer, error: customerError } = await StripeService.createCustomer(
      profile.email,
      `${profile.first_name} ${profile.last_name}`,
      user.id
    )

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    const customerId = customer.id

    // Determine price ID based on billing cycle
    let priceId: string = plan.priceId!
    if (billingCycle === 'yearly' && plan.priceId) {
      // Assuming yearly price IDs follow a pattern
      priceId = plan.priceId.replace('monthly', 'yearly')
    }

    // Create checkout session
    const { session, error: sessionError } = await StripeService.createCheckoutSession(
      customerId,
      priceId,
      user.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`
    )

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
