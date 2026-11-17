import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'Connexion | Drop-Job',
  robots: { index: false },
}

// En-tête commun du site au-dessus de la carte
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <><SiteHeader />{children}</>
}
