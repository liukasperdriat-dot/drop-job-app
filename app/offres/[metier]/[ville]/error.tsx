'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import { findMetier, findVille } from '@/lib/seo-catalog'

// Affiché seulement si les sources d'offres sont en panne lors de la toute
// première génération de la page (sinon la dernière version valide reste servie).
// Rien n'est mis en cache : la page est régénérée à la visite suivante.
export default function OffresError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ metier: string; ville: string }>()
  const metier = findMetier(params?.metier ?? '')
  const ville = findVille(params?.ville ?? '')
  const search = new URLSearchParams()
  if (metier) search.set('q', metier.keyword)
  if (ville) search.set('location', ville.label)

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {metier && ville ? `Offres ${metier.label.toLowerCase()} à ${ville.label}` : 'Offres d’emploi'}
        </h1>
        <p className="mt-3 text-[15px] text-[#6e6e73]">
          Les sources d’offres (France Travail, Adzuna) ne répondent pas pour le moment.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[44px] items-center rounded-full bg-[#0071e3] px-5 text-sm font-semibold text-white hover:bg-[#0062c4]"
          >
            Réessayer
          </button>
          <Link href={`/jobs?${search}`} className="inline-flex min-h-[44px] items-center rounded-full border border-black/[0.14] px-5 text-sm font-medium text-[#1d1d1f] no-underline hover:bg-white">
            Lancer la recherche en direct
          </Link>
        </div>
      </main>
    </div>
  )
}
