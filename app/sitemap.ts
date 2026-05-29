import { MetadataRoute } from 'next'

const BASE = 'https://drop-job.fr'

const METIERS = ['developpeur', 'commercial', 'marketing', 'comptable', 'infirmier', 'chauffeur', 'vendeur', 'assistant', 'ingenieur', 'alternance']
const VILLES  = ['paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'nantes', 'strasbourg', 'lille', 'rennes', 'montpellier']

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/jobs`,                        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/legal/cgu`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/mentions-legales`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/confidentialite`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const seoRoutes: MetadataRoute.Sitemap = METIERS.flatMap(metier =>
    VILLES.map(ville => ({
      url: `${BASE}/jobs/${metier}-${ville}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))
  )

  return [...staticRoutes, ...seoRoutes]
}
