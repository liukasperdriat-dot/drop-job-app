import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { GET as searchJobsRoute } from '@/app/api/jobs/route'
import { getApplyUrl } from '@/lib/apply-url'

// Offres d'une page SEO « métier × ville », rendues côté serveur.
// La recherche réutilise exactement la logique de /api/jobs (France Travail +
// Adzuna), appelée directement sans requête HTTP, et le résultat est mis en
// cache 1 h (pages régénérées en arrière-plan).

export type PageJob = {
  id: string
  title: string
  company: string
  location: string
  contract: string
  salary: string
  salaryMin: number | null   // brut annuel, en euros
  salaryMax: number | null
  source: string
  description: string
  applyUrl: string
  debutant: boolean
  diploma: string
}

type RawJob = Record<string, unknown>

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null)

function toPageJob(j: RawJob): PageJob {
  return {
    id: str(j.id),
    title: str(j.title),
    company: str(j.company),
    location: str(j.location),
    contract: str(j.contract),
    salary: str(j.salary),
    salaryMin: num(j.salaryMin),
    salaryMax: num(j.salaryMax),
    source: str(j.source),
    // Description raccourcie : suffisante pour l'aperçu et la génération du CV
    description: str(j.description).slice(0, 4000),
    applyUrl: getApplyUrl({ source: str(j.source), id: str(j.id), url: str(j.url), redirect_url: str(j.redirect_url) }),
    debutant: j.debutant === true,
    diploma: str(j.diploma),
  }
}

async function loadJobs(keyword: string, location: string): Promise<PageJob[]> {
  const params = new URLSearchParams({ keyword, location, source: 'tout' })
  const res = await searchJobsRoute(new Request(`http://localhost/api/jobs?${params}`))
  const data = (await res.json()) as { jobs?: RawJob[]; error?: string }
  const jobs = (data.jobs || []).map(toPageJob).filter(j => j.title)
  // Aucune offre à cause d'une panne : on lève une erreur pour ne pas mettre
  // ce résultat vide en cache (la page affiche alors un lien vers la recherche)
  if (jobs.length === 0 && data.error) throw new Error(data.error)
  return jobs
}

const cachedJobs = unstable_cache(loadJobs, ['offres-metier-ville-v2'], { revalidate: 3600 })

// cache() : generateMetadata et la page partagent le même résultat pendant un rendu
export const getJobsForPage = cache(async (keyword: string, location: string): Promise<{ jobs: PageJob[]; failed: boolean }> => {
  try {
    return { jobs: await cachedJobs(keyword, location), failed: false }
  } catch (err) {
    console.error('[offres] recherche impossible:', err instanceof Error ? err.message : err)
    return { jobs: [], failed: true }
  }
})
