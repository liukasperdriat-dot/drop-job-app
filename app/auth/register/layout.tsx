import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'Créer un compte | Drop-Job',
  robots: { index: false },
}

// En-tête commun du site au-dessus de la carte
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <><SiteHeader />{children}</>
}
