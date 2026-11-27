import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { activatePremiumFromSession, getStripe } from '@/lib/stripe/server'
import { trackConversion } from '@/lib/analytics/server'

// Webhook Stripe : met à jour le statut Premium dans Supabase.
//
// - Signature vérifiée avec STRIPE_WEBHOOK_SECRET (un appel non signé par Stripe est refusé).
// - Chaque événement est inscrit dans la table stripe_events : un événement
//   déjà traité (Stripe renvoie parfois deux fois le même) est ignoré.
// - En cas d'échec d'écriture, on répond 500 : Stripe renvoie l'événement plus tard.

type Admin = ReturnType<typeof createAdminClient>
type Outcome = { status: 'processed' | 'ignored' | 'needs_review'; note?: string }

// Statuts Stripe pour lesquels l'abonnement donne accès au Premium.
// past_due : Stripe retente encore le prélèvement, on laisse l'accès pendant ce délai.
const PREMIUM_STATUSES: Stripe.Subscription.Status[] = ['active', 'trialing', 'past_due']

export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    console.error('[webhooks/stripe] STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET manquant')
    return NextResponse.json({ error: 'Webhook non configuré' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    console.warn('[webhooks/stripe] appel refusé : signature absente')
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    // Contenu non authentifié : rien n'est écrit en base, seulement journalisé.
    console.warn('[webhooks/stripe] signature invalide :', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const admin = createAdminClient()

  const claim = await claimEvent(admin, event)
  if (claim === 'duplicate') {
    console.info('[webhooks/stripe] événement déjà traité, ignoré :', event.id, event.type)
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    const outcome = await handleEvent(admin, event)
    if (outcome.status === 'needs_review') console.error('[webhooks/stripe] à vérifier :', event.id, outcome.note)
    await recordEvent(admin, event, outcome.status, outcome.note)
    return NextResponse.json({ received: true, status: outcome.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[webhooks/stripe] échec du traitement', event.id, event.type, message)
    await recordEvent(admin, event, 'failed', message)
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
  }
}

async function handleEvent(admin: Admin, event: Stripe.Event): Promise<Outcome> {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session
      const result = await activatePremiumFromSession(admin, session)
      if (result.ok) {
        // Source de vérité des abonnements payés (une ligne par session, même si Stripe rejoue l'événement)
        await trackConversion('subscription_paid', result.profileId, {
          checkout_session: session.id,
          amount_total: session.amount_total ?? null,
          currency: session.currency ?? null,
          livemode: event.livemode,
        })
        return { status: 'processed', note: `premium:${result.profileId}` }
      }
      if (result.reason === 'not_paid') return { status: 'ignored', note: `paiement ${session.payment_status}` }
      // Paiement reçu mais compte introuvable : à rattacher à la main depuis Stripe.
      return { status: 'needs_review', note: `compte introuvable pour la session ${session.id}` }
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const isPremium = event.type === 'customer.subscription.updated' && PREMIUM_STATUSES.includes(subscription.status)
      const { error } = await admin
        .from('profiles')
        .update({ is_premium: isPremium })
        .eq('stripe_subscription_id', subscription.id)
      if (error) throw new Error(`mise à jour abonnement : ${error.message}`)
      return { status: 'processed', note: `${subscription.status} → premium=${isPremium}` }
    }

    default:
      return { status: 'ignored' }
  }
}

// --- Journal des événements (table stripe_events, voir supabase/stripe-events.sql) ---

// Table absente : le webhook fonctionne quand même (les mises à jour sont idempotentes).
const missingTable = (code?: string) => code === '42P01' || code === 'PGRST205'

async function claimEvent(admin: Admin, event: Stripe.Event): Promise<'new' | 'retry' | 'duplicate'> {
  try {
    const { error } = await admin
      .from('stripe_events')
      .insert({ id: event.id, type: event.type, status: 'processing', livemode: event.livemode })
    if (!error) return 'new'
    if (missingTable(error.code)) {
      console.warn('[webhooks/stripe] table stripe_events absente : protection anti-doublon désactivée')
      return 'new'
    }
    if (error.code !== '23505') throw new Error(error.message)

    // Déjà reçu : on ne retraite que s'il avait échoué ou n'avait pas abouti
    const { data } = await admin.from('stripe_events').select('status').eq('id', event.id).maybeSingle()
    return data?.status === 'failed' || data?.status === 'processing' ? 'retry' : 'duplicate'
  } catch (err) {
    // Journal indisponible : on traite quand même plutôt que de perdre un paiement
    console.warn('[webhooks/stripe] journal indisponible :', err instanceof Error ? err.message : err)
    return 'new'
  }
}

async function recordEvent(admin: Admin, event: Stripe.Event, status: string, note?: string) {
  try {
    const { error } = await admin
      .from('stripe_events')
      .upsert({
        id: event.id,
        type: event.type,
        livemode: event.livemode,
        status,
        note: note?.slice(0, 500) ?? null,
        processed_at: new Date().toISOString(),
      })
    if (error && !missingTable(error.code)) console.warn('[webhooks/stripe] journal non mis à jour :', error.message)
  } catch (err) {
    console.warn('[webhooks/stripe] journal non mis à jour :', err instanceof Error ? err.message : err)
  }
}
