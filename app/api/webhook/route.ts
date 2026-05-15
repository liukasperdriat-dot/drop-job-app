import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_details?.email

    console.log('[webhook] checkout.session.completed — email reçu de Stripe:', JSON.stringify(email))

    if (email) {
      const { data: profile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      console.log('[webhook] profile trouvé:', profile, '| erreur select:', selectError?.message)

      if (profile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            is_premium: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', profile.id)

        console.log('[webhook] update is_premium — erreur:', updateError?.message ?? 'aucune')
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    
    await supabase
      .from('profiles')
      .update({ is_premium: false })
      .eq('stripe_subscription_id', subscription.id)
  }

  return NextResponse.json({ received: true })
}