'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const v = {
  bg: '#f5f5f7', white: '#fff',
  text: '#1d1d1f', text2: '#6e6e73', text3: '#aeaeb2',
  line: 'rgba(0,0,0,0.08)', line2: 'rgba(0,0,0,0.14)',
  blue: '#0071e3',
  shadow: '0 1px 2px rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.05)',
  shadow2: '0 2px 6px rgba(0,0,0,.07), 0 8px 28px rgba(0,0,0,.07)',
}

function profileToText(p: any): string {
  const lines: string[] = []
  if (p.full_name) lines.push(`Nom : ${p.full_name}`)
  if (p.title) lines.push(`Poste : ${p.title}`)
  if (p.location) lines.push(`Lieu : ${p.location}`)
  if (p.summary) lines.push(`\nRésumé : ${p.summary}`)
  if (p.experiences?.length) {
    lines.push('\nExpériences :')
    for (const e of p.experiences) {
      const period = e.current ? `${e.start_date} – présent` : `${e.start_date}${e.end_date ? ` – ${e.end_date}` : ''}`
      lines.push(`- ${e.title} chez ${e.company}${e.location ? ` (${e.location})` : ''} · ${period}`)
      if (e.description) lines.push(`  ${e.description}`)
    }
  }
  if (p.education?.length) {
    lines.push('\nFormation :')
    for (const e of p.education) {
      lines.push(`- ${e.degree} – ${e.school}${e.location ? ` (${e.location})` : ''}${e.start_date ? ` · ${e.start_date}${e.end_date ? ` – ${e.end_date}` : ''}` : ''}`)
      if (e.description) lines.push(`  ${e.description}`)
    }
  }
  if (p.skills?.length) lines.push(`\nCompétences : ${p.skills.join(', ')}`)
  if (p.languages?.length) lines.push(`Langues : ${p.languages.map((l: any) => `${l.name} (${l.level})`).join(', ')}`)
  return lines.join('\n')
}

