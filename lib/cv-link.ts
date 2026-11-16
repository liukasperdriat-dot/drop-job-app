'use client'

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
