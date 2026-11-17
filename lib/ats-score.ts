// Estimation du score ATS (logiciels de tri des candidatures) d'un CV pour une offre.
//
// Analyse locale, sans IA ni stockage : les mots-clés importants de l'offre
// (compétences connues, termes répétés) sont recherchés dans le CV, puis la
// structure du CV est contrôlée (coordonnées, sections, longueur).
// Score = 85 % mots-clés + 15 % structure.

export type AtsResult = {
  score: number                 // 0 à 100
  keywordScore: number          // part « mots-clés » sur 100
  matched: string[]             // mots-clés de l'offre présents dans le CV
  missing: string[]             // mots-clés absents du CV, les plus critiques d'abord (15 max)
  checks: { label: string; ok: boolean }[]
  totalKeywords: number
}

// Mots vides et vocabulaire générique des annonces (sans accents, en minuscules)
const STOPWORDS = new Set(`
a au aux avec ce ces cet cette dans de des du elle elles en et etre eux il ils je la le les leur leurs lui ma mais me meme mes moi mon ne nos notre nous on ou par pas pour qu que qui sa se ses son sur ta te tes toi ton tu un une vos votre vous y
ainsi alors apres aussi autre autres avant avoir bien car chaque chez comme comment dont donc deja encore entre est etes etait faire fait font ici jamais jusqu lors moins non ont parmi peu peut peuvent plus plusieurs pourra pourrez pouvez quand quel quelle quelles quels sans selon sera serez seront si sont sous souhaite souhaitee souhaitez tant tous tout toute toutes tres via voir vers
the and for with you your our are will this that from have has job work team role
poste postes profil profils candidat candidate candidats candidature candidatures entreprise entreprises societe societes mission missions offre offres emploi emplois recherche recherchons recrute recrutons recrutement rejoindre rejoignez rejoins
h f hf cdi cdd interim contrat contrats salaire salaires remuneration avantages avantage prime primes ticket tickets restaurant mutuelle heure heures hebdomadaire hebdo semaine semaines mois annee annees an ans jour jours horaire horaires temps plein partiel
lieu travail localisation adresse ville region france secteur domaine activite activites groupe client clients service services equipe equipes
etc niveau minimum maximum idealement eventuellement notamment egalement afin cadre sein ensemble differents differentes principales principaux principal principale suivantes suivants
experience experiences exige exigee exigees exiges requis requise requises demande demandee demandees debutant debutants accepte acceptee formation formations diplome diplomes souhaitable apprecie appreciee
vous etes serez aurez savez avez aimez maitrisez disposez possedez assurerez participerez serait seriez
`.split(/\s+/).filter(Boolean))

// Compétences et expressions fréquentes dans les offres françaises (forme normalisée → libellé)
const SKILLS: Record<string, string> = {
  'permis b': 'Permis B', 'permis c': 'Permis C', 'permis ce': 'Permis CE', 'caces': 'CACES', 'fimo': 'FIMO', 'fco': 'FCO',
  'pack office': 'Pack Office', 'excel': 'Excel', 'word': 'Word', 'powerpoint': 'PowerPoint', 'outlook': 'Outlook',
  'sap': 'SAP', 'erp': 'ERP', 'crm': 'CRM', 'salesforce': 'Salesforce', 'hubspot': 'HubSpot', 'sage': 'Sage', 'cegid': 'Cegid',
  'haccp': 'HACCP', 'sst': 'SST', 'ssiap': 'SSIAP', 'cnaps': 'CNAPS', 'habilitation electrique': 'Habilitation électrique',
  'anglais': 'Anglais', 'espagnol': 'Espagnol', 'allemand': 'Allemand', 'italien': 'Italien',
  'relation client': 'Relation client', 'service client': 'Service client', 'satisfaction client': 'Satisfaction client',
  'gestion des stocks': 'Gestion des stocks', 'gestion de stock': 'Gestion des stocks', 'inventaire': 'Inventaire',
  'encaissement': 'Encaissement', 'merchandising': 'Merchandising', 'prospection': 'Prospection', 'negociation': 'Négociation',
  'fidelisation': 'Fidélisation', 'vente': 'Vente', 'conseil': 'Conseil', 'accueil': 'Accueil',
  'logistique': 'Logistique', 'manutention': 'Manutention', 'preparation de commandes': 'Préparation de commandes', 'picking': 'Picking',
  'transpalette': 'Transpalette', 'chariot elevateur': 'Chariot élévateur',
  'comptabilite': 'Comptabilité', 'paie': 'Paie', 'bilan': 'Bilan', 'fiscalite': 'Fiscalité', 'tva': 'TVA', 'facturation': 'Facturation',
  'javascript': 'JavaScript', 'typescript': 'TypeScript', 'react': 'React', 'angular': 'Angular', 'vue': 'Vue.js', 'node': 'Node.js',
  'python': 'Python', 'java': 'Java', 'php': 'PHP', 'symfony': 'Symfony', 'laravel': 'Laravel', 'sql': 'SQL', 'git': 'Git',
  'docker': 'Docker', 'kubernetes': 'Kubernetes', 'aws': 'AWS', 'azure': 'Azure', 'html': 'HTML', 'css': 'CSS', 'api': 'API',
  'seo': 'SEO', 'google ads': 'Google Ads', 'google analytics': 'Google Analytics', 'reseaux sociaux': 'Réseaux sociaux',
  'soins': 'Soins', 'diplome d etat': "Diplôme d'État", 'hygiene': 'Hygiène', 'securite': 'Sécurité',
  'travail en equipe': 'Travail en équipe', 'autonomie': 'Autonomie', 'rigueur': 'Rigueur', 'organisation': 'Organisation',
  'ponctualite': 'Ponctualité', 'polyvalence': 'Polyvalence', 'dynamisme': 'Dynamisme', 'communication': 'Communication',
  'sens du service': 'Sens du service', 'gestion de projet': 'Gestion de projet', 'management': 'Management', 'reporting': 'Reporting',
}

