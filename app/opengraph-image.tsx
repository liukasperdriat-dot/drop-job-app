import { renderOgImage } from '@/lib/og-image'

export const alt = 'Drop-Job : CV et lettre sur-mesure en 30 secondes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return renderOgImage({
    title: 'Un CV adapté à chaque offre, en 30 secondes',
    subtitle: 'Toutes les offres d’emploi réunies, et un CV et une lettre sur-mesure générés par l’IA.',
  })
}
