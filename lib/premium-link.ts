'use client'

import { createClient } from '@/lib/supabase/client'

// Liens de paiement Stripe (Payment Links)
export const STRIPE_LINKS = {
  monthly: 'https://buy.stripe.com/6oUcN4cMAbJX553a1o4wM00',
  weekly:  'https://buy.stripe.com/8x26oGh2QbJX553c9w4wM01',
} as const

export type BillingPeriod = keyof typeof STRIPE_LINKS

// Mention affichée sous chaque bouton de paiement
// (sans engagement : la résiliation prend effet en fin de période, depuis le portail Stripe)
export const PAYMENT_REASSURANCE = 'Sans engagement · Résiliable en 1 clic · Paiement sécurisé Stripe'

// Envoie l'utilisateur vers le paiement Stripe en y attachant l'identifiant
// de son compte (client_reference_id). Le webhook retrouve ainsi le bon
// compte même si l'e-mail saisi sur Stripe est différent.
// Un visiteur non connecté est d'abord envoyé vers l'inscription.
export async function goToPremium(period: BillingPeriod = 'monthly') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = '/auth/register'
    return
  }

  const params = new URLSearchParams({ client_reference_id: user.id })
  if (user.email) params.set('prefilled_email', user.email)
  window.location.href = `${STRIPE_LINKS[period]}?${params}`
}
