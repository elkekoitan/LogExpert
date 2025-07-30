'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Check, X, Zap, Star, Crown, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe'

const planIcons = {
  FREE: Zap,
  STARTER: Star,
  PRO: Crown,
  ENTERPRISE: Building,
}

const planColors = {
  FREE: 'text-gray-500',
  STARTER: 'text-blue-500',
  PRO: 'text-purple-500',
  ENTERPRISE: 'text-orange-500',
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      // Redirect to signup for free plan
      window.location.href = '/auth/signup'
      return
    }

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Subscription error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">LogExpert</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="/auth/login"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Choose the perfect plan for your team's needs
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-text-primary' : 'text-text-muted'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-text-primary' : 'text-text-muted'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <Badge variant="success" className="ml-2">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const Icon = planIcons[key as keyof typeof planIcons]
            const isPopular = key === 'PRO'
            const price = billingCycle === 'yearly' ? plan.price * 12 * 0.8 : plan.price
            const displayPrice = billingCycle === 'yearly' ? price / 12 : price

            return (
              <Card
                key={key}
                className={`relative ${
                  isPopular
                    ? 'border-primary-500 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="primary" className="px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${planColors[key as keyof typeof planColors]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-text-primary">
                      {plan.price === 0 ? 'Free' : formatPrice(displayPrice)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-text-muted">
                        /{billingCycle === 'yearly' ? 'month' : 'month'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <p className="text-sm text-text-muted">
                      Billed annually ({formatPrice(price)})
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  <Button
                    fullWidth
                    variant={isPopular ? 'primary' : 'outline'}
                    onClick={() => handleSubscribe(key.toLowerCase())}
                    className="mb-6"
                  >
                    {key === 'FREE' ? 'Get Started' : 'Start Free Trial'}
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-status-success mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limits */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-text-primary mb-3">
                      Usage Limits
                    </h4>
                    <ul className="space-y-2 text-xs text-text-muted">
                      <li>
                        Logs: {plan.limits.logsPerMonth === -1 ? 'Unlimited' : plan.limits.logsPerMonth.toLocaleString()}/month
                      </li>
                      <li>
                        Retention: {plan.limits.retentionDays} days
                      </li>
                      <li>
                        Monitors: {plan.limits.monitors === -1 ? 'Unlimited' : plan.limits.monitors}
                      </li>
                      <li>
                        Team members: {plan.limits.users === -1 ? 'Unlimited' : plan.limits.users}
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-text-secondary">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-text-secondary">
                We'll notify you when you're approaching your limits. You can upgrade your plan or additional usage will be charged at standard rates.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Is there a free trial?
              </h3>
              <p className="text-text-secondary">
                Yes, all paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Do you offer enterprise discounts?
              </h3>
              <p className="text-text-secondary">
                Yes, we offer custom pricing for large teams and enterprises. Contact our sales team for more information.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of developers who trust LogExpert for their log management needs.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" onClick={() => handleSubscribe('starter')}>
              Start Free Trial
            </Button>
            <Link href="/demo">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
