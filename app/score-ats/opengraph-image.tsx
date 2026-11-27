import { renderOgImage } from '@/lib/og-image'

export const alt = 'Score ATS gratuit sur Drop-Job'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return renderOgImage({
    eyebrow: 'Outil gratuit',
    title: 'Votre CV passe-t-il les filtres ATS ?',
    subtitle: 'Comparez votre CV à une offre et découvrez les mots-clés qui manquent.',
  })
}
