'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CompanyLogo from '@/components/CompanyLogo'

export default function JobsSlugContent({ metier, ville }: { metier: string; ville: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams({ keyword: metier, location: ville, source: 'tout' })
    fetch(`/api/jobs?${params}`)
      .then(r => r.json())
      .then(data => { setJobs(data.jobs || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [metier, ville])

  function getApplyUrl(job: any) {
    const src = (job.source || '').toLowerCase()
    if (src.includes('adzuna')) return job.redirect_url || job.url || ''
    if (src.includes('francetravail') || src.includes('france travail'))
      return `https://candidat.francetravail.fr/offres/recherche/detail/${job.id}`
    return ''
  }

  async function handleCV(job: any) {
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id, job_title: job.title, company: job.company, location: job.location, contract: job.contract, salary: job.salary }),
      })
    } catch {}
    const applyUrl = getApplyUrl(job)
    router.push(`/cv?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&description=${encodeURIComponent(job.description || '')}${applyUrl ? `&applyUrl=${encodeURIComponent(applyUrl)}` : ''}`)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#6e6e73' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #e8e8ed', borderTopColor: '#0071e3', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
      <div style={{ fontSize: 14 }}>Recherche en cours…</div>
    </div>
  )

  if (!jobs.length) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: '#1d1d1f', marginBottom: 6 }}>Aucune offre trouvée</div>
      <div style={{ fontSize: 14, color: '#6e6e73' }}>Essayez avec d&apos;autres mots-clés ou une autre ville.</div>
    </div>
  )

  return (
    <>
      <div style={{ textAlign: 'right', fontSize: 13, color: '#aeaeb2', marginBottom: 16 }}>
        {jobs.length} offre{jobs.length > 1 ? 's' : ''}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
        {jobs.map(job => (
          <JobCard key={job.id} job={job} onOpen={() => setSelectedJob(job)} onCV={() => handleCV(job)} />
        ))}
      </div>

      {selectedJob && (
        <div
          onClick={e => e.target === e.currentTarget && setSelectedJob(null)}
          style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.2)', backdropFilter: 'blur(8px)', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,.08)', width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto', padding: 28, boxShadow: '0 2px 6px rgba(0,0,0,.07),0 8px 28px rgba(0,0,0,.07)' }}>
            <button
              onClick={() => setSelectedJob(null)}
              style={{ float: 'right', width: 26, height: 26, borderRadius: '50%', background: '#f5f5f7', border: '1px solid rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6e6e73' }}
            >
              <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width={11} height={11}>
                <line x1="1" y1="1" x2="10" y2="10"/><line x1="10" y1="1" x2="1" y2="10"/>
              </svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <CompanyLogo company={selectedJob.company} size={44} />
              <div>
                <div style={{ fontSize: 12, color: '#aeaeb2', marginBottom: 2 }}>{selectedJob.company} · {selectedJob.location}</div>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em' }}>{selectedJob.title}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 20 }}>
              {[selectedJob.contract, selectedJob.remote, selectedJob.source].filter(Boolean).map((t: string) => (
                <span key={t} style={{ padding: '3px 9px', borderRadius: 100, fontSize: 11, background: '#f5f5f7', border: '1px solid rgba(0,0,0,.08)', color: '#6e6e73' }}>{t}</span>
              ))}
            </div>

            {selectedJob.salary && (
              <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.03em', marginBottom: 20 }}>{selectedJob.salary}</div>
            )}

            {selectedJob.description && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#aeaeb2', marginBottom: 8 }}>Description</div>
                <p style={{ fontSize: 13, color: '#6e6e73', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
              </div>
            )}

            <button
              onClick={() => { setSelectedJob(null); handleCV(selectedJob) }}
              style={{ width: '100%', padding: 13, borderRadius: 10, background: '#0071e3', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Générer mon CV pour cette offre
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function JobCard({ job, onOpen, onCV }: { job: any; onOpen: () => void; onCV: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      style={{ background: '#fff', border: `1px solid ${hovered ? 'rgba(0,0,0,.14)' : 'rgba(0,0,0,.08)'}`, borderRadius: 18, padding: 20, cursor: 'pointer', boxShadow: hovered ? '0 2px 6px rgba(0,0,0,.07),0 8px 28px rgba(0,0,0,.07)' : '0 1px 2px rgba(0,0,0,.05),0 2px 12px rgba(0,0,0,.05)', transition: 'all .18s', transform: hovered ? 'translateY(-2px)' : 'none' }}
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
        onClick={e => { e.stopPropagation(); onCV() }}
        style={{ display: 'block', width: '100%', marginTop: 12, padding: 9, background: 'rgba(0,113,227,.07)', color: '#0071e3', border: '1px solid rgba(0,113,227,.14)', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Générer mon CV pour cette offre
      </button>
    </div>
  )
}
