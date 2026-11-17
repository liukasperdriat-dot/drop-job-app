'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { usePremiumCheckout, PAYMENT_REASSURANCE } from '@/lib/premium-link'
import { peekAnyPendingJob, cvUrlFor } from '@/lib/cv-link'
import { nextFromLocation } from '@/lib/safe-next'
import ManageSubscriptionButton from '@/components/ManageSubscriptionButton'

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


function computeScore(
  fullName: string, email: string, phone: string, location: string,
  title: string, summary: string, experiences: Experience[],
  education: Education[], skills: string[], languages: Language[]
): number {
  let s = 0
  if (fullName.trim()) s += 15
  if (email.trim()) s += 10
  if (phone.trim()) s += 10
  if (location.trim()) s += 5
  if (title.trim()) s += 10
  if (summary.trim()) s += 15
  if (experiences.length > 0) s += 15
  if (education.length > 0) s += 10
  if (skills.length > 0) s += 5
  if (languages.length > 0) s += 5
  return s
}

type ImportedProfile = {
  full_name: string; email: string; phone: string; location: string; linkedin: string
  title: string; summary: string
  experiences: Experience[]; education: Education[]; skills: string[]; languages: Language[]
}

// Page /cv où revenir après l'enregistrement du profil : celle d'où l'on vient
// (?next=/cv…), sinon l'offre choisie avant l'inscription et pas encore utilisée.
function cvReturnTarget(): string | null {
  const next = nextFromLocation('')
  if (next.startsWith('/cv')) return next
  const pending = peekAnyPendingJob()
  return pending ? cvUrlFor(pending) : null
}

function scoreMessage(score: number): string {
  if (score < 40) return 'Complétez votre profil pour des CV plus précis'
  if (score < 70) return 'Bon début ! Encore quelques infos pour optimiser vos CV'
  if (score < 100) return 'Presque parfait ! Ajoutez les derniers détails'
  return '✨ Profil complet ! Vos CV seront parfaitement optimisés'
}

