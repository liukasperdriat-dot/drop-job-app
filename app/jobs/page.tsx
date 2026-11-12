'use client'

import { Suspense } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CompanyLogo from '@/components/CompanyLogo'
import { openCvForJob } from '@/lib/cv-link'
import { NIVEAUX } from '@/lib/niveaux'
import { DEPARTEMENTS } from '@/lib/departements'

const NIVEAU_KEY = 'dropjob:niveau-etudes'

// Niveau d'études mémorisé sur l'appareil (page rendue uniquement côté navigateur)
function readSavedNiveau(): string {
  try {
    const v = localStorage.getItem(NIVEAU_KEY) || ''
    return /^[0-5]$/.test(v) ? v : ''
  } catch {
    return ''
  }
}

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
  { val: 'developpeur', label: 'Informatique & Dev' },
  { val: 'designer', label: 'Design & Créatif' },
  { val: 'data', label: 'Data & IA' },
  { val: 'product manager', label: 'Product & Business' },
  { val: 'devops', label: 'DevOps & Cloud' },
]

const CONTRACT_TYPES = [
  { code: '', label: 'Tout contrat' },
  { code: 'CDI', label: 'CDI' },
  { code: 'CDD', label: 'CDD' },
  { code: 'ALTERNANCE', label: 'Alternance / Apprentissage' },
  { code: 'MIS', label: 'Intérim' },
  { code: 'SAI', label: 'Saisonnier' },
  { code: 'LIB', label: 'Freelance / Libéral' },
]


