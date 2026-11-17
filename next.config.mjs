// Anciennes pages « /jobs/{métier}-{ville} » (déjà indexées par Google) :
// redirection permanente vers les nouvelles pages « /offres/{métier}/{ville} »,
// pour transmettre leur référencement sans créer de contenu en double.
const ANCIENS_METIERS = {
  developpeur: 'developpeur-web',
  commercial: 'commercial',
  marketing: 'charge-de-marketing',
  comptable: 'comptable',
  infirmier: 'infirmier',
  chauffeur: 'chauffeur-livreur',
  vendeur: 'vendeur',
  assistant: 'assistant-administratif',
  ingenieur: 'ingenieur',
  alternance: 'alternance',
}
const ANCIENNES_VILLES = ['paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'nantes', 'strasbourg', 'lille', 'rennes', 'montpellier']

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Les erreurs TypeScript bloquent de nouveau la mise en ligne :
  // un code qui ne compile pas ne peut plus partir en production.
  // (Le lint se lance avec `npm run lint` ; Next.js 16 ne le lance plus au build.)

  async redirects() {
    return Object.entries(ANCIENS_METIERS).flatMap(([ancien, nouveau]) =>
      ANCIENNES_VILLES.map(ville => ({
        source: `/jobs/${ancien}-${ville}`,
        destination: `/offres/${nouveau}/${ville}`,
        permanent: true,
      }))
    )
  },
}

export default nextConfig
