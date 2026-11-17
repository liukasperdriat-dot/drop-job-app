import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import JsonLd, { breadcrumb } from '@/components/JsonLd'
import { MODELES_CV } from '@/lib/cv-modeles'
import { modelePath } from '@/lib/seo-catalog'

export const metadata: Metadata = {
  title: 'Modèles de CV par métier : 20 exemples gratuits | Drop-Job',
  description: 'Exemples de CV gratuits pour 20 métiers qui recrutent : vendeur, préparateur de commandes, infirmier, développeur web, commercial, comptable… Compétences clés et conseils pour chacun.',
  alternates: { canonical: '/modeles-cv' },
}

export default function ModelesCvIndexPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <JsonLd data={breadcrumb([{ name: 'Accueil', path: '/' }, { name: 'Modèles de CV', path: '/modeles-cv' }])} />
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <h1 className="text-[clamp(26px,4.5vw,40px)] font-semibold leading-tight tracking-tight">Modèles de CV par métier</h1>
        <p className="mt-2 max-w-2xl text-[15px] font-light text-[#6e6e73]">
          Un exemple de CV complet pour chaque métier, avec les compétences que les recruteurs recherchent et des conseils concrets. Personnalisez-le ensuite avec votre propre parcours.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODELES_CV.map(m => (
            <li key={m.slug}>
              <Link href={modelePath(m.slug)} className="block h-full rounded-2xl border border-black/[0.08] bg-white p-5 no-underline transition-shadow hover:shadow-md">
                <p className="text-[15px] font-semibold text-[#1d1d1f]">CV {m.metier}</p>
                <p className="mt-1 text-xs text-[#6e6e73]">{m.competences.slice(0, 3).join(' · ')}</p>
                <p className="mt-3 text-xs font-medium text-[#0071e3]">Voir l&apos;exemple →</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  )
}
