import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmailOnce } from '@/lib/email/welcome'
import { trackConversion, isNewAccount } from '@/lib/analytics/server'

// E-mail de bienvenue après une inscription par e-mail sans confirmation
// (l'utilisateur est connecté tout de suite et ne passe pas par /auth/callback).
// Envoyé uniquement à l'adresse du compte connecté, et une seule fois.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  await sendWelcomeEmailOnce(supabase, user)
  // Inscription comptée une seule fois par compte (index unique en base)
  if (isNewAccount(user.created_at)) await trackConversion('signup', user.id, { method: 'email' })
  return NextResponse.json({ ok: true })
}
