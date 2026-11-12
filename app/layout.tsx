import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'

// Police Inter hébergée par le site lui-même (téléchargée au build) :
// aucune requête vers les serveurs de Google lors des visites.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  // Pas de canonical ici : il serait hérité par toutes les pages et les
  // désignerait toutes comme des copies de l'accueil. Chaque page publique
  // déclare le sien (offres, pages légales).
  metadataBase: new URL('https://www.drop-job.fr'),
  title: "Drop-Job — Postulez. C'est fait.",
  description:
    "Trouvez votre emploi idéal avec Drop-Job. Offres France Travail et Adzuna réunies. L'IA génère votre CV adapté pour chaque offre en un clic.",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Drop-Job',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function (reg) { console.log('SW registered:', reg.scope) })
                    .catch(function (err) { console.error('SW registration failed:', err) })
                })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
