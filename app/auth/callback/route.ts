import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/welcome'
import { safeNext, NEXT_COOKIE } from '@/lib/safe-next'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const cookieStore = await cookies()

  // Page de retour : ?next= ou cookie posé avant la connexion Google / l'inscription.
  // Uniquement un chemin interne (empêche une redirection vers un autre site).
  const rememberedNext = cookieStore.get(NEXT_COOKIE)?.value
  let decoded: string | null = null
  try { decoded = rememberedNext ? decodeURIComponent(rememberedNext) : null } catch { decoded = null }
  const next = safeNext(searchParams.get('next') ?? decoded)

  if (code) {

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

      const response = NextResponse.redirect(`${origin}${next}`)
      if (rememberedNext) response.cookies.delete(NEXT_COOKIE)
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}