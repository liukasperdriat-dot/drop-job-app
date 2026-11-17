import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import JsonLd, { breadcrumb, SITE_URL } from '@/components/JsonLd'
import AtsTool from './AtsTool'

export const metadata: Metadata = {
  title: 'Score ATS gratuit : testez votre CV face à une offre | Drop-Job',
  description: "Calculez gratuitement et sans inscription le score ATS de votre CV pour une offre d'emploi : pourcentage de correspondance, mots-clés manquants et conseils pour passer les logiciels de tri.",
  alternates: { canonical: '/score-ats' },
  openGraph: {
    title: 'Score ATS gratuit de votre CV',
    description: "Votre CV passera-t-il les logiciels de tri ? Testez-le gratuitement face à l'offre visée.",
    url: `${SITE_URL}/score-ats`,
    type: 'website',
  },
}

const FAQ: [string, string][] = [
  ["Qu'est-ce qu'un score ATS ?", "Un ATS (Applicant Tracking System) est le logiciel utilisé par de nombreux recruteurs pour trier les candidatures. Il compare votre CV aux mots-clés de l'offre. Le score ATS estime ce taux de correspondance : plus il est élevé, plus votre CV a de chances d'être lu par un humain."],
  ['Comment le score est-il calculé ?', "Notre outil repère les compétences et les termes importants de l'offre, vérifie lesquels figurent dans votre CV, puis contrôle la structure (coordonnées, sections Expérience, Formation et Compétences, longueur). Le score combine ces deux critères : 85 % pour les mots-clés, 15 % pour la structure."],
  ['Mes données sont-elles enregistrées ?', "Non. Le texte de votre CV et celui de l'offre sont analysés sur nos serveurs puis immédiatement oubliés. Aucun compte n'est nécessaire et rien n'est transmis à un service tiers."],
  ['Comment améliorer mon score ?', "Reprenez les mots exacts de l'offre pour les compétences que vous possédez vraiment, ajoutez des sections clairement titrées et vos coordonnées. Drop-Job peut aussi réécrire automatiquement votre CV pour chaque offre, sans rien inventer."],
]

export default function ScoreAtsPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <JsonLd data={breadcrumb([{ name: 'Accueil', path: '/' }, { name: 'Score ATS gratuit', path: '/score-ats' }])} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }} />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#0071e3]">Outil gratuit · sans inscription</p>
          <h1 className="text-[clamp(28px,5vw,44px)] font-semibold leading-tight tracking-tight">
            Votre CV passera-t-il les logiciels de tri ?
          </h1>
          <p className="mt-3 text-base font-light text-[#6e6e73] sm:text-lg">
            Collez votre CV et l&apos;offre visée : obtenez en quelques secondes votre score ATS sur 100 et les mots-clés qui vous manquent.
          </p>
        </div>

        <AtsTool />

        <section className="mt-14" aria-labelledby="comment">
          <h2 id="comment" className="mb-5 text-2xl font-semibold tracking-tight">Comment ça marche ?</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              ['1', 'Collez vos deux textes', "Le texte de votre CV actuel et celui de l'annonce qui vous intéresse."],
              ['2', 'Lisez votre score', "Taux de correspondance sur 100, mots-clés présents, mots-clés critiques manquants et points de structure à corriger."],
              ['3', 'Corrigez en un clic', "Drop-Job réécrit votre CV avec le vocabulaire de l'offre, à partir de vos vraies expériences, sans rien inventer."],
            ].map(([n, titre, texte]) => (
              <li key={n} className="rounded-2xl border border-black/[0.08] bg-white p-5">
                <p className="mb-2 text-xs font-bold tracking-widest text-[#0071e3]">0{n}</p>
                <p className="text-[15px] font-semibold">{titre}</p>
                <p className="mt-1 text-sm text-[#6e6e73]">{texte}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight">Questions fréquentes</h2>
          <div className="divide-y divide-black/[0.08] rounded-2xl border border-black/[0.08] bg-white">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold">
                  {q}
                  <span className="text-[#aeaeb2] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#6e6e73]">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
