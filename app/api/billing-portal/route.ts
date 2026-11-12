import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Ouvre le portail client Stripe : l'abonné peut y résilier, changer de carte
// et télécharger ses factures. Le portail doit être activé une fois dans
// Stripe → Paramètres → Facturation → Portail client.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'Aucun abonnement Stripe trouvé pour ce compte.' }, { status: 404 })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[billing-portal]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Impossible d\'ouvrir la gestion de l\'abonnement.' }, { status: 500 })
  }
}
