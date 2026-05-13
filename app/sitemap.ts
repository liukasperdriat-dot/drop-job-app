import { MetadataRoute } from 'next'

const BASE = 'https://drop-job.fr'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/jobs`,                        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/legal/cgu`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/mentions-legales`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/confidentialite`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]
}
