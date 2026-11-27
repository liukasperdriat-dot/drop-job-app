import { MetadataRoute } from 'next'
import { METIERS, VILLES, offresPath, modelePath } from '@/lib/seo-catalog'
import { MODELES_CV } from '@/lib/cv-modeles'

// Même domaine que le site (drop-job.fr redirige vers www)
const BASE = 'https://www.drop-job.fr'

// Dates de dernière modification STABLES : Google ignore un lastmod qui change
// à chaque lecture du sitemap. Mettre à jour la date quand le contenu change.
const CONTENU_MIS_A_JOUR = new Date('2026-11-27')
const PAGES_LEGALES_MISES_A_JOUR = new Date('2026-11-27')

export default function sitemap(): MetadataRoute.Sitemap {

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                             lastModified: CONTENU_MIS_A_JOUR, changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/jobs`,                   lastModified: CONTENU_MIS_A_JOUR, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/score-ats`,              lastModified: CONTENU_MIS_A_JOUR, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/modeles-cv`,             lastModified: CONTENU_MIS_A_JOUR, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/offres`,                 lastModified: CONTENU_MIS_A_JOUR, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/pricing`,                lastModified: CONTENU_MIS_A_JOUR, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/legal/cgu`,              lastModified: PAGES_LEGALES_MISES_A_JOUR, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/mentions-legales`, lastModified: PAGES_LEGALES_MISES_A_JOUR, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/confidentialite`,  lastModified: PAGES_LEGALES_MISES_A_JOUR, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const modeles: MetadataRoute.Sitemap = MODELES_CV.map(m => ({
    url: `${BASE}${modelePath(m.slug)}`,
    lastModified: CONTENU_MIS_A_JOUR,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Toutes les combinaisons métier × ville (les grandes villes, en tête du catalogue, en priorité).
  // Pas de lastModified : leurs offres changent toutes les heures, aucune date ne serait fiable.
  const offres: MetadataRoute.Sitemap = METIERS.flatMap(m =>
    VILLES.map((v, i) => ({
      url: `${BASE}${offresPath(m.slug, v.slug)}`,
      changeFrequency: 'daily' as const,
      priority: i < 6 ? 0.8 : 0.6,
    }))
  )

  return [...staticRoutes, ...modeles, ...offres]
}
