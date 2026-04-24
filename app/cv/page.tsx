'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CVPage() {
  const [jobTitle, setJobTitle]           = useState('')
  const [company, setCompany]             = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [userProfile, setUserProfile]     = useState('')
  const [cv, setCv]                       = useState<any>(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const router = useRouter()

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

    if (data.error) {
      setError(data.error)
      return
    }

    setCv(data.cv)
  }

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
        <h1 style={styles.title}>Smart CV IA</h1>
        <p style={styles.sub}>Générez un CV adapté à chaque offre en quelques secondes.</p>

        <div style={styles.grid}>
          {/* Formulaire */}
          <div style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Poste visé</label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="ex: Développeur React Senior"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Entreprise</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="ex: Contentsquare"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description de l'offre</label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Collez la description de l'offre ici..."
                style={styles.textarea}
                rows={6}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Votre profil</label>
              <textarea
                value={userProfile}
                onChange={e => setUserProfile(e.target.value)}
                placeholder="Décrivez votre expérience, compétences, formation..."
                style={styles.textarea}
                rows={5}
              />
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <button
              onClick={handleGenerate}
              disabled={loading || !jobTitle || !company || !jobDescription || !userProfile}
              style={styles.btn}
            >
              {loading ? 'Génération en cours...' : '✨ Générer mon CV'}
            </button>
          </div>

          {/* Prévisualisation CV */}
          <div style={styles.preview}>
            {loading && (
              <div style={styles.loadingState}>
                <div style={styles.spinner}/>
                <div style={styles.loadingText}>L'IA analyse l'offre et adapte votre profil...</div>
                <div style={styles.steps}>
                  <div>✓ Analyse des mots-clés ATS</div>
                  <div>✓ Adaptation du vocabulaire</div>
                  <div>⟳ Génération du CV...</div>
                </div>
              </div>
            )}

            {!loading && !cv && (
              <div style={styles.emptyPreview}>
                <div style={styles.emptyIcon}>📄</div>
                <div style={styles.emptyText}>Votre CV apparaîtra ici</div>
              </div>
            )}

            {cv && (
              <div style={styles.cvDoc}>
                {/* Header */}
                <div style={styles.cvHeader}>
                  <div style={styles.cvName}>{cv.name}</div>
                  <div style={styles.cvTitle}>{cv.title}</div>
                  <div style={styles.matchBadge}>
                    Score matching : {cv.matchScore}%
                  </div>
                </div>

                {/* Summary */}
                <div style={styles.cvSection}>
                  <div style={styles.cvSectionTitle}>RÉSUMÉ</div>
                  <p style={styles.cvText}>{cv.summary}</p>
                </div>

                {/* Experience */}
                <div style={styles.cvSection}>
                  <div style={styles.cvSectionTitle}>EXPÉRIENCE</div>
                  {cv.experience?.map((exp: any, i: number) => (
                    <div key={i} style={styles.cvExp}>
                      <div style={styles.cvExpTitle}>{exp.title} — {exp.company}</div>
                      <div style={styles.cvExpPeriod}>{exp.period}</div>
                      <div style={styles.cvText}>{exp.description}</div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div style={styles.cvSection}>
                  <div style={styles.cvSectionTitle}>COMPÉTENCES</div>
                  <div style={styles.skillWrap}>
                    {cv.skills?.map((s: string, i: number) => (
                      <span key={i} style={styles.skill}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div style={styles.cvSection}>
                  <div style={styles.cvSectionTitle}>FORMATION</div>
                  {cv.education?.map((edu: any, i: number) => (
                    <div key={i} style={styles.cvExp}>
                      <div style={styles.cvExpTitle}>{edu.degree}</div>
                      <div style={styles.cvExpPeriod}>{edu.school} · {edu.year}</div>
                    </div>
                  ))}
                </div>

                {/* Watermark */}
                <div style={styles.watermark}>DROP-JOB FREE</div>

                <button style={styles.downloadBtn}>⬇ Télécharger le PDF</button>
              </div>
            )}
          </div>
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
  title: { fontSize: 32, fontWeight: 600, letterSpacing: '-0.04em', color: '#1d1d1f', marginBottom: 6 },
  sub: { fontSize: 15, color: '#6e6e73', marginBottom: 36, fontWeight: 300 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 500, color: '#1d1d1f' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', fontSize: 15, fontFamily: 'inherit', color: '#1d1d1f', outline: 'none', background: '#fff' },
  textarea: { padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', fontSize: 14, fontFamily: 'inherit', color: '#1d1d1f', outline: 'none', background: '#fff', resize: 'vertical' },
  errorBox: { background: 'rgba(192,57,43,.05)', border: '1px solid rgba(192,57,43,.15)', borderRadius: 8, padding: '10px 13px', fontSize: 13, color: '#c0392b' },
  btn: { padding: '13px', borderRadius: 10, background: '#0071e3', color: '#fff', border: 'none', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  preview: { background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' },
  loadingState: { textAlign: 'center' as const },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '2px solid #e8e8ed', borderTopColor: '#0071e3', animation: 'spin .7s linear infinite', margin: '0 auto 16px' },
  loadingText: { fontSize: 15, fontWeight: 500, color: '#1d1d1f', marginBottom: 12 },
  steps: { fontSize: 13, color: '#6e6e73', display: 'flex', flexDirection: 'column', gap: 6 },
  emptyPreview: { textAlign: 'center' as const, color: '#aeaeb2' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14 },
  cvDoc: { width: '100%', position: 'relative' },
  cvHeader: { borderBottom: '2px solid #1d1d1f', paddingBottom: 16, marginBottom: 20 },
  cvName: { fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', color: '#1d1d1f' },
  cvTitle: { fontSize: 14, color: '#6e6e73', marginTop: 4, marginBottom: 10 },
  matchBadge: { display: 'inline-block', padding: '3px 12px', borderRadius: 100, background: 'rgba(29,131,72,0.07)', color: '#1d8348', fontSize: 12, fontWeight: 600 },
  cvSection: { marginBottom: 18 },
  cvSectionTitle: { fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: '#aeaeb2', marginBottom: 8 },
  cvText: { fontSize: 13, color: '#1d1d1f', lineHeight: 1.6 },
  cvExp: { marginBottom: 12 },
  cvExpTitle: { fontSize: 13, fontWeight: 600, color: '#1d1d1f' },
  cvExpPeriod: { fontSize: 12, color: '#6e6e73', marginBottom: 4 },
  skillWrap: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  skill: { padding: '3px 10px', borderRadius: 100, background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.08)', fontSize: 12, color: '#1d1d1f' },
  watermark: { position: 'absolute', bottom: 60, right: 24, fontSize: 10, fontWeight: 600, color: 'rgba(0,113,227,0.15)', letterSpacing: '.04em' },
  downloadBtn: { width: '100%', marginTop: 16, padding: '11px', borderRadius: 10, background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.08)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: '#1d1d1f' },
}