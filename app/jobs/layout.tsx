import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'

// La page /jobs est un composant client : son titre et son canonical
// sont déclarés ici. Les pages /jobs/[slug] les remplacent par les leurs.
export const metadata: Metadata = {
  title: "Offres d'emploi en France | Drop-Job",
  description: "Toutes les offres d'emploi France Travail et Adzuna réunies. Filtrez par ville, contrat et rayon, puis générez un CV adapté à chaque offre.",
  alternates: { canonical: '/jobs' },
}

// En-tête commun dans le layout : présent dès le HTML initial (la page est rendue côté navigateur)
export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <><SiteHeader />{children}</>
}
