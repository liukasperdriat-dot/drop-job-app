'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const v = {
  bg: '#f5f5f7', white: '#fff',
  text: '#1d1d1f', text2: '#6e6e73', text3: '#aeaeb2',
  line: 'rgba(0,0,0,0.08)', line2: 'rgba(0,0,0,0.14)',
  blue: '#0071e3',
  green: '#1d8348',
  shadow: '0 1px 2px rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.05)',
}

type Experience = {
  title: string; company: string; location: string
  start_date: string; end_date: string; current: boolean; description: string
}

type Education = {
  degree: string; school: string; location: string
  start_date: string; end_date: string; description: string
}

type Language = { name: string; level: string }

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif']

const emptyExp = (): Experience => ({ title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: '' })
const emptyEdu = (): Education => ({ degree: '', school: '', location: '', start_date: '', end_date: '', description: '' })
const emptyLang = (): Language => ({ name: '', level: 'B1' })

export default function ProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [skillInput, setSkillInput] = useState('')
  const skillInputRef = useRef<HTMLInputElement>(null)

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
        if (profile) {
          setFullName(profile.full_name || '')
          setEmail(profile.email || '')
          setPhone(profile.phone || '')
          setLocation(profile.location || '')
          setLinkedin(profile.linkedin || '')
          setTitle(profile.title || '')
          setSummary(profile.summary || '')
          setExperiences(profile.experiences || [])
          setEducation(profile.education || [])
          setSkills(profile.skills || [])
          setLanguages(profile.languages || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    setSaved(false)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, phone, location, linkedin, title, summary, experiences, education, skills, languages }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      const d = await res.json()
      setSaveError(d.error || 'Erreur lors de la sauvegarde')
    }
  }

  function updateExp(i: number, key: keyof Experience, val: any) {
    setExperiences(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e))
  }

  function updateEdu(i: number, key: keyof Education, val: any) {
    setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e))
  }

  function updateLang(i: number, key: keyof Language, val: string) {
    setLanguages(prev => prev.map((l, idx) => idx === i ? { ...l, [key]: val } : l))
  }

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s])
    setSkillInput('')
    skillInputRef.current?.focus()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',-apple-system,sans-serif" }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #e8e8ed', borderTopColor: v.blue, animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: v.bg, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, height: 52, background: 'rgba(245,245,247,0.92)', backdropFilter: 'blur(24px) saturate(180%)', borderBottom: `1px solid ${v.line}` }}>
        <div style={{ maxWidth: 780, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {saved && <span style={{ fontSize: 12, color: v.green, fontWeight: 500 }}>✓ Profil sauvegardé</span>}
            {saveError && <span style={{ fontSize: 12, color: '#c0392b', fontWeight: 500 }}>{saveError}</span>}
            <button onClick={() => router.push('/dashboard')} style={{ fontSize: 13, color: v.text2, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>← Dashboard</button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '7px 18px', borderRadius: 100, background: saving ? '#e8e8ed' : v.blue, color: saving ? v.text3 : '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: isMobile ? '24px 16px 80px' : '48px 24px 100px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.04em', color: v.text, marginBottom: 6 }}>Mon profil</h1>
          <p style={{ fontSize: 15, color: v.text2, fontWeight: 300 }}>Ces informations servent à pré-remplir vos CV générés par l'IA.</p>
        </div>

        {/* SECTION: Informations personnelles */}
        <Section title="Informations personnelles">
          <Grid2 isMobile={isMobile}>
            <Field label="Nom complet">
              <input style={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jean Dupont" />
            </Field>
            <Field label="Email">
              <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean@exemple.fr" />
            </Field>
          </Grid2>
          <Grid2 isMobile={isMobile}>
            <Field label="Téléphone">
              <input style={inp} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 00 00 00 00" />
            </Field>
            <Field label="Ville / Région">
              <input style={inp} value={location} onChange={e => setLocation(e.target.value)} placeholder="Paris, Île-de-France" />
            </Field>
          </Grid2>
          <Grid2 isMobile={isMobile}>
            <Field label="LinkedIn">
              <input style={inp} value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/jean-dupont" />
            </Field>
            <Field label="Titre professionnel">
              <input style={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Développeur Full Stack Senior" />
            </Field>
          </Grid2>
          <Field label="Pitch / Résumé">
            <textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brève description de votre profil et de vos ambitions professionnelles…" />
          </Field>
        </Section>

        {/* SECTION: Expériences */}
        <Section title="Expériences professionnelles">
          {experiences.map((exp, i) => (
            <ExpCard key={i}>
              <Grid2 isMobile={isMobile}>
                <Field label="Poste">
                  <input style={inp} value={exp.title} onChange={e => updateExp(i, 'title', e.target.value)} placeholder="Développeur React" />
                </Field>
                <Field label="Entreprise">
                  <input style={inp} value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="Acme Corp" />
                </Field>
              </Grid2>
              <Field label="Lieu">
                <input style={inp} value={exp.location} onChange={e => updateExp(i, 'location', e.target.value)} placeholder="Paris" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <Field label="Date de début">
                  <input style={inp} type="month" value={exp.start_date} onChange={e => updateExp(i, 'start_date', e.target.value)} />
                </Field>
                <Field label="Date de fin">
                  <input style={{ ...inp, opacity: exp.current ? 0.4 : 1 }} type="month" value={exp.end_date} onChange={e => updateExp(i, 'end_date', e.target.value)} disabled={exp.current} />
                </Field>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: v.text2, cursor: 'pointer', paddingBottom: 2, whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={exp.current} onChange={e => updateExp(i, 'current', e.target.checked)} style={{ width: 15, height: 15, accentColor: v.blue, cursor: 'pointer' }} />
                  Poste actuel
                </label>
              </div>
              <Field label="Description">
                <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} placeholder="Missions, technologies, réalisations…" />
              </Field>
              <button onClick={() => setExperiences(prev => prev.filter((_, idx) => idx !== i))} style={btnDelete}>
                Supprimer cette expérience
              </button>
            </ExpCard>
          ))}
          <button onClick={() => setExperiences(prev => [...prev, emptyExp()])} style={btnAdd}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Ajouter une expérience
          </button>
        </Section>

        {/* SECTION: Formation */}
        <Section title="Formation">
          {education.map((edu, i) => (
            <ExpCard key={i}>
              <Grid2 isMobile={isMobile}>
                <Field label="Diplôme / Formation">
                  <input style={inp} value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="Master Informatique" />
                </Field>
                <Field label="École / Université">
                  <input style={inp} value={edu.school} onChange={e => updateEdu(i, 'school', e.target.value)} placeholder="Université Paris-Saclay" />
                </Field>
              </Grid2>
              <Field label="Lieu">
                <input style={inp} value={edu.location} onChange={e => updateEdu(i, 'location', e.target.value)} placeholder="Paris" />
              </Field>
              <Grid2 isMobile={isMobile}>
                <Field label="Date de début">
                  <input style={inp} type="month" value={edu.start_date} onChange={e => updateEdu(i, 'start_date', e.target.value)} />
                </Field>
                <Field label="Date de fin">
                  <input style={inp} type="month" value={edu.end_date} onChange={e => updateEdu(i, 'end_date', e.target.value)} />
                </Field>
              </Grid2>
              <Field label="Description (optionnel)">
                <textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={edu.description} onChange={e => updateEdu(i, 'description', e.target.value)} placeholder="Spécialisation, mention, projets…" />
              </Field>
              <button onClick={() => setEducation(prev => prev.filter((_, idx) => idx !== i))} style={btnDelete}>
                Supprimer cette formation
              </button>
            </ExpCard>
          ))}
          <button onClick={() => setEducation(prev => [...prev, emptyEdu()])} style={btnAdd}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Ajouter une formation
          </button>
        </Section>

        {/* SECTION: Compétences */}
        <Section title="Compétences">
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              ref={skillInputRef}
              style={{ ...inp, flex: 1 }}
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              placeholder="ex : React, TypeScript, Figma…"
            />
            <button onClick={addSkill} style={{ padding: '11px 18px', borderRadius: 10, background: v.blue, color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Ajouter
            </button>
          </div>
          {skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map((s, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(0,113,227,.07)', border: '1px solid rgba(0,113,227,.16)', fontSize: 13, color: v.blue, fontWeight: 500 }}>
                  {s}
                  <button onClick={() => setSkills(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.blue, fontSize: 14, lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center', opacity: 0.6 }}>×</button>
                </span>
              ))}
            </div>
          )}
          {skills.length === 0 && (
            <div style={{ fontSize: 13, color: v.text3, fontStyle: 'italic' }}>Aucune compétence ajoutée</div>
          )}
        </Section>

        {/* SECTION: Langues */}
        <Section title="Langues">
          {languages.map((lang, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end', marginBottom: 10 }}>
              <Field label="Langue">
                <input style={inp} value={lang.name} onChange={e => updateLang(i, 'name', e.target.value)} placeholder="Anglais" />
              </Field>
              <Field label="Niveau">
                <select style={{ ...inp, cursor: 'pointer' }} value={lang.level} onChange={e => updateLang(i, 'level', e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <button onClick={() => setLanguages(prev => prev.filter((_, idx) => idx !== i))} style={{ ...btnDelete, marginBottom: 2, padding: '10px 14px' }}>
                ×
              </button>
            </div>
          ))}
          <button onClick={() => setLanguages(prev => [...prev, emptyLang()])} style={btnAdd}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Ajouter une langue
          </button>
        </Section>

        {/* Bottom save */}
        <div style={{ marginTop: 12 }}>
          {saveError && (
            <div style={{ background: 'rgba(192,57,43,.05)', border: '1px solid rgba(192,57,43,.15)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b', marginBottom: 14 }}>
              {saveError}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', padding: '15px', borderRadius: 12, background: saving ? '#e8e8ed' : v.blue, color: saving ? v.text3 : '#fff', border: 'none', fontSize: 15, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer le profil'}
          </button>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(0,113,227,0.45) !important; box-shadow: 0 0 0 3px rgba(0,113,227,0.08) !important; }
        @media (max-width: 768px) { input, textarea, select { font-size: 16px !important; } }
      `}</style>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.08)', padding: '28px 26px', boxShadow: '0 1px 2px rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.05)', marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#aeaeb2', marginBottom: 22 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  )
}

function Grid2({ children, isMobile }: { children: React.ReactNode; isMobile?: boolean }) {
  return <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#1d1d1f' }}>{label}</label>
      {children}
    </div>
  )
}

function ExpCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
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

const btnAdd: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '10px 16px', borderRadius: 10,
  background: 'none', border: '1.5px dashed rgba(0,0,0,0.14)',
  fontSize: 13, fontWeight: 500, color: '#6e6e73',
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'border-color .15s, color .15s',
  width: '100%', justifyContent: 'center',
}

const btnDelete: React.CSSProperties = {
  alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 8,
  background: 'rgba(192,57,43,.05)', border: '1px solid rgba(192,57,43,.12)',
  fontSize: 12, color: '#c0392b', cursor: 'pointer', fontFamily: 'inherit',
}
