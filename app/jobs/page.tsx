'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JobsPage() {
  const [jobs, setJobs]         = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [keyword, setKeyword]   = useState('')
  const [location, setLocation] = useState('')
  const router = useRouter()

  async function searchJobs() {
    setLoading(true)
    setJobs([])

    const params = new URLSearchParams({ keyword, location })
    const res = await fetch(`/api/jobs?${params}`)
    const data = await res.json()

    setJobs(data.jobs || [])
    setLoading(false)
  }

  useEffect(() => { searchJobs() }, [])

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo} onClick={() => router.push('/dashboard')}>
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="#1d1d1f" strokeWidth="2.2" fill="none"/>
              <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="#1d1d1f" strokeWidth="1.5" fill="none" opacity="0.45"/>
              <circle cx="20" cy="20" r="7.5" stroke="#1d1d1f" strokeWidth="1.8" fill="none"/>
              <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="17,20.5 20,23.5 23,20.5" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span style={styles.logoText}>drop-job</span>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <h1 style={styles.title}>Offres d'emploi</h1>

        {/* Barre de recherche */}
        <div style={styles.searchBar}>
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Métier, entreprise..."
            style={styles.searchInput}
            onKeyDown={e => e.key === 'Enter' && searchJobs()}
          />
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Ville..."
            style={styles.locationInput}
            onKeyDown={e => e.key === 'Enter' && searchJobs()}
          />
          <button onClick={searchJobs} style={styles.searchBtn}>
            Rechercher
          </button>
        </div>

        {/* Résultats */}
        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner}/>
            <div>Recherche en cours...</div>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div style={styles.emptyState}>
            Aucune offre trouvée. Essayez avec d'autres mots-clés.
          </div>
        )}

        <div style={styles.grid}>
          {jobs.map(job => (
            <div key={job.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.source}>{job.source}</div>
              </div>
              <div style={styles.cardTitle}>{job.title}</div>
              <div style={styles.cardCompany}>{job.company} · {job.location}</div>
              <div style={styles.tags}>
                <span style={styles.tag}>{job.contract}</span>
                {job.remote && <span style={styles.tag}>{job.remote}</span>}
              </div>
              <div style={styles.salary}>{job.salary}</div>
              <button
                style={styles.cvBtn}
                onClick={() => router.push(`/cv?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&jobDescription=${encodeURIComponent(job.description)}`)}
              >
                Générer mon CV pour cette offre
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Inter', -apple-system, sans-serif" },
  nav: { position: 'sticky', top: 0, zIndex: 100, height: 52, background: 'rgba(245,245,247,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.08)' },
  navInner: { maxWidth: 1080, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center' },
  logo: { display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' },
  logoText: { fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: '#1d1d1f' },
  content: { maxWidth: 1080, margin: '0 auto', padding: '48px 24px' },
  title: { fontSize: 32, fontWeight: 600, letterSpacing: '-0.04em', color: '#1d1d1f', marginBottom: 24 },
  searchBar: { display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' as const },
  searchInput: { flex: 2, padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', fontSize: 15, fontFamily: 'inherit', outline: 'none', background: '#fff', minWidth: 200 },
  locationInput: { flex: 1, padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', fontSize: 15, fontFamily: 'inherit', outline: 'none', background: '#fff', minWidth: 120 },
  searchBtn: { padding: '11px 24px', borderRadius: 10, background: '#0071e3', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  loadingState: { textAlign: 'center' as const, padding: '60px 0', color: '#6e6e73' },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '2px solid #e8e8ed', borderTopColor: '#0071e3', animation: 'spin .7s linear infinite', margin: '0 auto 16px' },
  emptyState: { textAlign: 'center' as const, padding: '60px 0', color: '#6e6e73', fontSize: 15 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,.05)' },
  cardTop: { display: 'flex', justifyContent: 'flex-end', marginBottom: 12 },
  source: { fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 100, background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.08)', color: '#aeaeb2', textTransform: 'uppercase' as const, letterSpacing: '.02em' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, letterSpacing: '-0.02em' },
  cardCompany: { fontSize: 13, color: '#6e6e73', marginBottom: 12 },
  tags: { display: 'flex', gap: 5, flexWrap: 'wrap' as const, marginBottom: 12 },
  tag: { padding: '3px 9px', borderRadius: 100, fontSize: 11, background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.08)', color: '#6e6e73' },
  salary: { fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 14, letterSpacing: '-0.02em' },
  cvBtn: { width: '100%', padding: '9px', borderRadius: 8, background: 'rgba(0,113,227,0.07)', color: '#0071e3', border: '1px solid rgba(0,113,227,0.14)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}