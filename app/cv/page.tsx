'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type Template = 'classique' | 'moderne' | 'minimaliste'

const v = {
  bg: '#f5f5f7', white: '#fff',
  text: '#1d1d1f', text2: '#6e6e73', text3: '#aeaeb2',
  line: 'rgba(0,0,0,0.08)', line2: 'rgba(0,0,0,0.14)',
  blue: '#0071e3',
  shadow: '0 1px 2px rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.05)',
}

const TEMPLATES: { id: Template; label: string; desc: string; premium: boolean; preview: React.ReactNode }[] = [
  {
    id: 'classique',
    label: 'Classique',
    desc: 'Sobre, Times New Roman, sections délimitées',
    premium: false,
    preview: (
      <div style={{ width: '100%', height: 84, background: '#fff', borderRadius: 5, overflow: 'hidden', padding: '8px 10px', boxSizing: 'border-box' }}>
        <div style={{ height: 8, background: '#1d1d1f', borderRadius: 1, width: '55%', marginBottom: 3 }} />
        <div style={{ height: 4, background: '#d0d0d5', width: '40%', marginBottom: 6 }} />
        <div style={{ borderTop: '1.5px solid #1d1d1f', paddingTop: 4, marginBottom: 4 }}>
          <div style={{ height: 3.5, background: '#6e6e73', width: '32%', marginBottom: 4 }} />
          <div style={{ height: 2.5, background: '#c8c8ce', width: '80%', marginBottom: 2 }} />
          <div style={{ height: 2.5, background: '#c8c8ce', width: '62%' }} />
        </div>
        <div style={{ borderTop: '1px solid #c8c8ce', paddingTop: 4 }}>
          <div style={{ height: 3.5, background: '#6e6e73', width: '26%', marginBottom: 3 }} />
          <div style={{ height: 2.5, background: '#c8c8ce', width: '70%' }} />
        </div>
      </div>
    ),
  },
  {
    id: 'moderne',
    label: 'Moderne',
    desc: 'Accent bleu, header couleur, typographie bold',
    premium: true,
    preview: (
      <div style={{ width: '100%', height: 84, background: '#fff', borderRadius: 5, overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ background: '#2563EB', padding: '7px 9px 6px' }}>
          <div style={{ height: 7, background: 'rgba(255,255,255,.9)', width: '52%', borderRadius: 1, marginBottom: 3 }} />
          <div style={{ height: 4, background: 'rgba(255,255,255,.4)', width: '36%', borderRadius: 1, marginBottom: 3 }} />
          <div style={{ height: 3, background: 'rgba(255,255,255,.25)', width: '60%', borderRadius: 1 }} />
        </div>
        <div style={{ padding: '5px 9px' }}>
          <div style={{ height: 2.5, background: '#2563EB', width: '28%', marginBottom: 4 }} />
          <div style={{ height: 2.5, background: '#e8e8ed', width: '78%', marginBottom: 2 }} />
          <div style={{ height: 2.5, background: '#e8e8ed', width: '58%', marginBottom: 4 }} />
          <div style={{ height: 2.5, background: '#2563EB', width: '22%', marginBottom: 3 }} />
          <div style={{ height: 2.5, background: '#e8e8ed', width: '68%' }} />
        </div>
      </div>
    ),
  },
  {
    id: 'minimaliste',
    label: 'Minimaliste',
    desc: 'Épuré, espace blanc, Inter, sans bordures',
    premium: true,
    preview: (
      <div style={{ width: '100%', height: 84, background: '#fff', borderRadius: 5, overflow: 'hidden', padding: '10px 14px', boxSizing: 'border-box' }}>
        <div style={{ height: 10, background: '#1d1d1f', width: '60%', borderRadius: 1, marginBottom: 4 }} />
        <div style={{ height: 4, background: '#aeaeb2', width: '38%', borderRadius: 1, marginBottom: 13 }} />
        <div style={{ height: 3, background: '#d8d8de', width: '18%', marginBottom: 5 }} />
        <div style={{ height: 2.5, background: '#e8e8ed', width: '82%', marginBottom: 2 }} />
        <div style={{ height: 2.5, background: '#e8e8ed', width: '54%' }} />
      </div>
    ),
  },
]

