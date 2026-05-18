import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.drop-job.fr'),
  alternates: {
    canonical: '/',
  },
  title: "Drop-Job — Postulez. C'est fait.",
  description: "Trouvez votre emploi idéal avec Drop-Job. Offres France Travail et Adzuna réunies. L'IA génère votre CV adapté pour chaque offre en un clic.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}