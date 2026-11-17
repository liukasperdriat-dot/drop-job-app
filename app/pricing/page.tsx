import { Suspense } from 'react'
import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import JsonLd, { breadcrumb, SITE_URL } from '@/components/JsonLd'
import { FreePlanButton, PlanButton, PricingNotice } from './PricingClient'

export const metadata: Metadata = {
  title: 'Tarifs Drop-Job Premium : CV et lettres illimités dès 3,49 € | Drop-Job',
  description: 'CV adaptés à chaque offre et lettres de motivation IA illimités, modèles Moderne et Minimaliste, PDF sans mention. Pass semaine à 3,49 € ou 9,90 € par mois, sans engagement, paiement sécurisé Stripe.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Drop-Job Premium : CV et lettres illimités',
    description: 'Sans engagement, résiliable en 1 clic. Dès 3,49 € la semaine.',
    url: `${SITE_URL}/pricing`,
    type: 'website',
  },
}

const PREMIUM_PERKS = [
  'CV sur-mesure illimités, adaptés à chaque offre',
  'Lettres de motivation IA complètes et illimitées',
  'Modèles Moderne et Minimaliste',
  'PDF sans mention « drop-job.fr »',
  'Analyse ATS complète : tous les mots-clés manquants',
]

const FREE_PERKS = [
  '1 CV sur-mesure par mois',
  'Modèle Classique',
  'Aperçu de la lettre de motivation',
  'Score ATS gratuit',
]

const REASSURANCE: [string, string, string][] = [
  ['🔒', 'Paiement sécurisé par Stripe', 'Vos coordonnées bancaires ne passent jamais par nos serveurs.'],
  ['⚡', 'CV et lettre en moins de 30 secondes', 'Générés par IA à partir de votre vrai parcours, sans rien inventer.'],
  ['↩︎', 'Sans engagement', 'Résiliable en 1 clic depuis votre tableau de bord, à tout moment.'],
]

const FAQ: [string, string][] = [
  ['Puis-je résilier quand je veux ?', "Oui. L'abonnement est sans engagement : vous le résiliez en 1 clic depuis votre tableau de bord. Il reste actif jusqu'à la fin de la période déjà payée, puis n'est plus prélevé."],
  ['Quelle différence entre le pass semaine et le mensuel ?', "Les deux donnent exactement le même accès Premium. Le pass semaine convient à une recherche intensive de quelques jours ; le mensuel revient 34 % moins cher sur un mois complet."],
  ['Le paiement est-il sécurisé ?', 'Le paiement est entièrement géré par Stripe, prestataire certifié PCI-DSS niveau 1. Drop-Job ne voit ni ne conserve votre numéro de carte.'],
  ['Que se passe-t-il après le paiement ?', 'Vous revenez directement sur le générateur de CV, avec votre offre en cours, et toutes les fonctions Premium sont débloquées immédiatement.'],
]

function Check({ muted = false }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke={muted ? '#aeaeb2' : '#1d8348'} strokeWidth="1.8" strokeLinecap="round" width={14} height={14} aria-hidden="true" className="mt-[3px] shrink-0">
      <polyline points="2,7 6,11 12,3" />
    </svg>
  )
}

function PriceCard({ name, tagline, amount, unit, perks, highlight, badge, children }: {
  name: string; tagline: string; amount: string; unit?: string; perks: string[]
  highlight?: boolean; badge?: string; children: React.ReactNode
}) {
  return (
    <div className={`relative flex flex-col rounded-3xl bg-white p-6 sm:p-7 ${highlight ? 'border-2 border-[#0071e3] shadow-[0_8px_32px_rgba(0,113,227,.12)]' : 'border border-black/[0.08]'}`}>
      {badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-[#0071e3] px-3 py-1 text-[11px] font-semibold text-white">{badge}</span>
      )}
      <h2 className="text-lg font-semibold tracking-tight">{name}</h2>
      <p className="mt-1 min-h-[40px] text-[13px] text-[#6e6e73]">{tagline}</p>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-[40px] font-semibold leading-none tracking-tight">{amount}</span>
        {unit && <span className="text-sm text-[#6e6e73]">/ {unit}</span>}
      </p>
      <ul className="mb-6 mt-5 flex-1 space-y-2.5">
        {perks.map(p => (
          <li key={p} className="flex gap-2.5 text-[14px] text-[#424245]"><Check />{p}</li>
        ))}
      </ul>
      {children}
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <JsonLd data={breadcrumb([{ name: 'Accueil', path: '/' }, { name: 'Tarifs', path: '/pricing' }])} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }} />
      <SiteHeader />
      <Suspense fallback={null}><PricingNotice /></Suspense>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#0071e3]">Drop-Job Premium</p>
          <h1 className="text-[clamp(28px,5vw,44px)] font-semibold leading-tight tracking-tight">
            Un CV et une lettre sur-mesure pour chaque candidature
          </h1>
          <p className="mt-3 text-base font-light text-[#6e6e73] sm:text-lg">
            Postulez plus vite et mieux : autant de CV et de lettres que d&apos;offres, prêts en moins de 30 secondes.
          </p>
        </div>

        {/* Mobile : l'offre recommandée en premier */}
        <div className="grid gap-5 pt-3 md:grid-cols-3 md:items-stretch">
          <div className="order-3 md:order-1">
            <PriceCard name="Gratuit" tagline="Pour découvrir Drop-Job." amount="0 €" perks={FREE_PERKS}>
              <FreePlanButton />
            </PriceCard>
          </div>
          <div className="order-1 md:order-2">
            <PriceCard name="Mensuel" tagline="Accès illimité, le plus avantageux pour une recherche suivie." amount="9,90 €" unit="mois" perks={PREMIUM_PERKS} highlight badge="Le plus choisi · −34 %">
              <PlanButton period="monthly" label="Passer à Premium — 9,90 € / mois" primary />
            </PriceCard>
          </div>
          <div className="order-2 md:order-3">
            <PriceCard name="Pass semaine" tagline="Idéal pour un sprint de candidatures de quelques jours." amount="3,49 €" unit="semaine" perks={PREMIUM_PERKS}>
              <PlanButton period="weekly" label="Prendre le pass semaine — 3,49 €" />
            </PriceCard>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-[#6e6e73]">
          Prix TTC. Abonnement sans engagement, renouvelé automatiquement, résiliable en 1 clic.
          En vous abonnant, vous acceptez nos <a href="/legal/cgu" className="text-[#0071e3] no-underline">CGU</a> et
          notre <a href="/legal/confidentialite" className="text-[#0071e3] no-underline">politique de confidentialité</a>.
        </p>

        <section aria-label="Garanties" className="mt-12 grid gap-4 sm:grid-cols-3">
          {REASSURANCE.map(([icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-black/[0.08] bg-white p-5">
              <p className="mb-2 text-xl" aria-hidden="true">{icon}</p>
              <p className="text-[15px] font-semibold">{title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6e6e73]">{text}</p>
            </div>
          ))}
        </section>

        <section className="mt-14" aria-labelledby="faq">
          <h2 id="faq" className="mb-5 text-2xl font-semibold tracking-tight">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-black/[0.08] bg-white p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                  {q}<span className="text-[#6e6e73] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-[#6e6e73]">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
