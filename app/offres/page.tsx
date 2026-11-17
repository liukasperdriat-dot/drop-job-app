import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import JsonLd, { breadcrumb } from '@/components/JsonLd'
import { METIERS, VILLES, offresPath } from '@/lib/seo-catalog'

export const metadata: Metadata = {
  title: "Offres d'emploi par métier et par ville | Drop-Job",
  description: "Toutes les offres d'emploi France Travail et Adzuna classées par métier et par grande ville : vendeur, infirmier, préparateur de commandes, développeur web, commercial…",
  alternates: { canonical: '/offres' },
}

export default function OffresIndexPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <JsonLd data={breadcrumb([{ name: 'Accueil', path: '/' }, { name: 'Offres par métier', path: '/offres' }])} />
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <h1 className="text-[clamp(26px,4.5vw,40px)] font-semibold leading-tight tracking-tight">Offres d&apos;emploi par métier et par ville</h1>
        <p className="mt-2 max-w-2xl text-[15px] font-light text-[#6e6e73]">
          Choisissez un métier et une ville : les offres France Travail et Adzuna sont réunies sur une seule page, avec un CV adapté à chaque annonce.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {METIERS.map(m => (
            <section key={m.slug} className="rounded-2xl border border-black/[0.08] bg-white p-5">
              <h2 className="text-[15px] font-semibold">{m.label}</h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {VILLES.map(v => (
                  <li key={v.slug}>
                    <Link href={offresPath(m.slug, v.slug)} className="inline-block rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs text-[#3a3a3c] no-underline hover:text-[#0071e3]">{v.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
