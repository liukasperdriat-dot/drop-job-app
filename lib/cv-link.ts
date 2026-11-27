'use client'

import { getApplyUrl } from './apply-url'

// Passage d'une offre vers la page /cv.
//
// La description complète est gardée dans le navigateur (localStorage, 24 h)
// plutôt que dans l'URL : l'adresse reste courte, ce qui permet à un visiteur
// non connecté de passer par la connexion ou l'inscription (même en confirmant
// son e-mail dans un autre onglet), puis par la création de son profil, sans
// perdre l'offre choisie. Elle n'est effacée qu'une fois le CV généré.

const STORAGE_KEY = 'dropjob:pending-cv'
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export type PendingJob = {
  savedAt?: number
  job_id?: string
  title: string
  company: string
  description: string
  applyUrl: string
  location?: string
  contract?: string
  salary?: string
  generated?: boolean   // CV déjà généré pour cette offre
}

export { getApplyUrl }

// Texte d'offre collé dans l'outil « Score ATS » : repris sur /cv après l'inscription
const OFFER_DRAFT_KEY = 'dropjob:offer-draft'

export function saveOfferDraft(description: string) {
  try {
    localStorage.setItem(OFFER_DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), description: description.slice(0, 15000) }))
  } catch {
    // stockage indisponible : l'offre sera à recoller sur /cv
  }
}

// CV collé dans l'outil « Score ATS » : proposé pour le remplissage express du profil
// après l'inscription (gardé 24 h sur l'appareil, effacé une fois utilisé)
const CV_DRAFT_KEY = 'dropjob:cv-draft'

export function saveCvDraft(text: string) {
  try {
    localStorage.setItem(CV_DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), text: text.slice(0, 15000) }))
  } catch {
    // stockage indisponible : le CV sera à recoller dans le profil
  }
}

export function peekCvDraft(): string {
  try {
    const raw = localStorage.getItem(CV_DRAFT_KEY)
    if (!raw) return ''
    const draft = JSON.parse(raw) as { savedAt?: number; text?: string }
    if (!draft.savedAt || Date.now() - draft.savedAt > MAX_AGE_MS) return ''
    return draft.text || ''
  } catch {
    return ''
  }
}

export function clearCvDraft() {
  try { localStorage.removeItem(CV_DRAFT_KEY) } catch { /* stockage indisponible */ }
}

export function peekOfferDraft(): string {
  try {
    const raw = localStorage.getItem(OFFER_DRAFT_KEY)
    if (!raw) return ''
    const draft = JSON.parse(raw) as { savedAt?: number; description?: string }
    if (!draft.savedAt || Date.now() - draft.savedAt > MAX_AGE_MS) return ''
    return draft.description || ''
  } catch {
    return ''
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openCvForJob(job: any, navigate: (url: string) => void = url => { window.location.href = url }) {
  const pending: PendingJob = {
    savedAt: Date.now(),
    job_id: job.id ? String(job.id) : undefined,
    title: job.title || '',
    company: job.company || '',
    description: job.description || '',
    applyUrl: getApplyUrl(job),
    location: job.location || '',
    contract: job.contract || '',
    salary: job.salary || '',
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
  } catch {
    // stockage indisponible (navigation privée stricte) : la description sera à coller à la main
  }
  navigate(cvUrlFor(pending))
}

// Adresse de la page /cv pour une offre (identifiant, poste et entreprise)
export function cvUrlFor(job: Pick<PendingJob, 'job_id' | 'title' | 'company'>): string {
  const params = new URLSearchParams({ title: job.title, company: job.company })
  if (job.job_id) params.set('jobId', job.job_id)
  return `/cv?${params}`
}

function readPending(): PendingJob | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const pending = JSON.parse(raw) as PendingJob
    if (!pending.savedAt || Date.now() - pending.savedAt > MAX_AGE_MS) return null
    if (!pending.title) return null
    return pending
  } catch {
    return null
  }
}

// Offre choisie il y a moins de 24 h et dont le CV n'a pas encore été généré
// (utilisée par /profile pour renvoyer le nouvel utilisateur vers son CV)
export function peekAnyPendingJob(): PendingJob | null {
  const pending = readPending()
  return pending && !pending.generated ? pending : null
}

// Lit l'offre en attente (sans l'effacer) si elle correspond à l'offre affichée :
// même identifiant quand l'adresse en donne un, sinon même poste et entreprise.
// Une offre déjà utilisée reste lisible : revenir sur /cv (après une
// modification du profil par exemple) ne fait pas perdre sa description.
export function peekPendingJob(title: string, company: string, jobId?: string | null): PendingJob | null {
  const pending = readPending()
  if (!pending) return null
  if (jobId && pending.job_id) return pending.job_id === jobId ? pending : null
  if (pending.title !== title || pending.company !== company) return null
  return pending
}

// CV généré pour l'offre en attente : on ne la propose plus après le profil
export function markPendingJobGenerated() {
  const pending = readPending()
  if (!pending) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...pending, generated: true }))
  } catch {
    // stockage indisponible : rien à mettre à jour
  }
}
