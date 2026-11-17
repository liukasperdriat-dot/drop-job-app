// Lien de candidature officiel d'une offre (utilisable côté serveur et navigateur)
export function getApplyUrl(job: { source?: string; id?: string; url?: string; redirect_url?: string }): string {
  const src = (job.source || '').toLowerCase()
  if (src.includes('adzuna')) return job.redirect_url || job.url || ''
  if (src.includes('francetravail') || src.includes('france travail')) {
    return `https://candidat.francetravail.fr/offres/recherche/detail/${job.id}`
  }
  return ''
}
