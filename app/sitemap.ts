import { MetadataRoute } from 'next'
import { METIERS, VILLES, offresPath, modelePath } from '@/lib/seo-catalog'
import { MODELES_CV } from '@/lib/cv-modeles'

// Même domaine que le site (drop-job.fr redirige vers www)
const BASE = 'https://www.drop-job.fr'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                             lastModified: now, changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/jobs`,                   lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/score-ats`,              lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/modeles-cv`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/offres`,                 lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/legal/cgu`,              lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/mentions-legales`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/confidentialite`,  lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const modeles: MetadataRoute.Sitemap = MODELES_CV.map(m => ({
    url: `${BASE}${modelePath(m.slug)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Toutes les combinaisons métier × ville (les grandes villes, en tête du catalogue, en priorité)
  const offres: MetadataRoute.Sitemap = METIERS.flatMap(m =>
    VILLES.map((v, i) => ({
      url: `${BASE}${offresPath(m.slug, v.slug)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: i < 6 ? 0.8 : 0.6,
    }))
  )

  return [...staticRoutes, ...modeles, ...offres]
}
