import { renderOgImage } from '@/lib/og-image'
import { findModele } from '@/lib/cv-modeles'

export const alt = 'Modèle de CV par métier sur Drop-Job'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ metier: string }> }) {
  const { metier } = await params
  const modele = findModele(metier)
  return renderOgImage({
    eyebrow: 'Modèle de CV gratuit',
    title: modele ? `CV ${modele.metier}` : 'Modèles de CV par métier',
    subtitle: 'Exemple rédigé, compétences clés et conseils, puis un CV adapté à l’offre en 30 secondes.',
  })
}
