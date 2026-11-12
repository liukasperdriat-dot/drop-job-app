'use client'

// Passage d'une offre vers la page /cv.
//
// La description complète est gardée dans le navigateur (localStorage, 1 h)
// plutôt que dans l'URL : l'adresse reste courte, ce qui permet à un visiteur
// non connecté de passer par la connexion ou l'inscription (même en confirmant
// son e-mail dans un autre onglet) sans perdre l'offre choisie.

const STORAGE_KEY = 'dropjob:pending-cv'
const MAX_AGE_MS = 60 * 60 * 1000

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
}

export function getApplyUrl(job: { source?: string; id?: string; url?: string; redirect_url?: string }): string {
  const src = (job.source || '').toLowerCase()
  if (src.includes('adzuna')) return job.redirect_url || job.url || ''
  if (src.includes('francetravail') || src.includes('france travail')) {
    return `https://candidat.francetravail.fr/offres/recherche/detail/${job.id}`
  }
  return ''
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
  const params = new URLSearchParams({ title: pending.title, company: pending.company })
  navigate(`/cv?${params}`)
}

// Lit (et consomme) l'offre en attente, si elle correspond au poste affiché.
export function takePendingJob(title: string, company: string): PendingJob | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const pending = JSON.parse(raw) as PendingJob
    if (!pending.savedAt || Date.now() - pending.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    if (pending.title !== title || pending.company !== company) return null
    localStorage.removeItem(STORAGE_KEY)
    return pending
  } catch {
    return null
  }
}