function JobsPageContent() {
  const searchParams = useSearchParams()
  const [jobs, setJobs]         = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  // Valeurs de départ venues de l'accueil (?q=…&location=…&salaireMin=…)
  const [keyword, setKeyword]   = useState(() => searchParams.get('q') || '')
  const [location, setLocation] = useState(() => searchParams.get('location') || '')
  const [activeFilter, setActiveFilter] = useState('')
  const [selectedJob, setSelectedJob]   = useState<any>(null)
  const [departement, setDepartement]   = useState('')
  const [distance, setDistance]         = useState(50)
  const [source, setSource]             = useState<'tout' | 'francetravail' | 'adzuna'>('tout')
  const [typeContrat, setTypeContrat]   = useState('')
  const [error, setError]               = useState('')
  const [warning, setWarning]           = useState('')
  const [note, setNote]                 = useState('')
  const [niveau, setNiveau]             = useState(readSavedNiveau)
  const [debutant, setDebutant]         = useState(false)
  const [salaryFilter, setSalaryFilter] = useState<{ min: string; max: string } | null>(() => {
    const min = searchParams.get('salaireMin') || ''
    const max = searchParams.get('salaireMax') || ''
    return min || max ? { min, max } : null
  })
  const requestId = useRef(0)
  const router = useRouter()

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (window.innerWidth >= 768) return
    const fab = document.createElement('div')
    Object.assign(fab.style, {
      position: 'fixed', bottom: '24px', left: '50%',
      transform: 'translateX(-50%)', zIndex: '9999',
    })
    const link = document.createElement('a')
    link.href = '/cv'
    Object.assign(link.style, {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '8px', padding: '15px 32px', borderRadius: '16px',
      background: '#0071e3', color: '#fff', textDecoration: 'none',
      fontSize: '15px', fontWeight: '600',
      boxShadow: '0 4px 24px rgba(0,113,227,.35)',
      letterSpacing: '-0.01em', whiteSpace: 'nowrap',
      fontFamily: "var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif",
    })
    link.textContent = 'Créer mon CV'
    fab.appendChild(link)
    document.body.appendChild(fab)
    return () => { fab.remove() }
  }, [])

  type Filters = {
    kw: string; loc: string; dept: string; dist: number
    src: 'tout' | 'francetravail' | 'adzuna'; contrat: string
    salary: { min: string; max: string } | null
    niveau: string; debutant: boolean
  }

  // Filtres actuellement affichés (les gestionnaires remplacent ceux qui changent)
  function currentFilters(): Filters {
    return { kw: keyword, loc: location, dept: departement, dist: distance, src: source, contrat: typeContrat, salary: salaryFilter, niveau, debutant }
  }

  function buildSearchParams(f: Filters) {
    const params = new URLSearchParams({ keyword: f.kw, location: f.loc, source: f.src })
    if (f.contrat) params.append('typeContrat', f.contrat)
    // Département et rayon s'appliquent à toutes les sources (France Travail et Adzuna)
    params.append('distance', String(f.dist))
    if (f.dept) params.append('departement', f.dept)
    if (f.salary?.min) params.append('salMin', f.salary.min)
    if (f.salary?.max) params.append('salMax', f.salary.max)
    if (f.niveau !== '') params.append('niveau', f.niveau)
    if (f.debutant) params.append('debutant', '1')
    return params
  }

  // Appel à l'API ; seule la dernière recherche lancée a le droit d'afficher ses résultats
  async function fetchJobs(params: URLSearchParams, id: number) {
    try {
      const res  = await fetch(`/api/jobs?${params}`)
      const data = await res.json().catch(() => ({}))
      if (id !== requestId.current) return
      if (!res.ok) setError(data.error || 'Impossible de charger les offres. Réessayez dans un instant.')
      setJobs(data.jobs || [])
      if (data.warning) setWarning(data.warning)
      if (data.note) setNote(data.note)
    } catch {
      if (id === requestId.current) setError('Connexion impossible. Vérifiez votre accès à Internet puis réessayez.')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  function searchJobs(changes: Partial<Filters> = {}) {
    const id = ++requestId.current
    setLoading(true)
    setJobs([])
    setError('')
    setWarning('')
    setNote('')
    fetchJobs(buildSearchParams({ ...currentFilters(), ...changes }), id)
  }

  // Première recherche au chargement, avec les valeurs de départ
  // (l'état « chargement » est déjà actif dès l'affichage de la page)
  useEffect(() => {
    fetchJobs(buildSearchParams(currentFilters()), ++requestId.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function clearSalaryFilter() {
    setSalaryFilter(null)
    searchJobs({ salary: null })
  }

  function handleSourceChange(src: 'tout' | 'francetravail' | 'adzuna') {
    setSource(src)
    setActiveFilter('')
    searchJobs({ src })
  }

  function handleFilter(val: string) {
    setActiveFilter(val)
    setKeyword(val)
    searchJobs({ kw: val })
  }

  function handleSearch() {
    setActiveFilter('')
    searchJobs()
  }

  function handleDeptChange(dept: string) {
    setDepartement(dept)
    searchJobs({ dept })
  }

  function handleDistanceCommit(dist: number) {
    searchJobs({ dist })
  }

  function handleContratChange(val: string) {
    setTypeContrat(val)
    searchJobs({ contrat: val })
  }

  function handleNiveauChange(val: string) {
    setNiveau(val)
    // Mémorisé sur cet appareil pour les prochaines recherches
    try { if (val === '') localStorage.removeItem(NIVEAU_KEY); else localStorage.setItem(NIVEAU_KEY, val) } catch { /* stockage indisponible */ }
    searchJobs({ niveau: val })
  }

  function handleDebutantChange(val: boolean) {
    setDebutant(val)
    searchJobs({ debutant: val })
  }

  function handleCVWithSave(job: any) {
    openCvForJob(job, url => router.push(url))
  }

  return (
    <>
    <div style={{ background: v.bg, color: v.text, fontFamily: "var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif", minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>

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
            {!isMobile && (
              <Link href="/cv" style={{ padding: '7px 17px', borderRadius: 100, fontSize: 13, fontWeight: 500, background: v.blue, color: '#fff', textDecoration: 'none' }}>Mon CV</Link>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: isMobile ? '24px 16px 80px' : '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 600, letterSpacing: '-0.04em', marginBottom: 6 }}>Offres du moment</h1>
          <p style={{ fontSize: 15, color: v.text2, fontWeight: 300 }}>Agrégées depuis France Travail et Adzuna.</p>
        </div>

        {/* Search bar */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: v.white, borderRadius: 14, border: `1px solid ${v.line2}`, boxShadow: v.shadow, overflow: 'hidden' }}>
              <div style={{ padding: '0 10px 0 16px', display: 'flex', color: v.text3, flexShrink: 0 }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width={15} height={15}><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>
              </div>
              <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Métier, compétence, entreprise…" style={{ flex: 1, padding: '14px 10px 14px 6px', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 16, color: v.text }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: v.white, borderRadius: 14, border: `1px solid ${v.line2}`, boxShadow: v.shadow, overflow: 'hidden' }}>
              <div style={{ padding: '0 10px 0 16px', display: 'flex', color: v.text3, flexShrink: 0 }}>
                <svg viewBox="0 0 12 16" fill="none" stroke={v.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><path d="M6 1C3.8 1 2 2.8 2 5c0 3.3 4 9 4 9s4-5.7 4-9c0-2.2-1.8-4-4-4z"/><circle cx="6" cy="5" r="1.3"/></svg>
              </div>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Ville…" style={{ flex: 1, padding: '14px 10px 14px 6px', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 16, color: v.text }} />
            </div>
            <button onClick={handleSearch} style={{ width: '100%', padding: '14px', borderRadius: 14, background: v.blue, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 16, fontWeight: 500, cursor: 'pointer', minHeight: 44 }}>Rechercher</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', background: v.white, borderRadius: 100, border: `1px solid ${v.line2}`, boxShadow: v.shadow2, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ padding: '0 10px 0 18px', display: 'flex', color: v.text3, flexShrink: 0 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width={15} height={15}><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>
            </div>
            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Métier, compétence, entreprise…" style={{ flex: 1, padding: '13px 0', minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 15, color: v.text }} />
            <div style={{ width: 1, height: 20, background: v.line2, flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', flexShrink: 0 }}>
              <svg viewBox="0 0 12 16" fill="none" stroke={v.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><path d="M6 1C3.8 1 2 2.8 2 5c0 3.3 4 9 4 9s4-5.7 4-9c0-2.2-1.8-4-4-4z"/><circle cx="6" cy="5" r="1.3"/></svg>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Ville…" style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: v.text2, width: 80 }} />
            </div>
            <button onClick={handleSearch} style={{ margin: 5, padding: '8px 20px', borderRadius: 100, background: v.blue, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>Rechercher</button>
          </div>
        )}

        {/* Filtres */}
        {isMobile ? (
          /* ── Mobile ── */
          <div style={{ marginBottom: 16 }}>
            {/* Source */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: v.text3, marginBottom: 6 }}>Source</div>
              <div className="scroll-x" style={{ overflowX: 'auto' }}>
                <div style={{ display: 'inline-flex', background: v.bg2, borderRadius: 100, padding: 3 }}>
                  {(['tout', 'francetravail', 'adzuna'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => handleSourceChange(s)}
                      style={{
                        padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                        background: source === s ? '#fff' : 'transparent',
                        color: source === s ? v.text : v.text2,
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: source === s ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
                        transition: 'all .15s', whiteSpace: 'nowrap',
                      }}
                    >
                      {s === 'tout' ? 'Tout' : s === 'francetravail' ? 'France Travail' : 'Adzuna'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Catégorie */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: v.text3, marginBottom: 6 }}>Catégorie</div>
              <div className="scroll-x" style={{ overflowX: 'auto', display: 'flex', gap: 5 }}>
                {FILTERS.map(f => (
                  <span
                    key={f.val}
                    onClick={() => handleFilter(f.val)}
                    style={{ padding: '6px 14px', borderRadius: 100, background: activeFilter === f.val ? 'rgba(0,113,227,.07)' : v.white, border: `1px solid ${activeFilter === f.val ? 'rgba(0,113,227,.18)' : v.line}`, fontSize: 13, fontWeight: 500, color: activeFilter === f.val ? v.blue : v.text2, cursor: 'pointer', userSelect: 'none', transition: 'all .12s', flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Contrat */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: v.text3, marginBottom: 6 }}>Contrat</div>
              <div style={{ background: v.white, borderRadius: 10, border: `1px solid ${typeContrat ? 'rgba(0,113,227,.28)' : v.line2}`, boxShadow: v.shadow }}>
                <select
                  value={typeContrat}
                  onChange={e => handleContratChange(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: typeContrat ? v.blue : v.text2, fontWeight: typeContrat ? 500 : 400, cursor: 'pointer' }}
                >
                  {CONTRACT_TYPES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Niveau d'études + débutant */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, background: v.white, borderRadius: 10, border: `1px solid ${niveau !== '' ? 'rgba(0,113,227,.28)' : v.line2}`, boxShadow: v.shadow }}>
                <select
                  aria-label="Mon niveau d'études"
                  value={niveau}
                  onChange={e => handleNiveauChange(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: niveau !== '' ? v.blue : v.text2, fontWeight: niveau !== '' ? 500 : 400, cursor: 'pointer' }}
                >
                  <option value="">Tous niveaux d&apos;études</option>
                  {NIVEAUX.map((n, i) => <option key={n} value={String(i)}>Mon niveau : {n}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 12px', background: debutant ? 'rgba(0,113,227,.07)' : v.white, borderRadius: 10, border: `1px solid ${debutant ? 'rgba(0,113,227,.28)' : v.line2}`, boxShadow: v.shadow, fontSize: 13, color: debutant ? v.blue : v.text2, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={debutant} onChange={e => handleDebutantChange(e.target.checked)} style={{ accentColor: v.blue, width: 16, height: 16 }} />
                Débutant accepté
              </label>
            </div>

            {/* Département + rayon (toutes sources) */}
            {(
              <>
                {/* Département */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ background: v.white, borderRadius: 10, border: `1px solid ${departement ? 'rgba(0,113,227,.28)' : v.line2}`, boxShadow: v.shadow, display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: '0 8px 0 12px', color: v.text3, display: 'flex', flexShrink: 0 }}>
                      <svg viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><path d="M6 1C3.8 1 2 2.8 2 5c0 3.3 4 8 4 8s4-4.7 4-8c0-2.2-1.8-4-4-4z"/><circle cx="6" cy="5" r="1.5"/></svg>
                    </div>
                    <select
                      value={departement}
                      onChange={e => handleDeptChange(e.target.value)}
                      style={{ flex: 1, padding: '10px 10px 10px 0', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: departement ? v.blue : v.text2, fontWeight: departement ? 500 : 400, cursor: 'pointer' }}
                    >
                      <option value="">Tous les départements</option>
                      {DEPARTEMENTS.map(d => (
                        <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rayon */}
                <div style={{ background: v.white, borderRadius: 10, border: `1px solid ${v.line2}`, boxShadow: v.shadow, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: v.text2, flexShrink: 0 }}>Rayon</span>
                  <input
                    type="range"
                    min={5} max={100} step={5}
                    value={distance}
                    onChange={e => setDistance(Number(e.target.value))}
                    onMouseUp={e => handleDistanceCommit(Number((e.target as HTMLInputElement).value))}
                    onTouchEnd={e => handleDistanceCommit(Number((e.target as HTMLInputElement).value))}
                    style={{ flex: 1, accentColor: v.blue, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: v.blue, minWidth: 40, textAlign: 'right' }}>{distance} km</span>
                </div>
              </>
            )}

            {/* Compteur */}
            {jobs.length > 0 && (
              <div style={{ textAlign: 'right', fontSize: 13, color: v.text3 }}>
                {jobs.length} offre{jobs.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        ) : (
          /* ── Desktop ── */
          <>
            <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {/* Source */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: v.text3, marginBottom: 6 }}>Source</div>
                <div style={{ display: 'flex', background: v.bg2, borderRadius: 100, padding: 3 }}>
                  {(['tout', 'francetravail', 'adzuna'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => handleSourceChange(s)}
                      style={{
                        padding: '4px 13px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                        background: source === s ? '#fff' : 'transparent',
                        color: source === s ? v.text : v.text2,
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: source === s ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
                        transition: 'all .15s',
                      }}
                    >
                      {s === 'tout' ? 'Tout' : s === 'francetravail' ? 'France Travail' : 'Adzuna'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catégorie */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: v.text3, marginBottom: 6 }}>Catégorie</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
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
                    <span style={{ marginLeft: 'auto', fontSize: 13, color: v.text3 }}>{jobs.length} offre{jobs.length > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {/* Contrat */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: v.text3, marginBottom: 6 }}>Contrat</div>
                <div style={{ display: 'flex', alignItems: 'center', background: v.white, borderRadius: 10, border: `1px solid ${typeContrat ? 'rgba(0,113,227,.28)' : v.line2}`, boxShadow: v.shadow, overflow: 'hidden' }}>
                  <select
                    value={typeContrat}
                    onChange={e => handleContratChange(e.target.value)}
                    style={{ padding: '8px 10px 8px 12px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 13, color: typeContrat ? v.blue : v.text2, fontWeight: typeContrat ? 500 : 400, cursor: 'pointer' }}
                  >
                    {CONTRACT_TYPES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Niveau d'études */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: v.text3, marginBottom: 6 }}>Niveau d&apos;études</div>
                <div style={{ display: 'flex', alignItems: 'center', background: v.white, borderRadius: 10, border: `1px solid ${niveau !== '' ? 'rgba(0,113,227,.28)' : v.line2}`, boxShadow: v.shadow, overflow: 'hidden' }}>
                  <select
                    aria-label="Mon niveau d'études"
                    title="Masque les offres qui exigent un diplôme supérieur au vôtre"
                    value={niveau}
                    onChange={e => handleNiveauChange(e.target.value)}
                    style={{ padding: '8px 10px 8px 12px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 13, color: niveau !== '' ? v.blue : v.text2, fontWeight: niveau !== '' ? 500 : 400, cursor: 'pointer' }}
                  >
                    <option value="">Tous niveaux</option>
                    {NIVEAUX.map((n, i) => <option key={n} value={String(i)}>Jusqu&apos;à {n}</option>)}
                  </select>
                </div>
              </div>

              {/* Débutant accepté */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', background: debutant ? 'rgba(0,113,227,.07)' : v.white, borderRadius: 10, border: `1px solid ${debutant ? 'rgba(0,113,227,.28)' : v.line2}`, boxShadow: v.shadow, fontSize: 13, color: debutant ? v.blue : v.text2, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={debutant} onChange={e => handleDebutantChange(e.target.checked)} style={{ accentColor: v.blue, width: 15, height: 15 }} />
                Débutant accepté
              </label>

              {/* Département + rayon (toutes sources) */}
              {(
                <>
                  {/* Département */}
                  <div style={{ display: 'flex', alignItems: 'center', background: v.white, borderRadius: 10, border: `1px solid ${departement ? 'rgba(0,113,227,.28)' : v.line2}`, boxShadow: v.shadow, overflow: 'hidden' }}>
                    <div style={{ padding: '0 8px 0 12px', color: v.text3, display: 'flex', flexShrink: 0 }}>
                      <svg viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><path d="M6 1C3.8 1 2 2.8 2 5c0 3.3 4 8 4 8s4-4.7 4-8c0-2.2-1.8-4-4-4z"/><circle cx="6" cy="5" r="1.5"/></svg>
                    </div>
                    <select
                      value={departement}
                      onChange={e => handleDeptChange(e.target.value)}
                      style={{ padding: '8px 10px 8px 0', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 13, color: departement ? v.blue : v.text2, fontWeight: departement ? 500 : 400, cursor: 'pointer', maxWidth: 220 }}
                    >
                      <option value="">Tous les départements</option>
                      {DEPARTEMENTS.map(d => (
                        <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Distance */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: v.white, borderRadius: 10, border: `1px solid ${v.line2}`, boxShadow: v.shadow, padding: '7px 14px' }}>
                    <span style={{ fontSize: 12, color: v.text2, flexShrink: 0 }}>Rayon</span>
                    <input
                      type="range"
                      min={5} max={100} step={5}
                      value={distance}
                      onChange={e => setDistance(Number(e.target.value))}
                      onMouseUp={e => handleDistanceCommit(Number((e.target as HTMLInputElement).value))}
                      onTouchEnd={e => handleDistanceCommit(Number((e.target as HTMLInputElement).value))}
                      style={{ width: 120, accentColor: v.blue, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600, color: v.blue, minWidth: 40, textAlign: 'right' }}>{distance} km</span>
                  </div>
                </>
              )}
            </div>
          </>
        )}


        {/* Filtre salaire venu de l'accueil */}
        {salaryFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 8px 6px 14px', borderRadius: 100, background: 'rgba(0,113,227,.07)', border: '1px solid rgba(0,113,227,.18)', fontSize: 13, color: v.blue, fontWeight: 500 }}>
              Salaire{salaryFilter.min ? ` dès ${Math.round(+salaryFilter.min / 1000)} k€` : ''}{salaryFilter.max ? ` jusqu’à ${Math.round(+salaryFilter.max / 1000)} k€` : ''} / an
              <button onClick={clearSalaryFilter} aria-label="Retirer le filtre salaire" style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(0,113,227,.12)', color: v.blue, cursor: 'pointer', fontSize: 12, lineHeight: 1, fontFamily: 'inherit' }}>✕</button>
            </span>
          </div>
        )}

        {/* Information (ex. filtre limité à France Travail) */}
        {!loading && note && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(0,113,227,.05)', border: '1px solid rgba(0,113,227,.15)', fontSize: 13, color: v.blue }}>
            {note}
          </div>
        )}

        {/* Avertissement (ville non reconnue, source en panne) */}
        {!loading && warning && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(180,83,9,.06)', border: '1px solid rgba(180,83,9,.18)', fontSize: 13, color: '#b45309' }}>
            {warning}
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#c0392b', marginBottom: 14 }}>{error}</div>
            <button onClick={handleSearch} style={{ padding: '10px 24px', borderRadius: 100, background: v.blue, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Réessayer</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: v.text2 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #e8e8ed', borderTopColor: v.blue, animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 14 }}>Recherche en cours…</div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && jobs.length === 0 && (
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
            {[selectedJob.contract, selectedJob.remote, selectedJob.debutant ? 'Débutant accepté' : '', selectedJob.diploma || 'Diplôme non précisé', selectedJob.source].filter(Boolean).map((t: string) => (
              <span key={t} style={{ padding: '3px 9px', borderRadius: 100, fontSize: 11, background: '#f5f5f7', border: '1px solid rgba(0,0,0,.08)', color: v.text2 }}>{t}</span>
            ))}
          </div>

          {selectedJob.salary && (
            <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.03em', marginBottom: 20 }}>{selectedJob.salary}</div>
          )}

          {selectedJob.description && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: v.text3, marginBottom: 8 }}>Description</div>
              <p style={{ fontSize: 13, color: v.text2, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
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
      @media (max-width: 768px) { input, textarea { font-size: 16px !important; } }
      .scroll-x { -ms-overflow-style: none; scrollbar-width: none; }
      .scroll-x::-webkit-scrollbar { display: none; }
    `}</style>
    </>
  )
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsPageContent />
    </Suspense>
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
        {[job.contract, job.remote, job.debutant ? 'Débutant accepté' : '', job.diploma].filter(Boolean).map((t: string) => (
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

