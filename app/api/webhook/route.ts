import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

// Statuts Stripe pour lesquels l'abonnement donne accès au Premium.
// past_due : Stripe retente encore le prélèvement, on laisse l'accès pendant ce délai.
const PREMIUM_STATUSES: Stripe.Subscription.Status[] = ['active', 'trialing', 'past_due']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const profileId = await findProfileId(supabase, session)

      if (!profileId) {
        // Paiement reçu mais compte introuvable : à traiter à la main dans Stripe.
        console.error('[webhook] compte introuvable pour la session', session.id)
        return NextResponse.json({ received: true, matched: false })
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
          stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null,
        })
        .eq('id', profileId)

      // En cas d'échec, on renvoie 500 pour que Stripe renvoie l'événement plus tard.
      if (error) throw new Error(`update premium: ${error.message}`)
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const isPremium = event.type === 'customer.subscription.updated' && PREMIUM_STATUSES.includes(subscription.status)

      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: isPremium })
        .eq('stripe_subscription_id', subscription.id)

      if (error) throw new Error(`update subscription: ${error.message}`)
    }
  } catch (err) {
    console.error('[webhook]', event.type, err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// Retrouve le compte : d'abord par l'identifiant transmis au lien de paiement
// (client_reference_id), sinon par l'e-mail saisi sur Stripe.
async function findProfileId(supabase: ReturnType<typeof createAdminClient>, session: Stripe.Checkout.Session): Promise<string | null> {
  const ref = session.client_reference_id
  if (ref && UUID.test(ref)) {
    const { data } = await supabase.from('profiles').select('id').eq('id', ref).maybeSingle()
    if (data) return data.id
    // Le compte existe mais n'a pas encore de ligne profiles : on la crée.
    const { data: user } = await supabase.auth.admin.getUserById(ref)
    if (user?.user) {
      const { error } = await supabase.from('profiles').upsert({ id: ref, email: user.user.email })
      if (!error) return ref
    }
  }

  const email = session.customer_details?.email
  if (email) {
    // Comparaison insensible à la casse ; % et _ sont échappés pour ne pas servir de jokers.
    const pattern = email.replace(/[\\%_]/g, '\\$&')
    const { data } = await supabase.from('profiles').select('id').ilike('email', pattern).limit(1).maybeSingle()
    if (data) return data.id
  }

  return null
}
