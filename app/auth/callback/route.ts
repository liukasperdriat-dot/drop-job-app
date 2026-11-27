import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendWelcomeEmailOnce } from '@/lib/email/welcome'
import { safeNext, NEXT_COOKIE } from '@/lib/safe-next'
import { trackConversion, isNewAccount } from '@/lib/analytics/server'

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
      // E-mail de bienvenue (une seule fois par compte, sans bloquer la connexion)
      if (data?.user) await sendWelcomeEmailOnce(supabase, data.user)
      // Inscription : compte créé il y a moins d'une heure (une simple reconnexion n'est pas comptée)
      if (data?.user && isNewAccount(data.user.created_at)) {
        const provider = typeof data.user.app_metadata?.provider === 'string' ? data.user.app_metadata.provider : 'email'
        await trackConversion('signup', data.user.id, { method: provider })
      }

      const response = NextResponse.redirect(`${origin}${next}`)
      if (rememberedNext) response.cookies.delete(NEXT_COOKIE)
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}