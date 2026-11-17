import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { activatePremiumFromSession, getStripe } from '@/lib/stripe/server'

// Retour de Stripe sur /cv?success=true : le webhook peut arriver quelques
// secondes après l'utilisateur. Cette route vérifie directement la session
// auprès de Stripe et active le Premium sans attendre.
// Sécurité : la session doit être payée ET appartenir au compte connecté.

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const body: unknown = await request.json().catch(() => null)
    const sessionId = (body as { sessionId?: unknown } | null)?.sessionId
    if (typeof sessionId !== 'string' || !SESSION_ID.test(sessionId)) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) return NextResponse.json({ is_premium: false, pending: true })

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const owner = session.client_reference_id || session.metadata?.user_id
    if (owner !== user.id) {
      return NextResponse.json({ error: 'Session d’un autre compte' }, { status: 403 })
    }

    const result = await activatePremiumFromSession(createAdminClient(), session)
    return NextResponse.json({ is_premium: result.ok, pending: !result.ok })
  } catch (err) {
    console.error('[stripe/confirm]', err instanceof Error ? err.message : err)
    // Le webhook prendra le relais : la page continue d'attendre le statut Premium
    return NextResponse.json({ is_premium: false, pending: true })
  }
}
