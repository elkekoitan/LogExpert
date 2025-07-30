'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Code, 
  Server, 
  Shield, 
  Users, 
  Rocket, 
  User,
  Monitor,
  FileText,
  Phone
} from 'lucide-react'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type UserRole = 'software-engineer' | 'devops' | 'sre' | 'manager' | 'founder' | 'other'
type CompanySize = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
type InitialGoal = 'monitor' | 'logs' | 'oncall'

const roles = [
  {
    id: 'software-engineer' as UserRole,
    name: 'Software Engineer',
    description: 'I write and maintain application code',
    icon: Code,
  },
  {
    id: 'devops' as UserRole,
    name: 'DevOps Engineer',
    description: 'I manage infrastructure and deployments',
    icon: Server,
  },
  {
    id: 'sre' as UserRole,
    name: 'Site Reliability Engineer',
    description: 'I ensure system reliability and performance',
    icon: Shield,
  },
  {
    id: 'manager' as UserRole,
    name: 'Engineering Manager',
    description: 'I lead engineering teams and projects',
    icon: Users,
  },
  {
    id: 'founder' as UserRole,
    name: 'Founder/CTO',
    description: 'I\'m building and scaling a product',
    icon: Rocket,
  },
  {
    id: 'other' as UserRole,
    name: 'Other',
    description: 'My role isn\'t listed above',
    icon: User,
  },
]

const companySizes = [
  { id: '1-10' as CompanySize, label: '1-10', description: 'employees' },
  { id: '11-50' as CompanySize, label: '11-50', description: 'employees' },
  { id: '51-200' as CompanySize, label: '51-200', description: 'employees' },
  { id: '201-1000' as CompanySize, label: '201-1000', description: 'employees' },
  { id: '1000+' as CompanySize, label: '1000+', description: 'employees' },
]

const goals = [
  {
    id: 'monitor' as InitialGoal,
    name: 'Monitor a website or API',
    description: 'Get notified when your services go down',
    icon: Monitor,
  },
  {
    id: 'logs' as InitialGoal,
    name: 'Collect and search logs',
    description: 'Centralize logs from your applications',
    icon: FileText,
  },
  {
    id: 'oncall' as InitialGoal,
    name: 'Set up on-call schedule',
    description: 'Organize your team\'s incident response',
    icon: Phone,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [selectedCompanySize, setSelectedCompanySize] = useState<CompanySize | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<InitialGoal | null>(null)

  const totalSteps = 3

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      handleComplete()
    }
  }

  const handleComplete = () => {
    // Save onboarding data and redirect to dashboard
    const onboardingData = {
      role: selectedRole,
      companySize: selectedCompanySize,
      initialGoal: selectedGoal,
    }
    
    console.log('Onboarding completed:', onboardingData)
    
    // Redirect based on selected goal
    switch (selectedGoal) {
      case 'monitor':
        router.push('/monitors')
        break
      case 'logs':
        router.push('/logs')
        break
      case 'oncall':
        router.push('/on-call')
        break
      default:
        router.push('/dashboard')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedRole !== null
      case 1:
        return selectedCompanySize !== null
      case 2:
        return selectedGoal !== null
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      'p-6 rounded-lg border-2 text-left transition-all hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-500/5',
                      selectedRole === role.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-gray-200 dark:border-gray-600'
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg',
                        selectedRole === role.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-text-primary">
                          {role.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-text-secondary">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {companySizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedCompanySize(size.id)}
                  className={cn(
                    'p-6 rounded-lg border-2 text-center transition-all hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-500/5',
                    selectedCompanySize === size.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                      : 'border-gray-200 dark:border-gray-600'
                  )}
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-text-primary">
                    {size.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-text-secondary">
                    {size.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {goals.map((goal) => {
                const Icon = goal.icon
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={cn(
                      'w-full p-6 rounded-lg border-2 text-left transition-all hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-500/5',
                      selectedGoal === goal.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-gray-200 dark:border-gray-600'
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg',
                        selectedGoal === goal.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-text-primary">
                          {goal.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-text-secondary">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'What best describes your role?'
      case 1:
        return 'What\'s the size of your company?'
      case 2:
        return 'What do you want to do first?'
      default:
        return ''
    }
  }

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 0:
        return 'This helps us customize your experience'
      case 1:
        return 'We\'ll tailor our recommendations accordingly'
      case 2:
        return 'We\'ll help you get started quickly'
      default:
        return ''
    }
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
    >
      {renderStep()}
      
      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {currentStep === totalSteps - 1 ? 'Get Started' : 'Continue'}
        </Button>
      </div>
    </OnboardingLayout>
  )
}
