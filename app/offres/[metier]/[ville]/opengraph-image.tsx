import { renderOgImage } from '@/lib/og-image'
import { findMetier, findVille } from '@/lib/seo-catalog'

export const alt = 'Offres d’emploi par métier et par ville sur Drop-Job'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ metier: string; ville: string }> }) {
  const { metier: m, ville: v } = await params
  const metier = findMetier(m)
  const ville = findVille(v)
  if (!metier || !ville) return renderOgImage({ title: 'Offres d’emploi par métier et par ville' })
  return renderOgImage({
    eyebrow: `Offres d’emploi · ${ville.label}`,
    title: `${metier.label} à ${ville.label}`,
    subtitle: 'Les dernières offres, salaires et contrats, avec un CV adapté à chaque annonce.',
  })
}
