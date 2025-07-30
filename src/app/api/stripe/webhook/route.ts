import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { StripeService } from '@/lib/api/stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    const { success, error } = await StripeService.handleWebhookEvent(event)

    if (!success) {
      console.error('Webhook handling failed:', error)
      return NextResponse.json(
        { error: 'Webhook handling failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
