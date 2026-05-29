import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import JobsSlugContent from './content'

const METIERS: Record<string, string> = {
  developpeur: 'Développeur',
  commercial: 'Commercial',
  marketing: 'Marketing',
  comptable: 'Comptable',
  infirmier: 'Infirmier',
  chauffeur: 'Chauffeur',
  vendeur: 'Vendeur',
  assistant: 'Assistant',
  ingenieur: 'Ingénieur',
  alternance: 'Alternance',
}

const VILLES: Record<string, string> = {
  paris: 'Paris',
  lyon: 'Lyon',
  marseille: 'Marseille',
  toulouse: 'Toulouse',
  bordeaux: 'Bordeaux',
  nantes: 'Nantes',
  strasbourg: 'Strasbourg',
  lille: 'Lille',
  rennes: 'Rennes',
  montpellier: 'Montpellier',
}

function parseSlug(slug: string) {
  const parts = slug.split('-')
  if (parts.length < 2) return null
  const villeSlug = parts[parts.length - 1]
  const metierSlug = parts.slice(0, -1).join('-')
  if (!VILLES[villeSlug] || !METIERS[metierSlug]) return null
  return {
    metier: metierSlug,
    ville: villeSlug,
    metierLabel: METIERS[metierSlug],
    villeLabel: VILLES[villeSlug],
  }
}

export function generateStaticParams() {
  return Object.keys(METIERS).flatMap(m =>
    Object.keys(VILLES).map(v => ({ slug: `${m}-${v}` }))
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const parsed = parseSlug(params.slug)
  if (!parsed) return {}
  const { metierLabel, villeLabel } = parsed
  return {
    title: `Offres d'emploi ${metierLabel} à ${villeLabel} | Drop-Job`,
    description: `Trouvez les meilleures offres d'emploi ${metierLabel} à ${villeLabel}. Postulez aux offres France Travail et Adzuna. Générez votre CV adapté gratuitement avec Drop-Job.`,
  }
}

export default function JobsSlugPage({ params }: { params: { slug: string } }) {
  const parsed = parseSlug(params.slug)
  if (!parsed) notFound()
  const { metier, ville, metierLabel, villeLabel } = parsed!

  return (
    <>
      <div style={{ background: '#f5f5f7', color: '#1d1d1f', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
        <nav style={{ position: 'sticky', top: 0, zIndex: 200, height: 52, background: 'rgba(245,245,247,0.92)', backdropFilter: 'blur(24px) saturate(180%)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: '#1d1d1f', fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>
              <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
                <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="2.2" fill="none"/>
                <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.45"/>
                <circle cx="20" cy="20" r="7.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="17,20.5 20,23.5 23,20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              drop-job
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/jobs" style={{ fontSize: 13, color: '#6e6e73', textDecoration: 'none', padding: '5px 13px', borderRadius: 100 }}>Toutes les offres</Link>
              <Link href="/cv" style={{ padding: '7px 17px', borderRadius: 100, fontSize: 13, fontWeight: 500, background: '#0071e3', color: '#fff', textDecoration: 'none' }}>Mon CV</Link>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 80px' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 600, letterSpacing: '-0.04em', marginBottom: 6 }}>
              Offres d&apos;emploi {metierLabel} à {villeLabel}
            </h1>
            <p style={{ fontSize: 15, color: '#6e6e73', fontWeight: 300 }}>
              Agrégées depuis France Travail et Adzuna.
            </p>
          </div>

          <Suspense fallback={
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#6e6e73' }}>
              <div style={{ fontSize: 14 }}>Chargement des offres…</div>
            </div>
          }>
            <JobsSlugContent metier={metier} ville={ville} />
          </Suspense>
        </div>
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
