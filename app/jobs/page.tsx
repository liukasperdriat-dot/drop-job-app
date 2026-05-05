'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CompanyLogo from '@/components/CompanyLogo'

const v = {
  bg: '#f5f5f7', bg2: '#e8e8ed', white: '#fff',
  text: '#1d1d1f', text2: '#6e6e73', text3: '#aeaeb2',
  line: 'rgba(0,0,0,0.08)', line2: 'rgba(0,0,0,0.14)',
  blue: '#0071e3',
  shadow: '0 1px 2px rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.05)',
  shadow2: '0 2px 6px rgba(0,0,0,.07), 0 8px 28px rgba(0,0,0,.07)',
}

const FILTERS = [
  { val: '', label: 'Tout' },
  { val: 'developpeur', label: 'Dev' },
  { val: 'designer', label: 'Design' },
  { val: 'data', label: 'Data' },
  { val: 'product manager', label: 'Product' },
  { val: 'devops', label: 'DevOps' },
]

export default function JobsPage() {
  const [jobs, setJobs]         = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [keyword, setKeyword]   = useState('')
  const [location, setLocation] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [selectedJob, setSelectedJob]   = useState<any>(null)
  const router = useRouter()

  async function searchJobs(kw = keyword, loc = location) {
    setLoading(true)
    setJobs([])
    const params = new URLSearchParams({ keyword: kw, location: loc })
    const res  = await fetch(`/api/jobs?${params}`)
    const data = await res.json()
    setJobs(data.jobs || [])
    setLoading(false)
  }

  useEffect(() => { searchJobs() }, [])

  function handleFilter(val: string) {
    setActiveFilter(val)
    setKeyword(val)
    searchJobs(val, location)
  }

  function handleSearch() {
    setActiveFilter('')
    searchJobs()
  }

  async function handleCVWithSave(job: any) {
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          location: job.location,
          contract: job.contract,
          salary: job.salary,
        }),
      })
    } catch {
      // Ne pas bloquer la navigation si la sauvegarde échoue
    }
    router.push(`/cv?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&description=${encodeURIComponent(job.description || '')}`)
  }

  return (
    <>
    <div style={{ background: v.bg, color: v.text, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, height: 52, background: 'rgba(245,245,247,0.92)', backdropFilter: 'blur(24px) saturate(180%)', borderBottom: `1px solid ${v.line}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: v.text, fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>
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
            <Link href="/dashboard" style={{ fontSize: 13, color: v.text2, textDecoration: 'none', padding: '5px 13px', borderRadius: 100 }}>Dashboard</Link>
            <Link href="/dashboard" style={{ padding: '7px 17px', borderRadius: 100, fontSize: 13, fontWeight: 500, background: v.blue, color: '#fff', textDecoration: 'none' }}>Mon CV</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 600, letterSpacing: '-0.04em', marginBottom: 6 }}>Offres du moment</h1>
          <p style={{ fontSize: 15, color: v.text2, fontWeight: 300 }}>Agrégées depuis France Travail, LinkedIn, Indeed et plus.</p>
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', background: v.white, borderRadius: 100, border: `1px solid ${v.line2}`, boxShadow: v.shadow2, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0 10px 0 18px', display: 'flex', color: v.text3, flexShrink: 0 }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width={15} height={15}><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>
          </div>
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Métier, compétence, entreprise…"
            style={{ flex: 1, padding: '13px 0', minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 15, color: v.text }}
          />
          <div style={{ width: 1, height: 20, background: v.line2, flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', flexShrink: 0 }}>
            <svg viewBox="0 0 12 16" fill="none" stroke={v.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><path d="M6 1C3.8 1 2 2.8 2 5c0 3.3 4 9 4 9s4-5.7 4-9c0-2.2-1.8-4-4-4z"/><circle cx="6" cy="5" r="1.3"/></svg>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Ville…"
              style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: v.text2, width: 80 }}
            />
          </div>
          <button onClick={handleSearch} style={{ margin: 5, padding: '8px 20px', borderRadius: 100, background: v.blue, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
            Rechercher
          </button>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 28, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <span
              key={f.val}
              onClick={() => handleFilter(f.val)}
              style={{ padding: '5px 14px', borderRadius: 100, background: activeFilter === f.val ? 'rgba(0,113,227,.07)' : v.white, border: `1px solid ${activeFilter === f.val ? 'rgba(0,113,227,.18)' : v.line}`, fontSize: 12, fontWeight: 500, color: activeFilter === f.val ? v.blue : v.text2, cursor: 'pointer', userSelect: 'none', transition: 'all .12s' }}
            >
              {f.label}
            </span>
          ))}
          {jobs.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 13, color: v.text3, alignSelf: 'center' }}>{jobs.length} offre{jobs.length > 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: v.text2 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #e8e8ed', borderTopColor: v.blue, animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 14 }}>Recherche en cours…</div>
          </div>
        )}

        {/* Empty */}
        {!loading && jobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: v.text, marginBottom: 6 }}>Aucune offre trouvée</div>
            <div style={{ fontSize: 14, color: v.text2 }}>Essayez avec d'autres mots-clés ou une autre ville.</div>
          </div>
        )}

        {/* Grid */}
        {!loading && jobs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
            {jobs.map(job => (
              <JobCard key={job.id} job={job} onOpen={() => setSelectedJob(job)} onCV={() => handleCVWithSave(job)} />
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Job detail modal */}
    {selectedJob && (
      <div onClick={e => e.target === e.currentTarget && setSelectedJob(null)} style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.2)', backdropFilter: 'blur(8px)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,.08)', width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto', padding: 28, boxShadow: v.shadow2 }}>
          <button onClick={() => setSelectedJob(null)} style={{ float: 'right', width: 26, height: 26, borderRadius: '50%', background: '#f5f5f7', border: '1px solid rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: v.text2 }}>
            <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width={11} height={11}><line x1="1" y1="1" x2="10" y2="10"/><line x1="10" y1="1" x2="1" y2="10"/></svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <CompanyLogo company={selectedJob.company} size={44} />
            <div>
              <div style={{ fontSize: 12, color: v.text3, marginBottom: 2 }}>{selectedJob.company} · {selectedJob.location}</div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em' }}>{selectedJob.title}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 20 }}>
            {[selectedJob.contract, selectedJob.remote, selectedJob.source].filter(Boolean).map((t: string) => (
              <span key={t} style={{ padding: '3px 9px', borderRadius: 100, fontSize: 11, background: '#f5f5f7', border: '1px solid rgba(0,0,0,.08)', color: v.text2 }}>{t}</span>
            ))}
          </div>

          {selectedJob.salary && (
            <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.03em', marginBottom: 20 }}>{selectedJob.salary}</div>
          )}

          {selectedJob.description && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: v.text3, marginBottom: 8 }}>Description</div>
              <p style={{ fontSize: 13, color: v.text2, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedJob.description?.slice(0, 600)}{selectedJob.description?.length > 600 ? '…' : ''}</p>
            </div>
          )}

          <button
            onClick={() => { setSelectedJob(null); handleCVWithSave(selectedJob); }}
            style={{ width: '100%', padding: 13, borderRadius: 10, background: v.blue, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Générer mon CV pour cette offre
          </button>
        </div>
      </div>
    )}

    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
    </>
  )
}

function JobCard({ job, onOpen, onCV }: { job: any; onOpen: () => void; onCV: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', border: `1px solid ${hovered ? 'rgba(0,0,0,.14)' : 'rgba(0,0,0,.08)'}`, borderRadius: 18, padding: 20, cursor: 'pointer', boxShadow: hovered ? '0 2px 6px rgba(0,0,0,.07),0 8px 28px rgba(0,0,0,.07)' : '0 1px 2px rgba(0,0,0,.05),0 2px 12px rgba(0,0,0,.05)', transition: 'all .18s', transform: hovered ? 'translateY(-2px)' : 'none' }}
      onClick={onOpen}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <CompanyLogo company={job.company} />
        <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '.02em', background: '#f5f5f7', border: '1px solid rgba(0,0,0,.08)', color: '#aeaeb2' }}>{job.source}</span>
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 3, color: '#1d1d1f' }}>{job.title}</div>
      <div style={{ fontSize: 13, color: '#6e6e73', marginBottom: 12 }}>{job.company} · {job.location}</div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
        {[job.contract, job.remote].filter(Boolean).map((t: string) => (
          <span key={t} style={{ padding: '3px 9px', borderRadius: 100, fontSize: 11, background: '#f5f5f7', border: '1px solid rgba(0,0,0,.08)', color: '#6e6e73' }}>{t}</span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(0,0,0,.08)' }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', color: '#1d1d1f' }}>{job.salary || 'Salaire NC'}</span>
      </div>

      <button
        onClick={e => { e.stopPropagation(); onCV(); }}
        style={{ display: 'block', width: '100%', marginTop: 12, padding: 9, background: 'rgba(0,113,227,.07)', color: '#0071e3', border: '1px solid rgba(0,113,227,.14)', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Générer mon CV pour cette offre
      </button>
    </div>
  )
}

