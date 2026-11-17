'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { usePremiumCheckout, type BillingPeriod } from '@/lib/premium-link'
import { safeNext } from '@/lib/safe-next'

// Parties interactives de la page /pricing (le reste est rendu côté serveur).

type Me = { loggedIn: boolean; isPremium: boolean }
let mePromise: Promise<Me> | null = null

// Statut du visiteur, demandé une seule fois pour toute la page
function fetchMe(): Promise<Me> {
  mePromise ??= fetch('/api/me', { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : {}))
    .then((d: { is_premium?: boolean; logged_in?: boolean }) => ({ loggedIn: !!d.logged_in, isPremium: !!d.is_premium }))
    .catch(() => ({ loggedIn: false, isPremium: false }))
  return mePromise
}

function useMe(): Me | null {
  const [me, setMe] = useState<Me | null>(null)
  useEffect(() => { fetchMe().then(setMe) }, [])
  return me
}

// Page où revenir après le paiement (?next=…), par défaut le générateur de CV
const nextParam = () => safeNext(new URLSearchParams(window.location.search).get('next'), '/cv')

function Spinner() {
  return <span aria-hidden="true" className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
}

export function PlanButton({ period, label, primary = false }: { period: BillingPeriod; label: string; primary?: boolean }) {
  const { start, loading } = usePremiumCheckout()
  const me = useMe()
  const busy = loading === period

  if (me?.isPremium) {
    return (
      <Link href="/cv" className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[#1d8348]/30 bg-[#1d8348]/[0.06] px-4 text-[15px] font-medium text-[#1d8348] no-underline">
        ✓ Vous êtes Premium — créer un CV
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => start(period, nextParam())}
      disabled={loading !== null}
      aria-busy={busy}
      className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-medium transition-colors disabled:cursor-wait ${
        primary
          ? 'bg-[#0071e3] text-white shadow-[0_2px_10px_rgba(0,113,227,.28)] hover:bg-[#0062c4] disabled:bg-[#0071e3]/70'
          : 'border border-[#0071e3]/25 bg-[#0071e3]/[0.06] text-[#0071e3] hover:bg-[#0071e3]/[0.1] disabled:opacity-70'
      }`}
    >
      {busy ? <><Spinner /> Ouverture du paiement sécurisé…</> : label}
    </button>
  )
}

export function FreePlanButton() {
  const me = useMe()
  const href = me?.loggedIn ? '/cv' : '/auth/register?next=/cv'
  return (
    <Link href={href} className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-black/[0.12] bg-white px-4 text-[15px] font-medium text-[#1d1d1f] no-underline hover:bg-[#f5f5f7]">
      {me?.loggedIn ? 'Continuer avec le plan gratuit' : 'Commencer gratuitement'}
    </Link>
  )
}

/**
 * Messages en haut de page (en surimpression, sans décaler la mise en page) :
 * - ?canceled=true : retour depuis Stripe sans payer ;
 * - ?checkout=monthly|weekly : reprise automatique du paiement après l'inscription.
 */
export function PricingNotice() {
  const params = useSearchParams()
  const { start, loading } = usePremiumCheckout()
  const [canceled, setCanceled] = useState(params.get('canceled') === 'true')

  useEffect(() => {
    const period = params.get('checkout')
    if (period !== 'monthly' && period !== 'weekly') return
    // Paramètre retiré tout de suite : pas de relance en boucle (retour arrière, rechargement)
    const url = new URL(window.location.href)
    url.searchParams.delete('checkout')
    window.history.replaceState(null, '', url.pathname + url.search)
    fetchMe().then(me => { if (me.loggedIn && !me.isPremium) start(period, nextParam()) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div role="status" className="fixed inset-x-4 top-[70px] z-40 mx-auto flex max-w-md items-center justify-center gap-2 rounded-2xl bg-[#1d1d1f] px-4 py-3 text-sm text-white shadow-lg">
        <Spinner /> Ouverture du paiement sécurisé Stripe…
      </div>
    )
  }

  if (!canceled) return null
  return (
    <div role="status" className="fixed inset-x-4 top-[70px] z-40 mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm shadow-lg">
      <p className="flex-1 text-[#1d1d1f]">
        <span className="font-semibold">Paiement annulé.</span>{' '}
        <span className="text-[#6e6e73]">Aucun montant n&apos;a été débité. Votre CV et votre offre vous attendent.</span>{' '}
        <a href={safeNext(params.get('next'), '/cv')} className="font-medium text-[#0071e3] no-underline">Revenir à mon CV →</a>
      </p>
      <button type="button" onClick={() => setCanceled(false)} aria-label="Fermer" className="-mr-1 h-8 w-8 shrink-0 rounded-full text-[#6e6e73] hover:bg-[#f5f5f7]">✕</button>
    </div>
  )
}