// Mots de 2 lettres qui restent des compétences
const SHORT_SKILLS = new Set(['rh', 'ux', 'ui', 'ia', 'qa', 'bi', 'c#'])

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    // Mots composés gardés entiers (« prêt-à-porter » → « pretaporter »)
    .replace(/([a-z0-9])-(?=[a-z0-9])/g, '$1')
    .replace(/['’`]/g, ' ')
    .replace(/[^a-z0-9+#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Racine simple : pluriels et féminins ramenés à une même forme
// (« vendeuses » → « vendeur », « infirmières » → « infirmier », « commerciale » → « commercial »)
function stem(word: string): string {
  if (word.length <= 4) return word
  return word
    .replace(/[sx]$/, '')
    .replace(/euse$/, 'eur').replace(/rice$/, 'eur').replace(/iere$/, 'ier').replace(/ive$/, 'if').replace(/enne$/, 'en')
    .replace(/e$/, '')
}

function tokens(normalized: string): string[] {
  return normalized.split(' ').filter(w =>
    (w.length >= 3 || SHORT_SKILLS.has(w)) && !/^\d+$/.test(w) && !STOPWORDS.has(w)
  )
}

// Libellé lisible d'un mot de l'offre (première forme rencontrée, avec accents)
function originalForms(text: string): Map<string, string> {
  const forms = new Map<string, string>()
  for (const raw of text.split(/[^\p{L}\p{N}+#-]+/u)) {
    if (!raw) continue
    const n = normalize(raw)
    if (!n || n.includes(' ')) continue
    const key = stem(n)
    if (!forms.has(key)) forms.set(key, raw.toLowerCase())
  }
  return forms
}

const hasPhrase = (haystack: string, phrase: string) => (` ${haystack} `).includes(` ${phrase} `)

export function analyzeAts(cvText: string, offerText: string): AtsResult {
  const cv = normalize(cvText)
  const offer = normalize(offerText)
  const cvStems = new Set(tokens(cv).map(stem))

  type Kw = { key: string; label: string; weight: number; found: boolean; skill: boolean }
  const keywords = new Map<string, Kw>()
  const covered = new Set<string>() // racines déjà comprises dans une expression

  // 1. Compétences connues présentes dans l'offre (poids fort)
  for (const [phrase, label] of Object.entries(SKILLS)) {
    if (!hasPhrase(offer, phrase)) continue
    if ([...keywords.values()].some(k => k.label === label)) continue
    const count = ` ${offer} `.split(` ${phrase} `).length - 1
    const words = phrase.split(' ')
    const found = hasPhrase(cv, phrase) || (words.length > 1 && words.filter(w => !STOPWORDS.has(w) && w.length > 2).every(w => cvStems.has(stem(w))))
    keywords.set(`skill:${phrase}`, { key: phrase, label, weight: 3 + Math.min(count, 3), found, skill: true })
    words.forEach(w => covered.add(stem(w)))
  }

  // 2. Termes répétés de l'offre (au moins 2 fois), hors mots génériques
  const freq = new Map<string, number>()
  for (const w of tokens(offer)) {
    const s = stem(w)
    if (covered.has(s)) continue
    freq.set(s, (freq.get(s) || 0) + 1)
  }
  const forms = originalForms(offerText)
  ;[...freq.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([s, n]) => {
      keywords.set(`word:${s}`, { key: s, label: forms.get(s) || s, weight: Math.min(n, 4), found: cvStems.has(s), skill: false })
    })

  // Offre très courte : on retient aussi les termes cités une fois
  if (keywords.size < 6) {
    [...freq.entries()]
      .filter(([s, n]) => n === 1 && !keywords.has(`word:${s}`) && s.length >= 4)
      .slice(0, 10 - keywords.size)
      .forEach(([s]) => keywords.set(`word:${s}`, { key: s, label: forms.get(s) || s, weight: 1, found: cvStems.has(s), skill: false }))
  }

  const list = [...keywords.values()].sort((a, b) => b.weight - a.weight).slice(0, 25)
  const total = list.reduce((sum, k) => sum + k.weight, 0)
  const got = list.filter(k => k.found).reduce((sum, k) => sum + k.weight, 0)
  const keywordScore = total ? Math.round((got / total) * 100) : 0

  // 3. Structure du CV
  const words = cv.split(' ').filter(Boolean).length
  const checks = [
    { label: 'Adresse e-mail présente', ok: /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(cvText) },
    { label: 'Numéro de téléphone présent', ok: /(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}/.test(cvText) },
    { label: 'Section « Expérience »', ok: /experience|parcours professionnel|emplois? occupes?/.test(cv) },
    { label: 'Section « Formation »', ok: /formation|diplome|etudes|education/.test(cv) },
    { label: 'Section « Compétences »', ok: /competence|savoir faire|skills|aptitudes/.test(cv) },
    { label: 'Longueur adaptée (150 à 900 mots)', ok: words >= 150 && words <= 900 },
  ]
  const structureScore = Math.round((checks.filter(c => c.ok).length / checks.length) * 100)

  return {
    score: Math.round(keywordScore * 0.85 + structureScore * 0.15),
    keywordScore,
    matched: list.filter(k => k.found).map(k => k.label).slice(0, 12),
    // Mots-clés critiques : compétences connues d'abord, puis les plus répétés
    missing: list.filter(k => !k.found).sort((a, b) => Number(b.skill) - Number(a.skill) || b.weight - a.weight).map(k => k.label).slice(0, 15),
    checks,
    totalKeywords: list.length,
  }
}
