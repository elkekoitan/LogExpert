import Link from 'next/link'
import { ArrowRight, BarChart3, FileText, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">LogExpert</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/auth/login"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-6xl">
            Advanced Log Management
            <span className="text-gradient block">Made Simple</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
            Centralize, search, and analyze your application logs with powerful 
            real-time monitoring and intelligent incident management.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-primary-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-all duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="flex items-center text-base font-semibold leading-6 text-text-primary hover:text-primary-400 transition-colors"
            >
              View Demo <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-32 max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Everything you need for log management
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Powerful features designed for modern development teams
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-effect rounded-xl p-6 card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/10">
                <FileText className="h-6 w-6 text-primary-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                Real-time Logs
              </h3>
              <p className="mt-2 text-text-secondary">
                Stream and search through millions of log entries in real-time with advanced filtering.
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-error/10">
                <Shield className="h-6 w-6 text-status-error" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                Incident Management
              </h3>
              <p className="mt-2 text-text-secondary">
                Automatically detect, track, and resolve incidents with intelligent alerting.
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-success/10">
                <BarChart3 className="h-6 w-6 text-status-success" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                Analytics & Insights
              </h3>
              <p className="mt-2 text-text-secondary">
                Gain deep insights into your application performance with detailed analytics.
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-warning/10">
                <Zap className="h-6 w-6 text-status-warning" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                Fast Performance
              </h3>
              <p className="mt-2 text-text-secondary">
                Lightning-fast search and filtering across terabytes of log data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-primary-400 to-primary-600 opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