export default function ProfilePage() {
  const router = useRouter()
  const { start: startCheckout, loading: checkoutLoading } = usePremiumCheckout()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isPremium, setIsPremium] = useState(false)

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

  // Retour vers le CV de l'offre choisie, après l'enregistrement
  const [returnTo, setReturnTo] = useState<string | null>(null)
  const [returnJobTitle, setReturnJobTitle] = useState('')

  // Remplissage express par IA
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importDone, setImportDone] = useState(false)

  const score = useMemo(
    () => computeScore(fullName, email, phone, location, title, summary, experiences, education, skills, languages),
    [fullName, email, phone, location, title, summary, experiences, education, skills, languages]
  )

  const firstName = fullName.trim().split(' ')[0] || ''

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/me').then(r => r.json()),
    ]).then(([{ profile }, me]) => {
      const target = cvReturnTarget()
      setReturnTo(target)
      if (target) setReturnJobTitle(new URLSearchParams(target.split('?')[1] || '').get('title') || '')
      // Nouveau profil : le remplissage express est proposé d'emblée
      if (!profile) setImportOpen(true)
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
      setIsPremium(me?.is_premium === true)
    }).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, phone, location, linkedin, title, summary, experiences, education, skills, languages }),
      })
      if (res.ok) {
        setSaved(true)
        // Une offre attend : on enchaîne directement sur la génération du CV
        if (returnTo) { router.push(returnTo); return }
        setTimeout(() => setSaved(false), 3000)
      } else {
        const d = await res.json().catch(() => ({}))
        setSaveError(d.error || 'Erreur lors de la sauvegarde')
      }
    } catch {
      setSaveError('Connexion impossible. Vérifiez votre accès à Internet puis réessayez.')
    } finally {
      setSaving(false)
    }
  }

  async function handleImport() {
    if (importText.trim().length < 80) {
      setImportError('Collez le texte complet de votre CV (au moins quelques lignes).')
      return
    }
    const hasData = experiences.length > 0 || education.length > 0 || skills.length > 0
    if (hasData && !window.confirm('Les informations trouvées remplaceront celles déjà saisies. Continuer ?')) return
    setImporting(true)
    setImportError('')
    setImportDone(false)
    try {
      const res = await fetch('/api/profile/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: importText }),
      })
      const data = await res.json().catch(() => ({ error: 'La lecture du CV a échoué. Réessayez.' }))
      if (!res.ok || !data.profile) { setImportError(data.error || 'La lecture du CV a échoué. Réessayez.'); return }
      const p = data.profile as ImportedProfile
      // Un champ trouvé remplace la saisie ; un champ absent du CV ne l'efface pas
      if (p.full_name) setFullName(p.full_name)
      if (p.email) setEmail(p.email)
      if (p.phone) setPhone(p.phone)
      if (p.location) setLocation(p.location)
      if (p.linkedin) setLinkedin(p.linkedin)
      if (p.title) setTitle(p.title)
      if (p.summary) setSummary(p.summary)
      if (p.experiences.length) setExperiences(p.experiences)
      if (p.education.length) setEducation(p.education)
      if (p.skills.length) setSkills(p.skills)
      if (p.languages.length) setLanguages(p.languages)
      setImportDone(true)
      setImportOpen(false)
      setImportText('')
    } catch {
      setImportError('Connexion impossible. Vérifiez votre accès à Internet puis réessayez.')
    } finally {
      setImporting(false)
    }
  }

  const saveLabel = returnTo ? 'Enregistrer et générer mon CV →' : 'Enregistrer le profil'

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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased">

      {/* STICKY NAV */}
      <nav className="sticky top-0 z-50 h-14 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto h-full px-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-800 font-semibold text-[15px] tracking-tight hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer"
          >
            <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
              <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="2.2" fill="none"/>
              <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.45"/>
              <circle cx="20" cy="20" r="7.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="17,20.5 20,23.5 23,20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            drop-job
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-blue-600 hidden sm:block">
              Profil à {score}%
            </span>
            {saved && (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <svg viewBox="0 0 16 16" fill="none" width={13} height={13}><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Sauvegardé
              </span>
            )}
            {saveError && <span className="text-xs font-medium text-red-600">{saveError}</span>}
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none cursor-pointer"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                saving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : saved
                  ? 'bg-emerald-500 text-white cursor-pointer'
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : returnTo ? 'Enregistrer et continuer →' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-24 space-y-6">

        {/* HERO HEADER */}
        <div className="pt-2 pb-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Bonjour{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="text-gray-500 text-base">
            Un profil complet = un CV généré plus précis par l&apos;IA
          </p>
        </div>

        {/* OFFRE EN ATTENTE */}
        {returnTo && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 text-sm text-blue-800">
            <span className="font-semibold">Votre offre vous attend{returnJobTitle ? ` : « ${returnJobTitle} »` : ''}.</span>{' '}
            Remplissez votre profil puis enregistrez-le : vous revenez directement à la génération de votre CV.
          </div>
        )}

        {/* REMPLISSAGE EXPRESS PAR IA */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">⚡ Remplissage express par IA</h2>
              <p className="text-sm text-gray-500">Collez le texte de votre CV actuel ou de votre profil LinkedIn : le formulaire se remplit en 10 secondes.</p>
            </div>
            {!importOpen && (
              <button
                type="button"
                onClick={() => { setImportOpen(true); setImportDone(false) }}
                className="shrink-0 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer border-none"
              >
                Utiliser
              </button>
            )}
          </div>
          {importOpen && (
            <>
              <textarea
                className={`${inp} resize-y`}
                rows={7}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                maxLength={15000}
                placeholder={'Ouvrez votre CV (Word, PDF…), sélectionnez tout le texte (Ctrl+A), copiez-le puis collez-le ici.\nSur LinkedIn : ouvrez votre profil, sélectionnez et copiez le texte.'}
              />
              {importError && <p className="text-sm text-red-600">{importError}</p>}
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all border-none ${importing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'}`}
              >
                {importing ? 'Lecture de votre CV…' : 'Pré-remplir mon profil'}
              </button>
              <p className="text-xs text-gray-400">Le texte est analysé par notre IA (OpenAI) pour remplir le formulaire, sans être conservé par Drop-Job. Rien n&apos;est enregistré tant que vous ne cliquez pas sur « Enregistrer ».</p>
            </>
          )}
          {importDone && (
            <p className="text-sm text-emerald-700 font-medium">✓ Profil pré-rempli. Vérifiez les informations ci-dessous, puis cliquez sur « {saveLabel} ».</p>
          )}
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-blue-600">Profil complété à {score}%</span>
            <span className="text-xs text-gray-400">{score}/100 pts</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${score}%`,
                background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
              }}
            />
          </div>
          <p className="text-sm text-gray-500">{scoreMessage(score)}</p>
        </div>

        {/* SUBSCRIPTION CARD */}
        {isPremium ? (
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
          >
            <span className="text-3xl">✨</span>
            <div>
              <p className="text-white font-semibold text-base">Premium actif — CV illimités</p>
              <p className="text-blue-200 text-sm">Merci de faire confiance à drop-job !</p>
            </div>
            <div className="ml-auto">
              <ManageSubscriptionButton />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-blue-300 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-semibold text-gray-800 text-base">Plan gratuit — 1 CV par mois</p>
                <p className="text-gray-500 text-sm">Passez Premium pour des CV illimités et des fonctionnalités avancées</p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
              <button
                type="button"
                onClick={() => startCheckout('monthly', '/cv')}
                disabled={checkoutLoading !== null}
                aria-busy={checkoutLoading !== null}
                className="inline-block min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-wait text-white text-sm font-semibold transition-colors"
              >
                {checkoutLoading ? 'Ouverture du paiement…' : 'Passer Premium → 9,90€/mois'}
              </button>
              <p className="text-[11px] text-gray-500">{PAYMENT_REASSURANCE}</p>
            </div>
          </div>
        )}

        {/* SECTION: Informations personnelles */}
        <Section title="Informations personnelles">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom complet">
              <input className={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jean Dupont" />
            </Field>
            <Field label="Email">
              <input className={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean@exemple.fr" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Téléphone">
              <input className={inp} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 00 00 00 00" />
            </Field>
            <Field label="Ville / Région">
              <input className={inp} value={location} onChange={e => setLocation(e.target.value)} placeholder="Paris, Île-de-France" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="LinkedIn">
              <input className={inp} value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/jean-dupont" />
            </Field>
            <Field label="Titre professionnel">
              <input className={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Développeur Full Stack Senior" />
            </Field>
          </div>
          <Field label="Pitch / Résumé">
            <textarea className={`${inp} resize-y`} rows={4} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brève description de votre profil et de vos ambitions professionnelles…" />
          </Field>
        </Section>

        {/* SECTION: Expériences */}
        <Section title="Expériences professionnelles">
          <div className="space-y-4">
            {experiences.map((exp, i) => (
              <ExpCard key={i}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Poste">
                    <input className={inp} value={exp.title} onChange={e => updateExp(i, 'title', e.target.value)} placeholder="Développeur React" />
                  </Field>
                  <Field label="Entreprise">
                    <input className={inp} value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="Acme Corp" />
                  </Field>
                </div>
                <Field label="Lieu">
                  <input className={inp} value={exp.location} onChange={e => updateExp(i, 'location', e.target.value)} placeholder="Paris" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                  <Field label="Date de début">
                    <input className={inp} type="month" value={exp.start_date} onChange={e => updateExp(i, 'start_date', e.target.value)} />
                  </Field>
                  <Field label="Date de fin">
                    <input className={`${inp} ${exp.current ? 'opacity-40' : ''}`} type="month" value={exp.end_date} onChange={e => updateExp(i, 'end_date', e.target.value)} disabled={exp.current} />
                  </Field>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pb-0.5 whitespace-nowrap">
                    <input type="checkbox" checked={exp.current} onChange={e => updateExp(i, 'current', e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                    Poste actuel
                  </label>
                </div>
                <Field label="Description">
                  <textarea className={`${inp} resize-y`} rows={3} value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} placeholder="Missions, technologies, réalisations…" />
                </Field>
                <button
                  onClick={() => setExperiences(prev => prev.filter((_, idx) => idx !== i))}
                  className="self-start px-4 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors border border-red-100 cursor-pointer"
                >
                  Supprimer cette expérience
                </button>
              </ExpCard>
            ))}
          </div>
          <button
            onClick={() => setExperiences(prev => [...prev, emptyExp()])}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer bg-transparent"
          >
            <span className="text-lg leading-none">+</span> Ajouter une expérience
          </button>
        </Section>

        {/* SECTION: Formation */}
        <Section title="Formation">
          <div className="space-y-4">
            {education.map((edu, i) => (
              <ExpCard key={i}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Diplôme / Formation">
                    <input className={inp} value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="Master Informatique" />
                  </Field>
                  <Field label="École / Université">
                    <input className={inp} value={edu.school} onChange={e => updateEdu(i, 'school', e.target.value)} placeholder="Université Paris-Saclay" />
                  </Field>
                </div>
                <Field label="Lieu">
                  <input className={inp} value={edu.location} onChange={e => updateEdu(i, 'location', e.target.value)} placeholder="Paris" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Date de début">
                    <input className={inp} type="month" value={edu.start_date} onChange={e => updateEdu(i, 'start_date', e.target.value)} />
                  </Field>
                  <Field label="Date de fin">
                    <input className={inp} type="month" value={edu.end_date} onChange={e => updateEdu(i, 'end_date', e.target.value)} />
                  </Field>
                </div>
                <Field label="Description (optionnel)">
                  <textarea className={`${inp} resize-y`} rows={2} value={edu.description} onChange={e => updateEdu(i, 'description', e.target.value)} placeholder="Spécialisation, mention, projets…" />
                </Field>
                <button
                  onClick={() => setEducation(prev => prev.filter((_, idx) => idx !== i))}
                  className="self-start px-4 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors border border-red-100 cursor-pointer"
                >
                  Supprimer cette formation
                </button>
              </ExpCard>
            ))}
          </div>
          <button
            onClick={() => setEducation(prev => [...prev, emptyEdu()])}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer bg-transparent"
          >
            <span className="text-lg leading-none">+</span> Ajouter une formation
          </button>
        </Section>

        {/* SECTION: Compétences */}
        <Section title="Compétences">
          <div className="flex gap-3">
            <input
              ref={skillInputRef}
              className={`${inp} flex-1`}
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              placeholder="ex : React, TypeScript, Figma…"
            />
            <button
              onClick={addSkill}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap border-none"
            >
              Ajouter
            </button>
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium"
                >
                  {s}
                  <button
                    onClick={() => setSkills(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-blue-400 hover:text-blue-700 transition-colors leading-none bg-transparent border-none cursor-pointer p-0 text-base"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Aucune compétence ajoutée</p>
          )}
        </Section>

        {/* SECTION: Langues */}
        <Section title="Langues">
          <div className="space-y-3">
            {languages.map((lang, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <Field label="Langue">
                  <input className={inp} value={lang.name} onChange={e => updateLang(i, 'name', e.target.value)} placeholder="Anglais" />
                </Field>
                <Field label="Niveau">
                  <select className={`${inp} cursor-pointer`} value={lang.level} onChange={e => updateLang(i, 'level', e.target.value)}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
                <button
                  onClick={() => setLanguages(prev => prev.filter((_, idx) => idx !== i))}
                  className="px-3 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors border border-red-100 cursor-pointer mb-px"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setLanguages(prev => [...prev, emptyLang()])}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer bg-transparent"
          >
            <span className="text-lg leading-none">+</span> Ajouter une langue
          </button>
        </Section>

        {/* BOTTOM SAVE */}
        <div className="pt-2">
          {saveError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
              {saveError}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-2xl text-[15px] font-semibold transition-all ${
              saving
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : saved
                ? 'bg-emerald-500 text-white cursor-pointer'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-200'
            }`}
          >
            {saving ? 'Enregistrement…' : saved ? '✓ Profil enregistré !' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
      style={{ borderLeft: '4px solid #2563eb' }}
    >
      <h2 className="text-[11px] font-bold tracking-widest uppercase text-blue-600">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-700">{label}</label>
      {children}
    </div>
  )
}

function ExpCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
      {children}
    </div>
  )
}

const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white font-sans focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 sm:text-sm'
