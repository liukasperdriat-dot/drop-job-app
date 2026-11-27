import { renderOgImage } from '@/lib/og-image'

export const alt = 'Tarifs Drop-Job'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return renderOgImage({
    eyebrow: 'Tarifs',
    title: 'CV et lettres illimités avec Drop-Job Premium',
    subtitle: '1 CV gratuit chaque mois, sans carte bancaire. Premium sans engagement.',
  })
}
