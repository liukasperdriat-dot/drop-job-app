'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { PAYMENT_REASSURANCE, PRICES, pricingUrl, usePremiumCheckout, type BillingPeriod } from '@/lib/premium-link'
import { peekPendingJob, markPendingJobGenerated, peekOfferDraft } from '@/lib/cv-link'
import type { LetterParts } from '@/lib/letter'
import SiteHeader from '@/components/SiteHeader'

type Template = 'classique' | 'moderne' | 'minimaliste'

// Fenêtre Premium : le message dépend de ce que l'utilisateur essayait de faire
type UpsellReason = 'quota' | 'download' | 'template' | 'letter'
const UPSELL_COPY: Record<UpsellReason, { icon: string; title: string; text: string }> = {
  quota: {
    icon: '⏳',
    title: 'Votre CV gratuit du mois est utilisé',
    text: 'Passez à Premium pour générer un CV sur-mesure pour chaque offre, sans limite, avec la lettre de motivation complète.',
  },
  download: {
    icon: '🚀',
    title: 'Vous avez aimé votre CV ?',
    text: 'Avec Premium, générez autant de CV que vous voulez sans mention en pied de page, obtenez votre lettre de motivation IA complète et accédez aux modèles Moderne et Minimaliste.',
  },
  template: {
    icon: '🎨',
    title: 'Débloquez les modèles Moderne et Minimaliste',
    text: 'Démarquez-vous avec une mise en page plus moderne, des CV illimités sans mention en pied de page et la lettre de motivation complète.',
  },
  letter: {
    icon: '✉️',
    title: 'Votre lettre complète vous attend',
    text: 'Débloquez la suite de votre lettre, la formule de politesse et le téléchargement en PDF, ainsi que des CV illimités pour chaque offre.',
  },
}

// CV en cours gardé le temps du paiement (même onglet), pour le retrouver au retour de Stripe
const CV_STATE_KEY = 'dropjob:cv-state'
const CV_STATE_MAX_AGE = 60 * 60 * 1000
type PaymentState = 'idle' | 'confirming' | 'active' | 'delayed'
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

