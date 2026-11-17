// Catalogue des pages SEO : métiers et villes des pages « Offres » et « Modèles de CV ».
// Fichier sans dépendance (utilisable côté serveur, navigateur et sitemap).

export type Metier = {
  slug: string
  label: string        // « Préparateur de commandes »
  keyword: string      // mots-clés envoyés à la recherche d'offres
  hasCvModel: boolean  // une page /modeles-cv/[slug] existe
}

export const METIERS: Metier[] = [
  { slug: 'vendeur',                  label: 'Vendeur',                  keyword: 'vendeur',                  hasCvModel: true },
  { slug: 'preparateur-de-commandes', label: 'Préparateur de commandes', keyword: 'préparateur de commandes', hasCvModel: true },
  { slug: 'developpeur-web',          label: 'Développeur web',          keyword: 'développeur web',          hasCvModel: true },
  { slug: 'infirmier',                label: 'Infirmier',                keyword: 'infirmier',                hasCvModel: true },
  { slug: 'commercial',               label: 'Commercial',               keyword: 'commercial',               hasCvModel: true },
  { slug: 'comptable',                label: 'Comptable',                keyword: 'comptable',                hasCvModel: true },
  { slug: 'serveur',                  label: 'Serveur',                  keyword: 'serveur',                  hasCvModel: true },
  { slug: 'aide-soignant',            label: 'Aide-soignant',            keyword: 'aide-soignant',            hasCvModel: true },
  { slug: 'cuisinier',                label: 'Cuisinier',                keyword: 'cuisinier',                hasCvModel: true },
  { slug: 'agent-d-entretien',        label: "Agent d'entretien",        keyword: "agent d'entretien",        hasCvModel: true },
  { slug: 'chauffeur-livreur',        label: 'Chauffeur-livreur',        keyword: 'chauffeur livreur',        hasCvModel: true },
  { slug: 'assistant-administratif',  label: 'Assistant administratif',  keyword: 'assistant administratif',  hasCvModel: true },
  { slug: 'caissier',                 label: 'Caissier',                 keyword: 'caissier',                 hasCvModel: true },
  { slug: 'cariste',                  label: 'Cariste',                  keyword: 'cariste',                  hasCvModel: true },
  { slug: 'electricien',              label: 'Électricien',              keyword: 'électricien',              hasCvModel: true },
  { slug: 'auxiliaire-de-vie',        label: 'Auxiliaire de vie',        keyword: 'auxiliaire de vie',        hasCvModel: true },
  { slug: 'agent-de-securite',        label: 'Agent de sécurité',        keyword: 'agent de sécurité',        hasCvModel: true },
  { slug: 'conseiller-clientele',     label: 'Conseiller clientèle',     keyword: 'conseiller clientèle',     hasCvModel: true },
  { slug: 'charge-de-marketing',      label: 'Chargé de marketing',      keyword: 'marketing',                hasCvModel: true },
  { slug: 'manutentionnaire',         label: 'Manutentionnaire',         keyword: 'manutentionnaire',         hasCvModel: true },
  // Pages « Offres » uniquement (reprises des anciennes pages /jobs/…)
  { slug: 'ingenieur',                label: 'Ingénieur',                keyword: 'ingénieur',                hasCvModel: false },
  { slug: 'alternance',               label: 'Alternance',               keyword: 'alternance',               hasCvModel: false },
]

export type Ville = { slug: string; label: string }

export const VILLES: Ville[] = [
  { slug: 'paris',       label: 'Paris' },
  { slug: 'marseille',   label: 'Marseille' },
  { slug: 'lyon',        label: 'Lyon' },
  { slug: 'toulouse',    label: 'Toulouse' },
  { slug: 'nice',        label: 'Nice' },
  { slug: 'nantes',      label: 'Nantes' },
  { slug: 'montpellier', label: 'Montpellier' },
  { slug: 'strasbourg',  label: 'Strasbourg' },
  { slug: 'bordeaux',    label: 'Bordeaux' },
  { slug: 'lille',       label: 'Lille' },
  { slug: 'rennes',      label: 'Rennes' },
  { slug: 'toulon',      label: 'Toulon' },
  { slug: 'reims',       label: 'Reims' },
  { slug: 'grenoble',    label: 'Grenoble' },
  { slug: 'rouen',       label: 'Rouen' },
]

export function findMetier(slug: string): Metier | undefined {
  return METIERS.find(m => m.slug === slug)
}

export function findVille(slug: string): Ville | undefined {
  return VILLES.find(v => v.slug === slug)
}

export const offresPath = (metier: string, ville: string) => `/offres/${metier}/${ville}`
export const modelePath = (metier: string) => `/modeles-cv/${metier}`

// Grandes villes mises en avant (pied de page, pages métier)
export const TOP_VILLES = VILLES.slice(0, 6)
