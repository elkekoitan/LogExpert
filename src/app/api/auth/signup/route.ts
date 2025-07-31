import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, companyName, role } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          role: role || 'other',
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 400 }
      )
    }

    // If user is created and confirmed, create organization
    if (data.user.email_confirmed_at) {
      try {
        // Create organization
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert([{
            name: companyName || `${firstName}'s Organization`,
            slug: (companyName || `${firstName}-org`).toLowerCase().replace(/[^a-z0-9]/g, '-'),
            created_by: data.user.id,
          }])
          .select()
          .single()

        if (!orgError && org) {
          // Add user as organization member
          await supabase
            .from('organization_members')
            .insert([{
              organization_id: org.id,
              user_id: data.user.id,
              role: 'admin',
            }])

          // Create default subscription
          await supabase
            .from('subscriptions')
            .insert([{
              organization_id: org.id,
              user_id: data.user.id,
              plan: 'free',
              status: 'active',
            }])
        }
      } catch (setupError) {
        console.error('Organization setup error:', setupError)
      }
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName,
        lastName,
        companyName,
        role,
      },
      session: data.session,
      message: data.user.email_confirmed_at 
        ? 'Account created successfully' 
        : 'Please check your email to confirm your account',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
