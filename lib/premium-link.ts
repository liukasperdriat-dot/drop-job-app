'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { safeNext } from '@/lib/safe-next'

// Liens de paiement Stripe (Payment Links) : solution de secours si la
// création d'une session Checkout échoue (configuration absente, panne).
export const STRIPE_LINKS = {
  monthly: 'https://buy.stripe.com/6oUcN4cMAbJX553a1o4wM00',
  weekly:  'https://buy.stripe.com/8x26oGh2QbJX553c9w4wM01',
} as const

export type BillingPeriod = keyof typeof STRIPE_LINKS

export const PRICES: Record<BillingPeriod, { amount: string; unit: string }> = {
  weekly:  { amount: '3,49 €', unit: 'semaine' },
  monthly: { amount: '9,90 €', unit: 'mois' },
}

// Mention affichée sous chaque bouton de paiement
// (sans engagement : la résiliation prend effet en fin de période, depuis le portail Stripe)
export const PAYMENT_REASSURANCE = 'Sans engagement · Résiliable en 1 clic · Paiement sécurisé Stripe'

const here = () => window.location.pathname + window.location.search

/** Page des tarifs, avec retour prévu vers la page en cours (ou `next`). */
export function pricingUrl(next?: string, period?: BillingPeriod): string {
  const params = new URLSearchParams()
  const back = safeNext(next ?? (typeof window !== 'undefined' ? here() : null), '/cv')
  if (back !== '/pricing') params.set('next', back)
  if (period) params.set('period', period)
  const qs = params.toString()
  return qs ? `/pricing?${qs}` : '/pricing'
}

/**
 * Démarre le paiement Premium (Stripe Checkout).
 * - Visiteur non connecté : inscription, puis retour sur /pricing où le paiement reprend tout seul.
 * - Déjà Premium : renvoyé vers son espace.
 * - Checkout indisponible : lien de paiement Stripe en secours.
 * `next` : page où revenir après le paiement (l'offre en cours est conservée).
 */
export async function goToPremium(period: BillingPeriod = 'monthly', next?: string): Promise<void> {
  const back = safeNext(next ?? here(), '/cv')

  let res: Response
  try {
    res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, next: back }),
    })
  } catch {
    await goToPaymentLink(period, back)
    return
  }

  if (res.status === 401) {
    const resume = `/pricing?checkout=${period}&next=${encodeURIComponent(back)}`
    window.location.assign(`/auth/register?next=${encodeURIComponent(resume)}`)
    return
  }

  const data = (await res.json().catch(() => ({}))) as { url?: string; redirect?: string }
  if (res.ok && data.url) {
    window.location.assign(data.url)
    return
  }
  if (res.status === 409) {
    window.location.assign(safeNext(data.redirect, '/dashboard'))
    return
  }
  await goToPaymentLink(period, back)
}

// Ancien parcours : lien de paiement avec l'identifiant du compte (client_reference_id),
// pour que le webhook retrouve le bon compte.
async function goToPaymentLink(period: BillingPeriod, back: string) {
  try {
    const { data: { user } } = await createClient().auth.getUser()
    if (!user) {
      window.location.assign(`/auth/register?next=${encodeURIComponent(pricingUrl(back, period))}`)
      return
    }
    const params = new URLSearchParams({ client_reference_id: user.id })
    if (user.email) params.set('prefilled_email', user.email)
    window.location.assign(`${STRIPE_LINKS[period]}?${params}`)
  } catch {
    window.location.assign(STRIPE_LINKS[period])
  }
}

/**
 * Bouton de paiement avec état de chargement : `loading` vaut la formule
 * en cours d'ouverture (le bouton correspondant affiche un indicateur).
 */
export function usePremiumCheckout() {
  const [loading, setLoading] = useState<BillingPeriod | null>(null)

  // Retour arrière depuis Stripe (page restaurée du cache) : boutons de nouveau actifs
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => { if (e.persisted) setLoading(null) }
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  const start = useCallback(async (period: BillingPeriod, next?: string) => {
    setLoading(period)
    try {
      await goToPremium(period, next)
      // La redirection est en cours : on garde l'indicateur affiché.
      // Filet de sécurité si la navigation n'a pas lieu.
      window.setTimeout(() => setLoading(null), 15000)
    } catch {
      setLoading(null)
    }
  }, [])

  return { start, loading }
}
