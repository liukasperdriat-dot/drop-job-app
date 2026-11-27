import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import JsonLd, { SITE_URL } from '@/components/JsonLd'

// Accueil : métadonnées et données structurées rendues côté serveur,
// l'interface elle-même reste un composant client (HomeClient).

const TITLE = 'Drop-Job — CV et lettre sur-mesure en 30 secondes'
const DESCRIPTION =
  "Trouvez votre emploi idéal avec Drop-Job. Offres France Travail et Adzuna réunies. L'IA génère votre CV adapté pour chaque offre en un clic."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/', type: 'website', siteName: 'Drop-Job', locale: 'fr_FR' },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'Drop-Job',
            url: SITE_URL,
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
          },
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: 'Drop-Job',
            url: SITE_URL,
            inLanguage: 'fr-FR',
            publisher: { '@id': `${SITE_URL}/#organization` },
          },
        ],
      }} />
      <HomeClient />
    </>
  )
}
