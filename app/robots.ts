import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Pages privées (compte connecté) et API : rien à indexer
      disallow: ['/api/', '/auth/', '/dashboard', '/profile', '/cv', '/offline'],
    },
    sitemap: 'https://www.drop-job.fr/sitemap.xml',
  }
}
