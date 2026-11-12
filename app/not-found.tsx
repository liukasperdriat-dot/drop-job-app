import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page introuvable | Drop-Job',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, color: '#1d1d1f' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', color: '#aeaeb2', marginBottom: 10 }}>ERREUR 404</div>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 10 }}>Page introuvable</h1>
        <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 24, lineHeight: 1.6 }}>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ padding: '10px 22px', borderRadius: 100, background: '#0071e3', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Accueil</Link>
          <Link href="/jobs" style={{ padding: '10px 22px', borderRadius: 100, background: '#fff', color: '#1d1d1f', border: '1px solid rgba(0,0,0,.14)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Voir les offres</Link>
        </div>
      </div>
    </div>
  )
}
