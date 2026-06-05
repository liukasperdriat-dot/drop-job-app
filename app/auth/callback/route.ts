import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/welcome'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      try {
        const user = data?.user
        if (user?.email && !user.user_metadata?.welcome_email_sent) {
          const meta = user.user_metadata ?? {}
          const fullName: string = meta.full_name || meta.name || ''
          const firstName = fullName.split(' ')[0] || undefined
          await sendWelcomeEmail(user.email, firstName)
          await supabase.auth.updateUser({ data: { welcome_email_sent: true } })
        }
      } catch {
        // Email failure is non-blocking — inscription continues
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}