function scoreColor(score: number) {
  if (score >= 75) return '#1d8348'
  if (score >= 50) return '#b45309'
  return '#c0392b'
}

function CVPageInner() {
  const router = useRouter()
  const params = useSearchParams()

  const applyUrl = params.get('applyUrl') || ''

  const [jobTitle, setJobTitle]         = useState(params.get('title') || '')
  const [company, setCompany]           = useState(params.get('company') || '')
  const [jobDescription, setJobDescription] = useState(params.get('description') || '')

  const [profileData, setProfileData]   = useState<any>(null)
  const [userProfile, setUserProfile]   = useState('')

  const [cv, setCv]             = useState<any>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [downloading, setDownloading] = useState(false)

  const [template, setTemplate] = useState<Template>('classique')
  const [isPremium, setIsPremium] = useState(false)

  const [photoUrl, setPhotoUrl]             = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError]         = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  type ProfileState = 'loading' | 'loaded' | 'empty' | 'error'
  const [profileState, setProfileState] = useState<ProfileState>('loading')

  const [letter, setLetter]               = useState<string | null>(null)
  const [letterLoading, setLetterLoading] = useState(false)
  const [letterError, setLetterError]     = useState('')
  const [activeTab, setActiveTab]         = useState<'cv' | 'letter'>('cv')
  const [copied, setCopied]               = useState(false)
  const [letterDownloading, setLetterDownloading] = useState(false)

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ profile }) => {
        if (profile) { setProfileData(profile); setPhotoUrl(profile.photo_url || null); setProfileState('loaded') }
        else setProfileState('empty')
      })
      .catch(() => setProfileState('error'))

    fetch('/api/me')
      .then(r => r.json())
      .then(({ is_premium }) => setIsPremium(!!is_premium))
      .catch(() => {})
  }, [])

  async function handleGenerate() {
    setLoading(true); setError(''); setCv(null); setLetter(null); setActiveTab('cv')
    const res = await fetch('/api/generate-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, company, jobDescription }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.error) { setError(data.error); return }
    setCv(data.cv)
  }

  async function handleDownloadPDF() {
    if (!cv) return
    setDownloading(true)
    try {
      const { downloadCV } = await import('./pdf-templates')
      await downloadCV(template, cv, { ...profileData, photo_url: photoUrl }, company)
    } finally {
      setDownloading(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setPhotoError('Fichier trop lourd (max 2 Mo)'); return }
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setPhotoError('Format invalide (JPG ou PNG)'); return }
    setPhotoError('')
    setPhotoUploading(true)
    const form = new FormData()
    form.append('photo', file)
    const res = await fetch('/api/profile/photo', { method: 'POST', body: form })
    const data = await res.json()
    setPhotoUploading(false)
    if (data.error) { setPhotoError(data.error); return }
    setPhotoUrl(data.photo_url)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handlePhotoDelete() {
    setPhotoUploading(true)
    await fetch('/api/profile/photo', { method: 'DELETE' })
    setPhotoUploading(false)
    setPhotoUrl(null)
  }

  async function handleGenerateLetter() {
    setLetterLoading(true); setLetterError('')
    const res = await fetch('/api/generate-cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, company, jobDescription }),
    })
    const data = await res.json()
    setLetterLoading(false)
    if (data.error) { setLetterError(data.message || data.error); return }
    setLetter(data.letter)
    setActiveTab('letter')
  }

  async function handleCopyLetter() {
    if (!letter) return
    await navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownloadLetter() {
    if (!letter) return
    setLetterDownloading(true)
    try {
      const { downloadLetter } = await import('./pdf-templates')
      await downloadLetter(letter, cv?.name || profileData?.full_name || '', company)
    } finally {
      setLetterDownloading(false)
    }
  }

  const canGenerate =
    !loading &&
    !!jobTitle && !!company && !!jobDescription &&
    profileState !== 'empty' && profileState !== 'loading' &&
    (profileState === 'loaded' || !!userProfile)

  return (
    <div style={{ minHeight: '100vh', background: v.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", WebkitFontSmoothing: 'antialiased' as any }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, height: 52, background: 'rgba(245,245,247,0.92)', backdropFilter: 'blur(24px) saturate(180%)', borderBottom: `1px solid ${v.line}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: v.text, fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', fontFamily: 'inherit' }}>
            <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
              <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="2.2" fill="none"/>
              <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.45"/>
              <circle cx="20" cy="20" r="7.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="17,20.5 20,23.5 23,20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            drop-job
          </button>
          <div style={{ fontSize: 13, color: v.text2 }}>Smart CV IA</div>
          <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: v.bg, border: `1px solid ${v.line2}`, borderRadius: 100, padding: '6px 14px', fontSize: 13, color: v.text2, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={12} height={12}>
              <line x1="11" y1="1" x2="1" y2="1"/>
              <polyline points="4,5 1,1 4,-3"/>
              <line x1="1" y1="1" x2="1" y2="11"/>
            </svg>
            Dashboard
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: isMobile ? '24px 16px 80px' : '48px 24px 80px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.04em', color: v.text, marginBottom: 6 }}>Smart CV IA</h1>
          <p style={{ fontSize: 15, color: v.text2, fontWeight: 300 }}>Générez un CV adapté à chaque offre en quelques secondes.</p>
        </div>

        {/* TEMPLATE SELECTOR */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' as any, color: v.text3, marginBottom: 12 }}>Template</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 10 }}>
            {TEMPLATES.map(t => {
              const locked = t.premium && !isPremium
              const selected = template === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => { if (!locked) setTemplate(t.id) }}
                  style={{
                    background: v.white,
                    border: selected ? `2px solid ${v.blue}` : `1.5px solid ${v.line2}`,
                    borderRadius: 14,
                    padding: '12px 14px',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    textAlign: 'left' as any,
                    boxShadow: selected ? `0 0 0 3px rgba(0,113,227,.08), ${v.shadow}` : v.shadow,
                    opacity: locked ? 0.72 : 1,
                    transition: 'border .15s, box-shadow .15s',
                    fontFamily: 'inherit',
                    position: 'relative' as any,
                  }}
                >
                  {/* Premium badge */}
                  {t.premium && (
                    <span style={{
                      position: 'absolute', top: 10, right: 10,
                      background: locked ? '#e8e8ed' : 'rgba(0,113,227,.09)',
                      color: locked ? v.text3 : v.blue,
                      fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100,
                    }}>
                      {locked ? '🔒 Premium' : '★ Premium'}
                    </span>
                  )}

                  {/* Mini preview */}
                  <div style={{ marginBottom: 10, borderRadius: 6, overflow: 'hidden', border: `1px solid ${v.line}` }}>
                    {t.preview}
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 600, color: v.text, marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: v.text3, lineHeight: 1.45 }}>{t.desc}</div>
                </button>
              )
            })}
          </div>

          {/* Upgrade nudge */}
          {!isPremium && (
            <div style={{ marginTop: 10, padding: '9px 14px', background: 'rgba(0,113,227,.04)', border: '1px solid rgba(0,113,227,.12)', borderRadius: 10, fontSize: 12, color: v.blue, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Moderne et Minimaliste sont réservés aux membres Premium.</span>
              <a href="https://buy.stripe.com/6oUcN4cMAbJX553a1o4wM00" style={{ fontWeight: 600, color: v.blue, textDecoration: 'none', flexShrink: 0, marginLeft: 12 }}>Passer Premium →</a>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, alignItems: 'start' }}>

          {/* ── FORM CARD ─────────────────────────────────────────────────── */}
          <div style={{ background: v.white, borderRadius: 18, border: `1px solid ${v.line}`, padding: '28px 26px', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' as any, color: v.text3 }}>Informations</div>

            <Field label="Poste visé">
              <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="ex : Développeur React Senior" style={inputStyle} />
            </Field>

            <Field label="Entreprise">
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="ex : Contentsquare" style={inputStyle} />
            </Field>

            <Field label="Description de l'offre">
              <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Collez la description de l'offre ici…" rows={6} style={textareaStyle} />
            </Field>

            {profileState === 'loading' && (
              <Field label="Votre profil">
                <div style={{ padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', fontSize: 13, color: v.text3, background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid #e8e8ed', borderTopColor: v.blue, animation: 'spin .7s linear infinite', flexShrink: 0 }} />
                  Chargement du profil…
                </div>
              </Field>
            )}

            {profileState === 'loaded' && (
              <Field label="Votre profil">
                <div style={{ padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(29,131,72,.25)', background: 'rgba(29,131,72,.04)', fontSize: 13, color: '#1d8348', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 500 }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><polyline points="2,9 6,13 14,4"/></svg>
                    Profil chargé{profileData?.full_name ? ` · ${profileData.full_name}` : ''}
                  </span>
                  <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: v.blue, fontFamily: 'inherit', fontWeight: 500, textDecoration: 'underline', padding: 0 }}>
                    Modifier →
                  </button>
                </div>
              </Field>
            )}

            {profileState === 'empty' && (
              <Field label="Votre profil">
                <div style={{ padding: '16px 18px', borderRadius: 10, border: '1.5px dashed rgba(0,0,0,0.14)', background: 'rgba(0,0,0,0.01)', textAlign: 'center' as any }}>
                  <div style={{ fontSize: 13, color: v.text2, fontWeight: 500, marginBottom: 10 }}>Crée d'abord ton profil pour générer un CV</div>
                  <button onClick={() => router.push('/profile')} style={{ padding: '9px 20px', borderRadius: 100, background: v.blue, color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Créer mon profil →
                  </button>
                </div>
              </Field>
            )}

            {profileState === 'error' && (
              <Field label="Votre profil">
                <textarea value={userProfile} onChange={e => setUserProfile(e.target.value)} placeholder="Décrivez votre expérience, compétences, formation…" rows={5} style={textareaStyle} />
              </Field>
            )}

            {profileState === 'loaded' && (
              <Field label="Photo de profil (optionnelle)">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                {photoUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={photoUrl} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${v.line2}`, flexShrink: 0 }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => fileInputRef.current?.click()} disabled={photoUploading} style={{ padding: '6px 12px', borderRadius: 8, background: v.bg, border: `1px solid ${v.line2}`, fontSize: 12, color: v.text2, cursor: 'pointer', fontFamily: 'inherit' }}>{photoUploading ? '…' : 'Changer'}</button>
                      <button onClick={handlePhotoDelete} disabled={photoUploading} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(192,57,43,.05)', border: '1px solid rgba(192,57,43,.15)', fontSize: 12, color: '#c0392b', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} disabled={photoUploading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: `1.5px dashed ${v.line2}`, background: 'transparent', fontSize: 13, color: v.text2, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><circle cx="8" cy="8" r="6.5"/><line x1="8" y1="5" x2="8" y2="11"/><line x1="5" y1="8" x2="11" y2="8"/></svg>
                    {photoUploading ? 'Upload en cours…' : 'Ajouter une photo'}
                  </button>
                )}
                {photoError && <div style={{ fontSize: 11, color: '#c0392b', marginTop: 2 }}>{photoError}</div>}
              </Field>
            )}

            {error && (
              <div style={{ background: 'rgba(192,57,43,.05)', border: '1px solid rgba(192,57,43,.15)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              style={{ padding: '13px', borderRadius: 10, background: canGenerate ? v.blue : '#e8e8ed', color: canGenerate ? '#fff' : v.text3, border: 'none', fontSize: 15, fontWeight: 500, cursor: canGenerate ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'background .2s' }}
            >
              {loading ? 'Génération en cours…' : 'Générer mon CV'}
            </button>

            {cv && (
              !isPremium ? (
                <>
                  <button disabled style={{ padding: '13px', borderRadius: 10, background: '#e8e8ed', color: v.text3, border: 'none', fontSize: 15, fontWeight: 500, cursor: 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Lettre de motivation
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(0,113,227,.09)', color: v.blue }}>Premium</span>
                  </button>
                  <div style={{ fontSize: 11, color: v.text3, textAlign: 'center' as any }}>Réservé aux abonnés Premium</div>
                </>
              ) : (
                <>
                  <button
                    onClick={handleGenerateLetter}
                    disabled={letterLoading}
                    style={{ padding: '13px', borderRadius: 10, background: letterLoading ? '#e8e8ed' : 'rgba(0,113,227,.07)', color: letterLoading ? v.text3 : v.blue, border: `1px solid ${letterLoading ? 'transparent' : 'rgba(0,113,227,.18)'}`, fontSize: 15, fontWeight: 500, cursor: letterLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}
                  >
                    {letterLoading ? 'Génération en cours…' : 'Générer la lettre de motivation'}
                  </button>
                  {letterError && (
                    <div style={{ background: 'rgba(192,57,43,.05)', border: '1px solid rgba(192,57,43,.15)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b' }}>
                      {letterError}
                    </div>
                  )}
                </>
              )
            )}
          </div>

          {/* ── PREVIEW CARD ──────────────────────────────────────────────── */}
          <div style={{ background: v.white, borderRadius: 18, border: `1px solid ${v.line}`, minHeight: 560, display: 'flex', flexDirection: 'column', boxShadow: v.shadow, overflow: 'hidden' }}>

            <div style={{ padding: '14px 22px', borderBottom: `1px solid ${v.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8e8ed' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8e8ed' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8e8ed' }} />
              </div>
              {letter ? (
                <div style={{ display: 'flex', background: '#f5f5f7', borderRadius: 100, padding: 2 }}>
                  {(['cv', 'letter'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{ padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? v.text : v.text2, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,.12)' : 'none', transition: 'all .15s' }}
                    >
                      {tab === 'cv' ? 'CV' : 'Lettre'}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: v.text3, fontWeight: 500 }}>
                  Aperçu CV · {TEMPLATES.find(t => t.id === template)?.label}
                </div>
              )}
              <div style={{ width: 54 }} />
            </div>

            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', alignItems: (cv || loading) || (activeTab === 'letter' && !!letter) ? 'flex-start' : 'center', justifyContent: 'center' }}>

              {(activeTab === 'cv' || !letter) && <>

              {loading && (
                <div style={{ textAlign: 'center' as any, width: '100%', paddingTop: 60 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #e8e8ed', borderTopColor: v.blue, animation: 'spin .7s linear infinite', margin: '0 auto 18px' }} />
                  <div style={{ fontSize: 15, fontWeight: 500, color: v.text, marginBottom: 14 }}>L'IA analyse l'offre…</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12, color: v.text2 }}>
                    <div>✓ Analyse des mots-clés ATS</div>
                    <div>✓ Adaptation du vocabulaire</div>
                    <div style={{ color: v.blue }}>⟳ Génération du CV…</div>
                  </div>
                </div>
              )}

              {!loading && !cv && (
                <div style={{ textAlign: 'center' as any, color: v.text3 }}>
                  <svg viewBox="0 0 48 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width={48} height={60} style={{ marginBottom: 14, opacity: 0.4 }}>
                    <rect x="4" y="4" width="40" height="52" rx="5"/>
                    <line x1="12" y1="18" x2="36" y2="18"/>
                    <line x1="12" y1="26" x2="36" y2="26"/>
                    <line x1="12" y1="34" x2="28" y2="34"/>
                  </svg>
                  <div style={{ fontSize: 14, fontWeight: 500, color: v.text2, marginBottom: 4 }}>Votre CV apparaîtra ici</div>
                  <div style={{ fontSize: 12, color: v.text3 }}>Remplissez le formulaire et cliquez sur Générer</div>
                </div>
              )}

              {!loading && cv && (
                <div style={{ width: '100%' }}>

                  {/* Preview header — adapté au template sélectionné */}
                  {template === 'classique' && (
                    <div style={{ borderBottom: '2px solid #1d1d1f', paddingBottom: 14, marginBottom: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: v.text, fontFamily: 'Georgia, serif', marginBottom: 3 }}>{cv.name}</div>
                          <div style={{ fontSize: 13, color: v.text2, fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: 8 }}>{cv.title}</div>
                          {(profileData?.email || profileData?.phone || profileData?.location) && (
                            <div style={{ fontSize: 10, color: v.text3, fontFamily: 'Georgia, serif' }}>
                              {[profileData?.email, profileData?.phone, profileData?.location].filter(Boolean).join('  ·  ')}
                            </div>
                          )}
                        </div>
                        {photoUrl && <img src={photoUrl} alt="" style={{ width: 64, height: 64, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />}
                      </div>
                    </div>
                  )}

                  {template === 'moderne' && (
                    <div style={{ background: '#2563EB', borderRadius: 10, padding: '18px 20px 14px', marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 21, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{cv.name}</div>
                          <div style={{ fontSize: 12, color: 'rgba(180,210,255,0.9)', marginBottom: 6 }}>{cv.title}</div>
                          {(profileData?.email || profileData?.phone || profileData?.location) && (
                            <div style={{ fontSize: 10, color: 'rgba(160,195,255,0.8)' }}>
                              {[profileData?.email, profileData?.phone, profileData?.location].filter(Boolean).join('  ·  ')}
                            </div>
                          )}
                        </div>
                        {photoUrl && <img src={photoUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as any, marginTop: 10 }}>
                        {cv.matchScore && (
                          <span style={{ padding: '3px 12px', borderRadius: 100, background: `${scoreColor(cv.matchScore)}cc`, color: '#fff', fontSize: 11, fontWeight: 600 }}>
                            Match : {cv.matchScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {template === 'minimaliste' && (
                    <div style={{ paddingBottom: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', color: v.text, marginBottom: 4 }}>{cv.name}</div>
                          <div style={{ fontSize: 14, color: v.text3, fontWeight: 300, marginBottom: 6 }}>{cv.title}</div>
                          {(profileData?.email || profileData?.phone || profileData?.location) && (
                            <div style={{ fontSize: 10, color: v.text3 }}>
                              {[profileData?.email, profileData?.phone, profileData?.location].filter(Boolean).join('  ·  ')}
                            </div>
                          )}
                          {cv.matchScore && (
                            <div style={{ marginTop: 8 }}>
                              <span style={{ padding: '3px 12px', borderRadius: 100, background: `${scoreColor(cv.matchScore)}18`, color: scoreColor(cv.matchScore), fontSize: 11, fontWeight: 600 }}>
                                Match : {cv.matchScore}%
                              </span>
                            </div>
                          )}
                        </div>
                        {photoUrl && <img src={photoUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
                      </div>
                    </div>
                  )}

                  {cv.summary && <CVSection title="Résumé" template={template}><p style={{ fontSize: 13, color: v.text2, lineHeight: 1.7 }}>{cv.summary}</p></CVSection>}

                  {cv.experience?.length > 0 && (
                    <CVSection title="Expérience" template={template}>
                      {cv.experience.map((exp: any, i: number) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: v.text }}>{exp.title} — {exp.company}</div>
                          <div style={{ fontSize: 11, color: template === 'moderne' ? '#2563EB' : v.text3, margin: '2px 0 5px' }}>{exp.period}</div>
                          <div style={{ fontSize: 12, color: v.text2, lineHeight: 1.65 }}>{exp.description}</div>
                        </div>
                      ))}
                    </CVSection>
                  )}

                  {cv.skills?.length > 0 && (
                    <CVSection title="Compétences" template={template}>
                      <div style={{ display: 'flex', flexWrap: 'wrap' as any, gap: 6 }}>
                        {cv.skills.map((s: string, i: number) => (
                          <span key={i} style={{ padding: '3px 11px', borderRadius: 100, background: template === 'moderne' ? 'rgba(37,99,235,.07)' : v.bg, border: `1px solid ${template === 'moderne' ? 'rgba(37,99,235,.18)' : v.line}`, fontSize: 11, color: template === 'moderne' ? '#2563EB' : v.text }}>{s}</span>
                        ))}
                      </div>
                    </CVSection>
                  )}

                  {cv.education?.length > 0 && (
                    <CVSection title="Formation" template={template}>
                      {cv.education.map((edu: any, i: number) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: v.text }}>{edu.degree}</div>
                          <div style={{ fontSize: 11, color: template === 'moderne' ? '#2563EB' : v.text3, marginTop: 2 }}>
                            {edu.school}{edu.period ? ` · ${edu.period}` : ''}
                          </div>
                        </div>
                      ))}
                    </CVSection>
                  )}

                  {cv.languages?.length > 0 && (
                    <CVSection title="Langues" template={template}>
                      <div style={{ display: 'flex', flexWrap: 'wrap' as any, gap: 6 }}>
                        {cv.languages.map((l: any, i: number) => (
                          <span key={i} style={{ padding: '3px 11px', borderRadius: 100, background: v.bg, border: `1px solid ${v.line}`, fontSize: 11, color: v.text }}>
                            {l.name} <span style={{ color: v.text3 }}>{l.level}</span>
                          </span>
                        ))}
                      </div>
                    </CVSection>
                  )}

                  {cv.watermark && (
                    <div style={{ textAlign: 'right' as any, fontSize: 9, fontWeight: 600, color: 'rgba(0,113,227,0.18)', letterSpacing: '.04em', marginTop: 8 }}>DROP-JOB FREE</div>
                  )}

                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 16, padding: '12px', borderRadius: 10, background: downloading ? '#e8e8ed' : v.blue, color: downloading ? v.text3 : '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
                      <line x1="8" y1="1" x2="8" y2="11"/>
                      <polyline points="4,7 8,11 12,7"/>
                      <line x1="2" y1="15" x2="14" y2="15"/>
                    </svg>
                    {downloading ? 'Génération du PDF…' : `Télécharger — ${TEMPLATES.find(t => t.id === template)?.label}`}
                  </button>

                  {applyUrl && (
                    <a
                      href={applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 10, padding: '12px', borderRadius: 10, background: '#1d8348', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', transition: 'background .2s' }}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                        <path d="M10 2h4v4M14 2l-8 8M4 4H2a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-2"/>
                      </svg>
                      Postuler à cette offre
                    </a>
                  )}
                </div>
              )}

              </>}

              {activeTab === 'letter' && letter && (
                <div style={{ width: '100%' }}>
                  {letter.split('\n\n').filter(p => p.trim()).map((para, i) => (
                    <p key={i} style={{ fontSize: 14, color: v.text2, lineHeight: 1.85, marginBottom: 16 }}>{para}</p>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={handleCopyLetter}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flex: 1, padding: '12px', borderRadius: 10, background: copied ? 'rgba(29,131,72,.07)' : v.bg, color: copied ? '#1d8348' : v.text2, border: `1px solid ${copied ? 'rgba(29,131,72,.2)' : v.line2}`, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><rect x="4" y="4" width="9" height="11" rx="1.5"/><path d="M4 4V3a1 1 0 011-1h6a1 1 0 011 1v9a1 1 0 01-1 1h-1"/></svg>
                      {copied ? '✓ Copié !' : 'Copier la lettre'}
                    </button>
                    <button
                      onClick={handleDownloadLetter}
                      disabled={letterDownloading}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flex: 1, padding: '12px', borderRadius: 10, background: letterDownloading ? '#e8e8ed' : v.blue, color: letterDownloading ? v.text3 : '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: letterDownloading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                        <line x1="8" y1="1" x2="8" y2="11"/><polyline points="4,7 8,11 12,7"/><line x1="2" y1="15" x2="14" y2="15"/>
                      </svg>
                      {letterDownloading ? 'Génération…' : 'Télécharger la lettre'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { outline: none; border-color: rgba(0,113,227,0.45) !important; box-shadow: 0 0 0 3px rgba(0,113,227,0.08) !important; }
        @media (max-width: 768px) { input, textarea { font-size: 16px !important; } }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#1d1d1f' }}>{label}</label>
      {children}
    </div>
  )
}

function CVSection({ title, template, children }: { title: string; template: Template; children: React.ReactNode }) {
  const isModerne = template === 'moderne'
  const isMinimaliste = template === 'minimaliste'
  return (
    <div style={{ marginBottom: isMinimaliste ? 22 : 18 }}>
      <div style={{
        fontSize: 9, fontWeight: 600, letterSpacing: '.08em',
        color: isModerne ? '#2563EB' : '#aeaeb2',
        textTransform: 'uppercase' as any,
        marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {title}
        {!isMinimaliste && <div style={{ flex: 1, height: isModerne ? 1.5 : 1, background: isModerne ? '#2563EB' : 'rgba(0,0,0,0.06)' }} />}
      </div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)',
  fontSize: 14, fontFamily: 'inherit', color: '#1d1d1f', background: '#fff',
  width: '100%', transition: 'border-color .15s, box-shadow .15s',
}

const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical' }

export default function CVPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f5f5f7' }} />}>
      <CVPageInner />
    </Suspense>
  )
}
