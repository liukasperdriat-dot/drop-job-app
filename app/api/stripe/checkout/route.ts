import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/safe-next'
import { getStripe, isBillingPeriod, priceIdFor } from '@/lib/stripe/server'

// Crée une session de paiement Stripe Checkout pour l'abonnement Premium.
// Le compte est rattaché à la session (client_reference_id + metadata) :
// le webhook retrouve ainsi le bon utilisateur, même si l'e-mail saisi
// sur Stripe est différent.

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })

    const body: unknown = await request.json().catch(() => null)
    const { period, next } = (body && typeof body === 'object' ? body : {}) as { period?: unknown; next?: unknown }
    if (!isBillingPeriod(period)) {
      return NextResponse.json({ error: 'Formule inconnue.' }, { status: 400 })
    }

    const stripe = getStripe()
    const price = priceIdFor(period)
    if (!stripe || !price) {
      // Le navigateur se rabat alors sur les liens de paiement Stripe
      console.error('[stripe/checkout] configuration Stripe incomplète (clé secrète ou prix)')
      return NextResponse.json({ error: 'CHECKOUT_UNAVAILABLE' }, { status: 503 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.is_premium) {
      return NextResponse.json({ error: 'ALREADY_PREMIUM', redirect: '/dashboard' }, { status: 409 })
    }

    // Retour après paiement : la page CV en cours (avec son offre), sinon /cv
    const back = safeNext(typeof next === 'string' ? next : null, '/cv')
    const successPath = back.startsWith('/cv') ? back : '/cv'
    const origin = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, '')
    const sep = successPath.includes('?') ? '&' : '?'

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { user_id: user.id, period },
      subscription_data: { metadata: { user_id: user.id, period } },
      success_url: `${origin}${successPath}${sep}success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true&next=${encodeURIComponent(back)}`,
      locale: 'fr',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // Mention exigée par les CGU (art. 4.3) au moment du paiement
      custom_text: {
        submit: {
          message: 'En vous abonnant, vous demandez l’accès immédiat à Drop-Job Premium et renoncez à votre droit de rétractation (art. L.221-28 13° du Code de la consommation). Abonnement sans engagement, résiliable à tout moment depuis votre tableau de bord.',
        },
      },
    }

    const customerId = profile?.stripe_customer_id as string | null | undefined
    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.create(
        customerId ? { ...params, customer: customerId } : { ...params, customer_email: user.email ?? undefined },
      )
    } catch (err) {
      // Client Stripe enregistré introuvable (supprimé, ou créé dans l'autre mode test/réel) :
      // on recommence avec l'e-mail du compte.
      if (!customerId || (err as { code?: string })?.code !== 'resource_missing') throw err
      session = await stripe.checkout.sessions.create({ ...params, customer_email: user.email ?? undefined })
    }

    if (!session.url) throw new Error('session sans URL')
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'CHECKOUT_FAILED' }, { status: 500 })
  }
}