function CVPageInner() {
  const router = useRouter()
  const params = useSearchParams()

  const [jobTitle, setJobTitle]             = useState(params.get('title') || '')
  const [company, setCompany]               = useState(params.get('company') || '')
  const [jobDescription, setJobDescription] = useState(params.get('description') || '')
  const [userProfile, setUserProfile]       = useState('')
  const [cv, setCv]                         = useState<any>(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [downloading, setDownloading]       = useState(false)

  type ProfileState = 'loading' | 'loaded' | 'empty' | 'error'
  const [profileState, setProfileState] = useState<ProfileState>('loading')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ profile }) => {
        if (profile) {
          setUserProfile(profileToText(profile))
          setProfileState('loaded')
        } else {
          setProfileState('empty')
        }
      })
      .catch(() => setProfileState('error'))
  }, [])

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setCv(null)

    const res = await fetch('/api/generate-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, company, jobDescription, userProfile }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) { setError(data.error); return }
    setCv(data.cv)
  }

  async function handleDownloadPDF() {
    if (!cv) return
    setDownloading(true)

    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    const pageW = 210
    const margin = 20
    const colW = pageW - margin * 2
    let y = 0

    // Header band
    doc.setFillColor(29, 29, 31)
    doc.rect(0, 0, pageW, 42, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(cv.name || '', margin, 18)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(174, 174, 178)
    doc.text(cv.title || '', margin, 26)

    // Match score badge
    if (cv.matchScore) {
      doc.setFillColor(29, 131, 72)
      doc.roundedRect(pageW - margin - 38, 13, 38, 8, 4, 4, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`Score : ${cv.matchScore}%`, pageW - margin - 19, 18.5, { align: 'center' })
    }

    y = 52

    const sectionTitle = (label: string) => {
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(174, 174, 178)
      doc.text(label.toUpperCase(), margin, y)
      doc.setDrawColor(232, 232, 237)
      doc.setLineWidth(0.3)
      doc.line(margin + doc.getTextWidth(label.toUpperCase()) + 3, y - 0.5, margin + colW, y - 0.5)
      y += 6
    }

    const bodyText = (text: string, color = [29, 29, 31] as [number, number, number]) => {
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...color)
      const lines = doc.splitTextToSize(text, colW)
      doc.text(lines, margin, y)
      y += lines.length * 5 + 3
    }

    // Summary
    if (cv.summary) {
      sectionTitle('Résumé')
      bodyText(cv.summary)
      y += 3
    }

    // Experience
    if (cv.experience?.length) {
      sectionTitle('Expérience')
      for (const exp of cv.experience) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(29, 29, 31)
        doc.text(`${exp.title} — ${exp.company}`, margin, y)
        y += 5
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(110, 110, 115)
        doc.text(exp.period || '', margin, y)
        y += 5
        bodyText(exp.description || '')
        y += 2
      }
      y += 2
    }

    // Skills
    if (cv.skills?.length) {
      sectionTitle('Compétences')
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(29, 29, 31)
      const skillLine = cv.skills.join('  ·  ')
      const lines = doc.splitTextToSize(skillLine, colW)
      doc.text(lines, margin, y)
      y += lines.length * 5 + 6
    }

    // Education
    if (cv.education?.length) {
      sectionTitle('Formation')
      for (const edu of cv.education) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(29, 29, 31)
        doc.text(edu.degree || '', margin, y)
        y += 5
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(110, 110, 115)
        doc.text(`${edu.school}  ·  ${edu.year}`, margin, y)
        y += 7
      }
    }

    // Watermark
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 113, 227, 0.18)
    doc.text('Généré par DROP-JOB', pageW - margin, 290, { align: 'right' })

    doc.save(`CV_${(cv.name || 'cv').replace(/\s+/g, '_')}_${company || 'drop-job'}.pdf`)
    setDownloading(false)
  }

  const canGenerate = !loading && !!jobTitle && !!company && !!jobDescription && !!userProfile && profileState !== 'empty'

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
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><line x1="11" y1="1" x2="1" y2="1"/><polyline points="4,5 1,1 4,-3"/><line x1="1" y1="1" x2="1" y2="11"/></svg>
            Dashboard
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.04em', color: v.text, marginBottom: 6 }}>Smart CV IA</h1>
          <p style={{ fontSize: 15, color: v.text2, fontWeight: 300 }}>Générez un CV adapté à chaque offre en quelques secondes.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

          {/* FORM CARD */}
          <div style={{ background: v.white, borderRadius: 18, border: `1px solid ${v.line}`, padding: '28px 26px', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' as any, color: v.text3 }}>Informations</div>

            <Field label="Poste visé">
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="ex : Développeur React Senior"
                style={inputStyle}
              />
            </Field>

            <Field label="Entreprise">
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="ex : Contentsquare"
                style={inputStyle}
              />
            </Field>

            <Field label="Description de l'offre">
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Collez la description de l'offre ici…"
                rows={6}
                style={textareaStyle}
              />
            </Field>

            {/* Profile field — état conditionnel */}
            {profileState === 'loading' && (
              <Field label="Votre profil">
                <div style={{ padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', fontSize: 14, color: v.text3, background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #e8e8ed', borderTopColor: v.blue, animation: 'spin .7s linear infinite', flexShrink: 0 }} />
                  Chargement du profil…
                </div>
              </Field>
            )}

            {profileState === 'loaded' && (
              <Field label="Votre profil">
                <div style={{ padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(29,131,72,.25)', background: 'rgba(29,131,72,.04)', fontSize: 13, color: '#1d8348', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 500 }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><polyline points="2,9 6,13 14,4"/></svg>
                    Profil chargé
                  </span>
                  <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: v.blue, fontFamily: 'inherit', fontWeight: 500, textDecoration: 'underline', padding: 0 }}>
                    Modifier →
                  </button>
                </div>
              </Field>
            )}

            {(profileState === 'empty') && (
              <Field label="Votre profil">
                <div style={{ padding: '16px 18px', borderRadius: 10, border: '1.5px dashed rgba(0,0,0,0.14)', background: 'rgba(0,0,0,0.01)', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: v.text2, fontWeight: 500, marginBottom: 10 }}>Crée d'abord ton profil pour générer un CV</div>
                  <button onClick={() => router.push('/profile')} style={{ padding: '9px 20px', borderRadius: 100, background: v.blue, color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Créer mon profil →
                  </button>
                </div>
              </Field>
            )}

            {profileState === 'error' && (
              <Field label="Votre profil">
                <textarea
                  value={userProfile}
                  onChange={e => setUserProfile(e.target.value)}
                  placeholder="Décrivez votre expérience, compétences, formation…"
                  rows={5}
                  style={textareaStyle}
                />
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
              style={{
                padding: '13px',
                borderRadius: 10,
                background: canGenerate ? v.blue : '#e8e8ed',
                color: canGenerate ? '#fff' : v.text3,
                border: 'none',
                fontSize: 15,
                fontWeight: 500,
                cursor: canGenerate ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                transition: 'background .2s',
              }}
            >
              {loading ? 'Génération en cours…' : 'Générer mon CV'}
            </button>
          </div>

          {/* PREVIEW CARD */}
          <div style={{ background: v.white, borderRadius: 18, border: `1px solid ${v.line}`, minHeight: 560, display: 'flex', flexDirection: 'column', boxShadow: v.shadow, overflow: 'hidden' }}>

            {/* Preview header bar */}
            <div style={{ padding: '16px 22px', borderBottom: `1px solid ${v.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8e8ed' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8e8ed' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8e8ed' }} />
              </div>
              <div style={{ fontSize: 11, color: v.text3, fontWeight: 500 }}>Aperçu CV</div>
              <div style={{ width: 54 }} />
            </div>

            <div style={{ flex: 1, padding: 24, display: 'flex', alignItems: cv || loading ? 'flex-start' : 'center', justifyContent: 'center' }}>

              {/* Loading */}
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

              {/* Empty state */}
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

              {/* CV Document */}
              {!loading && cv && (
                <div style={{ width: '100%' }}>

                  {/* CV Header */}
                  <div style={{ background: v.text, borderRadius: 10, padding: '20px 20px 16px', marginBottom: 20 }}>
                    <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', marginBottom: 4 }}>{cv.name}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>{cv.title}</div>
                    {cv.matchScore && (
                      <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 100, background: 'rgba(29,131,72,0.8)', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                        Score matching : {cv.matchScore}%
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  {cv.summary && (
                    <CVSection title="Résumé">
                      <p style={{ fontSize: 13, color: v.text2, lineHeight: 1.65 }}>{cv.summary}</p>
                    </CVSection>
                  )}

                  {/* Experience */}
                  {cv.experience?.length > 0 && (
                    <CVSection title="Expérience">
                      {cv.experience.map((exp: any, i: number) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: v.text }}>{exp.title} — {exp.company}</div>
                          <div style={{ fontSize: 11, color: v.text3, margin: '2px 0 5px' }}>{exp.period}</div>
                          <div style={{ fontSize: 12, color: v.text2, lineHeight: 1.6 }}>{exp.description}</div>
                        </div>
                      ))}
                    </CVSection>
                  )}

                  {/* Skills */}
                  {cv.skills?.length > 0 && (
                    <CVSection title="Compétences">
                      <div style={{ display: 'flex', flexWrap: 'wrap' as any, gap: 6 }}>
                        {cv.skills.map((s: string, i: number) => (
                          <span key={i} style={{ padding: '3px 11px', borderRadius: 100, background: v.bg, border: `1px solid ${v.line}`, fontSize: 11, color: v.text }}>{s}</span>
                        ))}
                      </div>
                    </CVSection>
                  )}

                  {/* Education */}
                  {cv.education?.length > 0 && (
                    <CVSection title="Formation">
                      {cv.education.map((edu: any, i: number) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: v.text }}>{edu.degree}</div>
                          <div style={{ fontSize: 11, color: v.text3, marginTop: 2 }}>{edu.school} · {edu.year}</div>
                        </div>
                      ))}
                    </CVSection>
                  )}

                  {/* Watermark */}
                  <div style={{ textAlign: 'right' as any, fontSize: 9, fontWeight: 600, color: 'rgba(0,113,227,0.18)', letterSpacing: '.04em', marginTop: 8 }}>DROP-JOB FREE</div>

                  {/* Download */}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      marginTop: 16,
                      padding: '12px',
                      borderRadius: 10,
                      background: downloading ? '#e8e8ed' : v.blue,
                      color: downloading ? v.text3 : '#fff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: downloading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background .2s',
                    }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
                      <line x1="8" y1="1" x2="8" y2="11"/>
                      <polyline points="4,7 8,11 12,7"/>
                      <line x1="2" y1="15" x2="14" y2="15"/>
                    </svg>
                    {downloading ? 'Génération du PDF…' : 'Télécharger le PDF'}
                  </button>
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

function CVSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.08em', color: '#aeaeb2', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}
        <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
      </div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '11px 14px',
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.14)',
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#1d1d1f',
  background: '#fff',
  width: '100%',
  transition: 'border-color .15s, box-shadow .15s',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
}

export default function CVPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f5f5f7' }} />}>
      <CVPageInner />
    </Suspense>
  )
}