type SavedCvState = { at: number; cv: unknown; letterParts: LetterParts | null; jobTitle?: string; company?: string; jobDescription?: string }
function readSavedCvState(): SavedCvState | null {
  try {
    const raw = typeof window === 'undefined' ? null : sessionStorage.getItem(CV_STATE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<SavedCvState>
    if (!saved?.cv || typeof saved.at !== 'number' || Date.now() - saved.at > CV_STATE_MAX_AGE) return null
    const text = (v: unknown) => (typeof v === 'string' ? v : '')
    return {
      at: saved.at, cv: saved.cv, letterParts: saved.letterParts ?? null,
      jobTitle: text(saved.jobTitle), company: text(saved.company), jobDescription: text(saved.jobDescription),
    }
  } catch {
    return null
  }
}

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

  // Offre choisie sur la liste : description et lien de candidature gardés dans
  // le navigateur (cette page n'est rendue que côté navigateur, sous <Suspense>)
  const [pending] = useState(() => peekPendingJob(params.get('title') || '', params.get('company') || '', params.get('jobId')))
  const applyUrl = params.get('applyUrl') || pending?.applyUrl || ''

  // CV et offre gardés pendant le paiement Stripe : retrouvés au retour
  const [savedCvState] = useState(readSavedCvState)
  const [jobTitle, setJobTitle]         = useState(params.get('title') || savedCvState?.jobTitle || '')
  const [company, setCompany]           = useState(params.get('company') || savedCvState?.company || '')
  const [jobDescription, setJobDescription] = useState(() =>
    params.get('description') || pending?.description || savedCvState?.jobDescription ||
    // Offre collée dans l'outil « Score ATS » (sans offre choisie dans la liste)
    (params.get('title') ? '' : peekOfferDraft()))

  const [profileData, setProfileData]   = useState<any>(null)

  const [cv, setCv]             = useState<any>(() => savedCvState?.cv ?? null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [downloading, setDownloading] = useState(false)

  const [template, setTemplate] = useState<Template>('classique')
  const [isPremium, setIsPremium] = useState(false)
  const [cvCount, setCvCount] = useState(0)

  const [photoUrl, setPhotoUrl]             = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError]         = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  type ProfileState = 'loading' | 'loaded' | 'empty' | 'error'
  const [profileState, setProfileState] = useState<ProfileState>('loading')

  const [letter, setLetter]               = useState<string | null>(null)
  const [letterParts, setLetterParts]     = useState<LetterParts | null>(() => savedCvState?.letterParts ?? null)
  // Aperçu gratuit : seuls l'en-tête et le premier paragraphe sont reçus
  const [letterLocked, setLetterLocked]   = useState(false)
  const [hiddenParagraphs, setHiddenParagraphs] = useState(0)
  const [letterLoading, setLetterLoading] = useState(false)
  const [letterError, setLetterError]     = useState('')
  const [activeTab, setActiveTab]         = useState<'cv' | 'letter'>('cv')
  const [copied, setCopied]               = useState(false)
  const [letterDownloading, setLetterDownloading] = useState(false)
  const [upsell, setUpsell] = useState<UpsellReason | null>(null)
  const { start: startCheckout, loading: checkoutLoading } = usePremiumCheckout()
  const [payment, setPayment] = useState<PaymentState>(() => params.get('success') === 'true' ? 'confirming' : 'idle')

  function openUpsell(reason: UpsellReason) { setUpsell(reason) }

  // Garde le CV généré pendant le détour par Stripe
  function saveCvState() {
    if (!cv) return
    try {
      sessionStorage.setItem(CV_STATE_KEY, JSON.stringify({
        at: Date.now(), cv, letterParts: letterLocked ? null : letterParts,
        jobTitle, company, jobDescription: jobDescription.slice(0, 15000),
      }))
    } catch { /* stockage indisponible : le CV sera à régénérer */ }
  }

  function checkout(period: BillingPeriod) {
    saveCvState()
    startCheckout(period)
  }

  // Retour de Stripe (?success=true) : CV en cours restauré, puis activation du Premium
  // confirmée auprès de Stripe (sans attendre le webhook), avec relecture du statut en secours.
  useEffect(() => {
    // CV restauré à l'ouverture de la page (voir savedCvState) : la sauvegarde ne sert plus
    try { sessionStorage.removeItem(CV_STATE_KEY) } catch { /* stockage indisponible */ }

    if (params.get('success') !== 'true') return
    const sessionId = params.get('session_id')
    const url = new URL(window.location.href)
    url.searchParams.delete('success')
    url.searchParams.delete('session_id')
    window.history.replaceState(null, '', url.pathname + url.search)

    let cancelled = false
    const activate = () => { if (!cancelled) { setIsPremium(true); setPayment('active') } }
    ;(async () => {
      if (sessionId) {
        try {
          const res = await fetch('/api/stripe/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          })
          const data = await res.json().catch(() => ({}))
          if (data.is_premium) { activate(); return }
        } catch { /* le webhook prend le relais */ }
      }
      for (let i = 0; i < 8 && !cancelled; i++) {
        await wait(1500)
        try {
          const data = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json())
          if (data.is_premium) { activate(); return }
        } catch { /* nouvel essai */ }
      }
      if (!cancelled) setPayment('delayed')
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Offre choisie : ajoutée au tableau de bord (l'API ignore les doublons).
  // Elle reste gardée dans le navigateur jusqu'à la génération du CV, pour
  // survivre à un détour par la création du profil.
  useEffect(() => {
    if (!pending) return
    if (pending.job_id) {
      fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: pending.job_id, job_title: pending.title, company: pending.company,
          location: pending.location, contract: pending.contract, salary: pending.salary,
        }),
      }).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Vers le profil, avec retour automatique sur cette page (et cette offre) après l'enregistrement
  function goToProfile() {
    const here = window.location.pathname + window.location.search
    router.push(`/profile?next=${encodeURIComponent(here)}`)
  }

  function retryProfile() {
    setProfileState('loading')
    fetchProfile()
  }

  function fetchProfile() {
    fetch('/api/profile')
      .then(async r => {
        if (!r.ok) throw new Error(String(r.status))
        const { profile } = await r.json()
        if (profile) { setProfileData(profile); setPhotoUrl(profile.photo_url || null); setProfileState('loaded') }
        else setProfileState('empty')
      })
      .catch(() => setProfileState('error'))
  }

  useEffect(() => {
    fetchProfile()

    fetch('/api/me')
      .then(r => r.json())
      .then(({ is_premium, cv_count_this_month }) => {
        setIsPremium(!!is_premium)
        setCvCount(cv_count_this_month ?? 0)
      })
      .catch(() => {})
  }, [])

  const generatingRef = useRef(false)
  async function handleGenerate() {
    // Une seule génération à la fois, même sur un double clic très rapide
    if (generatingRef.current) return
    generatingRef.current = true
    setLoading(true); setError(''); setCv(null); setLetter(null); setLetterParts(null); setLetterLocked(false); setActiveTab('cv')
    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, jobDescription }),
      })
      const data = await res.json().catch(() => ({ error: 'La génération a pris trop de temps ou a échoué. Réessayez.' }))
      if (data.error === 'QUOTA_EXCEEDED') { openUpsell('quota'); return }
      if (data.error || !data.cv) { setError(data.error || 'La génération a échoué. Réessayez.'); return }
      setCv(data.cv)
      setCvCount(c => c + 1)
      markPendingJobGenerated()
    } catch {
      setError('Connexion impossible. Vérifiez votre accès à Internet puis réessayez.')
    } finally {
      generatingRef.current = false
      setLoading(false)
    }
  }

  async function handleDownloadPDF() {
    if (!cv) return
    setDownloading(true)
    try {
      const { downloadCV } = await import('./pdf-templates')
      // Statut actuel (et non celui du moment de la génération) : après un passage
      // en Premium, le CV déjà généré se télécharge sans mention ni restriction de modèle.
      await downloadCV(isPremium ? template : 'classique', { ...cv, watermark: !isPremium }, { ...profileData, photo_url: photoUrl }, company)
      if (!isPremium) openUpsell('download')
    } catch (err) {
      console.error('[cv] téléchargement PDF', err)
      setError('Le téléchargement du PDF a échoué. Réessayez ; si le problème persiste, retirez la photo puis réessayez.')
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
    try {
      const res = await fetch('/api/profile/photo', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({ error: 'L’envoi de la photo a échoué.' }))
      if (data.error) { setPhotoError(data.error); return }
      setPhotoUrl(data.photo_url)
    } catch {
      setPhotoError('Connexion impossible. Réessayez.')
    } finally {
      setPhotoUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handlePhotoDelete() {
    setPhotoUploading(true)
    setPhotoError('')
    try {
      const res = await fetch('/api/profile/photo', { method: 'DELETE' })
      if (!res.ok) { setPhotoError('La suppression a échoué. Réessayez.'); return }
      setPhotoUrl(null)
    } catch {
      setPhotoError('Connexion impossible. Réessayez.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleGenerateLetter() {
    setLetterLoading(true); setLetterError('')
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, jobDescription }),
      })
      const data = await res.json().catch(() => ({ error: 'La génération a pris trop de temps ou a échoué. Réessayez.' }))
      if (data.error || !data.parts) { setLetterError(data.message || data.error || 'La génération a échoué. Réessayez.'); return }
      setLetterParts(data.parts)
      setLetter(data.letter || null)
      setLetterLocked(!!data.locked)
      setHiddenParagraphs(data.hiddenParagraphs || 0)
      setActiveTab('letter')
    } catch {
      setLetterError('Connexion impossible. Vérifiez votre accès à Internet puis réessayez.')
    } finally {
      setLetterLoading(false)
    }
  }

  async function handleCopyLetter() {
    if (!letter) return
    await navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownloadLetter() {
    if (!letterParts || letterLocked) return
    setLetterDownloading(true)
    try {
      const { downloadLetter } = await import('./pdf-templates')
      await downloadLetter(letterParts, company)
    } catch (err) {
      console.error('[cv] téléchargement lettre', err)
      setLetterError('Le téléchargement de la lettre a échoué. Réessayez, ou copiez le texte.')
    } finally {
      setLetterDownloading(false)
    }
  }

  const canGenerate =
    !loading &&
    !!jobTitle && !!company && !!jobDescription &&
    profileState === 'loaded'

  // Champs à remplir avant de pouvoir générer (affiché sous le bouton)
  const missingFields = [
    !jobTitle.trim() && 'le poste visé',
    !company.trim() && "l'entreprise",
    !jobDescription.trim() && "la description de l'offre",
  ].filter(Boolean) as string[]

  return (
    <div style={{ minHeight: '100vh', background: v.bg, fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif", WebkitFontSmoothing: 'antialiased' as any }}>

      <SiteHeader />

      {/* CONTENT */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: isMobile ? '24px 16px 80px' : '48px 24px 80px' }}>

        <div style={{ marginBottom: 32 }}>
          {payment !== 'idle' && <PaymentBanner state={payment} onClose={() => setPayment('idle')} />}
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
                  onClick={() => { if (locked) openUpsell('template'); else setTemplate(t.id) }}
                  style={{
                    background: v.white,
                    border: selected ? `2px solid ${v.blue}` : `1.5px solid ${v.line2}`,
                    borderRadius: 14,
                    padding: '12px 14px',
                    cursor: 'pointer',
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
              <button type="button" onClick={() => openUpsell('template')} style={{ fontWeight: 600, color: v.blue, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, flexShrink: 0, marginLeft: 12 }}>Passer Premium →</button>
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
              {!jobDescription.trim() && (
                <a href="/jobs" style={{ display: 'inline-block', marginTop: 6, fontSize: 12, color: v.blue, textDecoration: 'none', fontWeight: 500 }}>
                  Pas d&apos;offre sous la main ? Choisir parmi les offres du moment →
                </a>
              )}
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
                  <button onClick={goToProfile} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: v.blue, fontFamily: 'inherit', fontWeight: 500, textDecoration: 'underline', padding: 0 }}>
                    Modifier →
                  </button>
                </div>
              </Field>
            )}

            {profileState === 'empty' && (
              <Field label="Votre profil">
                <div style={{ padding: '16px 18px', borderRadius: 10, border: '1.5px dashed rgba(0,0,0,0.14)', background: 'rgba(0,0,0,0.01)', textAlign: 'center' as any }}>
                  <div style={{ fontSize: 13, color: v.text2, fontWeight: 500, marginBottom: 4 }}>Crée d'abord ton profil pour générer un CV</div>
                  <div style={{ fontSize: 12, color: v.text3, marginBottom: 10 }}>Colle ton CV actuel : l'IA remplit tout en quelques secondes. Ton offre t'attendra ici.</div>
                  <button onClick={goToProfile} style={{ padding: '9px 20px', borderRadius: 100, background: v.blue, color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Créer mon profil →
                  </button>
                </div>
              </Field>
            )}

            {profileState === 'error' && (
              <Field label="Votre profil">
                <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(192,57,43,.2)', background: 'rgba(192,57,43,.04)', fontSize: 13, color: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span>Impossible de charger votre profil.</span>
                  <button onClick={retryProfile} style={{ padding: '6px 14px', borderRadius: 100, background: v.blue, color: '#fff', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Réessayer</button>
                </div>
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

            {!loading && profileState === 'loaded' && missingFields.length > 0 && (
              <p style={{ textAlign: 'center', fontSize: 12, color: v.text3, margin: 0 }}>
                Complétez {missingFields.join(', ').replace(/, ([^,]*)$/, ' et $1')} pour lancer la génération.
              </p>
            )}

            {!isPremium && (
              cvCount >= 1 ? (
                <p style={{ textAlign: 'center', fontSize: 13, color: '#ff3b30', margin: 0 }}>
                  0 CV gratuit restant ce mois —{' '}
                  <button type="button" onClick={() => openUpsell('quota')} style={{ color: v.blue, fontWeight: 500, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Passez Premium</button>
                </p>
              ) : (
                <p style={{ textAlign: 'center', fontSize: 13, color: '#6e6e73', margin: 0 }}>
                  1 CV gratuit restant ce mois ·{' '}
                  <a href={pricingUrl()} onClick={saveCvState} style={{ color: v.blue, fontWeight: 500, textDecoration: 'none' }}>illimité avec Premium</a>
                </p>
              )
            )}

            {cv && (
              <>
                <button
                  onClick={handleGenerateLetter}
                  disabled={letterLoading}
                  style={{ padding: '13px', borderRadius: 10, background: letterLoading ? '#e8e8ed' : 'rgba(0,113,227,.07)', color: letterLoading ? v.text3 : v.blue, border: `1px solid ${letterLoading ? 'transparent' : 'rgba(0,113,227,.18)'}`, fontSize: 15, fontWeight: 500, cursor: letterLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {letterLoading
                    ? 'Rédaction de la lettre…'
                    : isPremium
                      ? (letterParts ? 'Régénérer la lettre de motivation' : 'Générer la lettre de motivation')
                      : 'Voir ma lettre de motivation'}
                  {!isPremium && !letterLoading && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(29,131,72,.1)', color: '#1d8348' }}>Aperçu gratuit</span>
                  )}
                </button>
                {letterError && (
                  <div style={{ background: 'rgba(192,57,43,.05)', border: '1px solid rgba(192,57,43,.15)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b' }}>
                    {letterError}
                    {!isPremium && (
                      <button type="button" onClick={() => openUpsell('letter')} style={{ display: 'block', marginTop: 6, color: v.blue, fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Voir les offres Premium →</button>
                    )}
                  </div>
                )}
              </>
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
              {letterParts ? (
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

            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', alignItems: (cv || loading) || (activeTab === 'letter' && !!letterParts) ? 'flex-start' : 'center', justifyContent: 'center' }}>

              {(activeTab === 'cv' || !letterParts) && <>

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

                  <MatchCard cv={cv} />

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
                    <div style={{ textAlign: 'center' as any, fontSize: 11, color: '#6b7280', marginTop: 12, paddingTop: 10, borderTop: `1px solid ${v.line}` }}>CV généré gratuitement sur drop-job.fr — Version sans filigrane sur drop-job.fr</div>
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

              {activeTab === 'letter' && letterParts && (
                <div style={{ width: '100%' }}>
                  <LetterPreview parts={letterParts} />

                  {letterLocked && (
                    <div style={{ position: 'relative', marginTop: 4 }}>
                      {/* Suite de la lettre : texte d'illustration flouté (la vraie suite n'est pas envoyée) */}
                      <div aria-hidden="true" className="blur-sm select-none" style={{ pointerEvents: 'none' }}>
                        {LOCKED_FILLER.slice(0, Math.max(2, hiddenParagraphs)).map((para, i) => (
                          <p key={i} style={{ fontSize: 14, color: v.text2, lineHeight: 1.85, marginBottom: 16 }}>{para}</p>
                        ))}
                        <p style={{ fontSize: 14, color: v.text2, lineHeight: 1.85 }}>Je vous prie d&apos;agréer, Madame, Monsieur, l&apos;expression de mes salutations distinguées.</p>
                      </div>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                        <div style={{ background: 'rgba(255,255,255,.94)', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,.12)', padding: '18px 20px', textAlign: 'center' as const, maxWidth: 360 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: v.text, marginBottom: 4 }}>Votre lettre est prête</div>
                          <div style={{ fontSize: 12, color: v.text2, marginBottom: 12 }}>{hiddenParagraphs > 0 ? `Encore ${hiddenParagraphs} paragraphes, la formule de politesse et la signature.` : 'La suite, la formule de politesse et la signature.'}</div>
                          <button
                            onClick={() => openUpsell('letter')}
                            style={{ padding: '11px 16px', borderRadius: 10, background: v.blue, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.35 }}
                          >
                            Débloquer la lettre complète et les modèles Moderne &amp; Minimaliste
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!letterLocked && letter && (
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
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* UPSELL MODAL */}
      {upsell && (
        <div
          onClick={() => { if (!checkoutLoading) setUpsell(null) }}
          role="dialog" aria-modal="true" aria-labelledby="upsell-title"
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: isMobile ? '20px 20px 0 0' : 20, padding: isMobile ? '28px 20px 32px' : '40px 40px', maxWidth: 460, width: '100%', boxShadow: '0 8px 48px rgba(0,0,0,0.18)', textAlign: 'center' as const }}
          >
            <div style={{ fontSize: 36, marginBottom: 14 }} aria-hidden="true">{UPSELL_COPY[upsell].icon}</div>
            <div id="upsell-title" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f', marginBottom: 12 }}>
              {UPSELL_COPY[upsell].title}
            </div>
            <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.7, marginBottom: 20 }}>
              {UPSELL_COPY[upsell].text}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(['weekly', 'monthly'] as const).map((period, i) => {
                const busy = checkoutLoading === period
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => checkout(period)}
                    disabled={checkoutLoading !== null}
                    aria-busy={busy}
                    style={{
                      minHeight: 48, padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
                      cursor: checkoutLoading ? 'wait' : 'pointer', opacity: checkoutLoading && !busy ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      ...(i === 0
                        ? { background: v.blue, color: '#fff', border: 'none' }
                        : { background: 'rgba(0,113,227,.07)', color: v.blue, border: '1px solid rgba(0,113,227,.18)' }),
                    }}
                  >
                    {busy
                      ? <><span aria-hidden="true" style={{ width: 15, height: 15, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Ouverture du paiement sécurisé…</>
                      : `Premium — ${PRICES[period].amount} / ${PRICES[period].unit}`}
                  </button>
                )
              })}
              <div style={{ fontSize: 12, color: '#6e6e73', margin: '2px 0 4px' }}>{PAYMENT_REASSURANCE}</div>
              <a href={pricingUrl()} onClick={saveCvState} style={{ fontSize: 13, color: v.blue, textDecoration: 'none', fontWeight: 500, padding: '4px 0' }}>Comparer les offres →</a>
              <button
                type="button"
                onClick={() => setUpsell(null)}
                disabled={checkoutLoading !== null}
                style={{ minHeight: 44, padding: '13px', borderRadius: 12, background: '#f5f5f7', color: '#6e6e73', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { outline: none; border-color: rgba(0,113,227,0.45) !important; box-shadow: 0 0 0 3px rgba(0,113,227,0.08) !important; }
        @media (max-width: 768px) { input, textarea { font-size: 16px !important; } }
      `}</style>
    </div>
  )
}

// Texte d'illustration flouté sous l'aperçu gratuit de la lettre
const LOCKED_FILLER = [
  "Au cours de mes expériences, j'ai développé des compétences directement liées aux missions de ce poste, en particulier dans l'organisation, le suivi et la relation avec les clients et les équipes.",
  "Rejoindre votre entreprise représente pour moi l'occasion de mettre ces compétences au service d'un projet qui me motive, tout en continuant à progresser à vos côtés.",
  "Disponible rapidement, je serais heureux de vous présenter ma motivation lors d'un entretien, à votre convenance.",
]

// Score de matching et explications, visibles par tous les utilisateurs
function MatchCard({ cv }: { cv: any }) {
  if (typeof cv?.matchScore !== 'number') return null
  const score: number = cv.matchScore
  const color = scoreColor(score)
  const strengths: string[] = Array.isArray(cv.matchStrengths) ? cv.matchStrengths : []
  const gaps: string[] = Array.isArray(cv.matchGaps) ? cv.matchGaps : []
  // CV générés avant l'ajout des points forts / à renforcer
  const reasons: string[] = !strengths.length && !gaps.length && Array.isArray(cv.matchReasons) ? cv.matchReasons : []
  return (
    <div style={{ border: `1px solid ${color}33`, background: `${color}0d`, borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>Votre profil correspond à {score} % à cette offre</div>
        <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.03em', flexShrink: 0 }}>{score} %</div>
      </div>
      <div style={{ height: 6, background: 'rgba(0,0,0,.06)', borderRadius: 100, overflow: 'hidden', marginBottom: strengths.length || gaps.length || reasons.length ? 12 : 0 }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 100 }} />
      </div>
      {strengths.length > 0 && (
        <div style={{ marginBottom: gaps.length ? 8 : 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#1d8348', marginBottom: 4 }}>Points forts</div>
          {strengths.map((t, i) => <div key={i} style={{ fontSize: 12, color: '#3a3a3c', lineHeight: 1.55 }}>✓ {t}</div>)}
        </div>
      )}
      {gaps.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#b45309', marginBottom: 4 }}>À renforcer</div>
          {gaps.map((t, i) => <div key={i} style={{ fontSize: 12, color: '#3a3a3c', lineHeight: 1.55 }}>• {t}</div>)}
        </div>
      )}
      {reasons.map((t, i) => <div key={i} style={{ fontSize: 12, color: '#3a3a3c', lineHeight: 1.55 }}>• {t}</div>)}
    </div>
  )
}

// Lettre au format professionnel : expéditeur, destinataire, lieu et date, objet, corps
function LetterPreview({ parts }: { parts: LetterParts }) {
  const body = { fontSize: 14, color: '#3a3a3c', lineHeight: 1.85, marginBottom: 16 }
  return (
    <div>
      <div style={{ fontSize: 12, color: '#3a3a3c', lineHeight: 1.6, marginBottom: 16 }}>
        {parts.sender.map((line, i) => <div key={i} style={i === 0 ? { fontWeight: 600, color: '#1d1d1f' } : undefined}>{line}</div>)}
      </div>
      <div style={{ fontSize: 12, color: '#3a3a3c', lineHeight: 1.6, marginBottom: 12, marginLeft: 'auto', width: 'fit-content', minWidth: '45%' }}>
        {parts.recipient.map((line, i) => <div key={i} style={i === 0 ? { fontWeight: 600, color: '#1d1d1f' } : undefined}>{line}</div>)}
      </div>
      <div style={{ fontSize: 12, color: '#3a3a3c', textAlign: 'right' as const, marginBottom: 18 }}>{parts.placeDate}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 16 }}>{parts.subject}</div>
      <p style={body}>{parts.salutation}</p>
      {parts.paragraphs.map((para, i) => <p key={i} style={body}>{para}</p>)}
      {parts.closing && <p style={body}>{parts.closing}</p>}
      {parts.signature && <p style={{ ...body, fontWeight: 600, color: '#1d1d1f', textAlign: 'right' as const }}>{parts.signature}</p>}
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

// Bandeau affiché au retour de Stripe
function PaymentBanner({ state, onClose }: { state: PaymentState; onClose: () => void }) {
  const base: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: '12px 16px', marginBottom: 20, fontSize: 14, lineHeight: 1.5 }
  if (state === 'confirming') {
    return (
      <div role="status" style={{ ...base, background: 'rgba(0,113,227,.06)', border: '1px solid rgba(0,113,227,.18)', color: v.text }}>
        <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 3, width: 14, height: 14, border: `2px solid ${v.blue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <span>Paiement reçu, activation de votre compte Premium…</span>
      </div>
    )
  }
  const active = state === 'active'
  return (
    <div role="status" style={{ ...base, background: active ? 'rgba(29,131,72,.07)' : 'rgba(180,83,9,.07)', border: `1px solid ${active ? 'rgba(29,131,72,.25)' : 'rgba(180,83,9,.25)'}`, color: v.text }}>
      <span style={{ flex: 1 }}>
        {active
          ? <><strong>Bienvenue dans Premium ✓</strong> CV illimités, lettre complète et tous les modèles sont débloqués.</>
          : <><strong>Paiement bien reçu.</strong> L&apos;activation prend un peu plus de temps que prévu : rechargez la page dans une minute. En cas de souci, écrivez-nous à dropjob.contact@gmail.com.</>}
      </span>
      <button type="button" onClick={onClose} aria-label="Fermer" style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: v.text2, fontSize: 14, padding: 2 }}>✕</button>
    </div>
  )
}
