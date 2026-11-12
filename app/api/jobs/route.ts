import { NextResponse } from 'next/server'
import { NIVEAUX } from '@/lib/niveaux'
import { DEPARTEMENTS } from '@/lib/departements'

export const dynamic = 'force-dynamic'

// France Travail allows only ONE active token per client_id at a time.
// Two concurrent requests both seeing cachedToken=null would each fetch a new
// token, with the second invalidating the first → 401. The inflight promise
// deduplicates concurrent fetches so only one token is ever requested at once.
let cachedToken: string | null = null
let tokenExpiresAt = 0
let inflightFetch: Promise<string> | null = null

async function fetchNewToken(): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  const rawBody = `grant_type=client_credentials&client_id=${process.env.FRANCE_TRAVAIL_CLIENT_ID}&client_secret=${process.env.FRANCE_TRAVAIL_CLIENT_SECRET}&scope=api_offresdemploiv2+o2dsoffre`
  let res: Response
  try {
    res = await fetch(
      'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: rawBody,
        cache: 'no-store',
        signal: controller.signal,
      }
    )
  } catch (err: any) {
    throw new Error(`Token fetch failed: ${err.name === 'AbortError' ? 'timeout 5s' : err.message}`)
  } finally {
    clearTimeout(timeout)
  }
  console.log('[FT] token response status:', res.status)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Token HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token missing in response: ${JSON.stringify(data).slice(0, 200)}`)
  cachedToken = data.access_token
  tokenExpiresAt = Date.now() + data.expires_in * 1000
  console.log('[FT] token refreshed, expires in', data.expires_in, 's')
  return cachedToken!
}

function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return Promise.resolve(cachedToken)
  }
  // Reuse the inflight fetch if one is already running
  if (!inflightFetch) {
    inflightFetch = fetchNewToken().finally(() => { inflightFetch = null })
  }
  return inflightFetch
}

function invalidateToken() {
  cachedToken = null
  tokenExpiresAt = 0
  // Do NOT reset inflightFetch: if another concurrent request is already fetching
  // a new token, clearing inflightFetch would let this request start a competing
  // fetch. France Travail allows only one active token per client_id — two
  // concurrent fetches would each invalidate the other → cascading 401 loop.
}

// ─────────────────────────────────────────────────────────────────────────────

// ── Jobs results cache (5 min TTL) ───────────────────────────────────────
const CACHE_TTL    = 300_000
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
const jobsCache    = new Map<string, { jobs: any[]; note?: string; expiresAt: number }>()

// Tous les paramètres qui changent les résultats doivent faire partie de la clé
function buildCacheKey(...parts: (string | number | null)[]) {
  return parts.map(p => p ?? '').join('|')
}

// Salaire annuel en euros passé dans l'URL (ex. "40000") → nombre, ou null
function parseSalary(v: string): number | null {
  const n = parseInt(v, 10)
  return Number.isFinite(n) && n > 0 && n < 1_000_000 ? n : null
}

// ─────────────────────────────────────────────────────────────────────────────

// Codes INSEE des grandes villes : évite tout appel réseau pour les recherches
// les plus fréquentes (et pour les pages /jobs/[métier]-[ville]).
const INSEE_CONNUS: Record<string, string> = {
  paris: '75056', marseille: '13055', lyon: '69123', toulouse: '31555', nice: '06088',
  nantes: '44109', montpellier: '34172', strasbourg: '67482', bordeaux: '33063', lille: '59350',
  rennes: '35238', reims: '51454', toulon: '83137', 'saint-etienne': '42218', 'le havre': '76351',
  grenoble: '38185', dijon: '21231', angers: '49007', nimes: '30189', villeurbanne: '69266',
  'clermont-ferrand': '63113', 'aix-en-provence': '13001', brest: '29019', tours: '37261',
  amiens: '80021', limoges: '87085', perpignan: '66136', metz: '57463', besancon: '25056',
  orleans: '45234', rouen: '76540', mulhouse: '68224', caen: '14118', nancy: '54395',
}

function normalizeCity(name: string): string {
  return name.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')
}

// Warm in-memory cache: avoids hitting geo API on repeated city lookups within the same worker
const inseeCache = new Map<string, string>()

async function fetchInsee(cityName: string, timeoutMs: number): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cityName)}&limit=1&fields=code,nom,departement&boost=population`,
      { cache: 'no-store', signal: controller.signal }
    )
    if (!res.ok) {
      console.warn('[geo] resolve HTTP', res.status, 'for city:', cityName)
      return null
    }
    const data = await res.json()
    return data[0]?.code ?? null
  } finally {
    clearTimeout(timeout)
  }
}

async function resolveInseeCode(cityName: string): Promise<string | null> {
  const key = normalizeCity(cityName)
  if (INSEE_CONNUS[key]) return INSEE_CONNUS[key]
  if (inseeCache.has(key)) return inseeCache.get(key)!

  // Deux tentatives : le service de l'État est parfois lent.
  for (const timeoutMs of [4000, 4000]) {
    try {
      const code = await fetchInsee(cityName, timeoutMs)
      if (code) inseeCache.set(key, code)
      else console.warn('[geo] no INSEE result for city:', cityName)
      return code
    } catch (err) {
      const e = err as Error
      console.warn('[geo] resolve error:', e.name === 'AbortError' ? `timeout ${timeoutMs}ms` : e.message, '— city:', cityName)
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────

// Lyon, Marseille et Paris ont des codes INSEE "chapeau" que France Travail
// rejette (400). On mappe vers le code du 1er arrondissement, qui est accepté
// et inclut les offres de toute la commune via le paramètre distance.
const COMMUNES_ARRONDISSEMENTS: Record<string, string> = {
  '69123': '69381', // Lyon → Lyon 1er
  '13055': '13201', // Marseille → Marseille 1er
  '75056': '75101', // Paris → Paris 1er
}

// Majuscule au début de chaque mot, lettres accentuées comprises
// (« prêt-à-porter » → « Prêt-À-Porter », et non « PrêT-à-Porter »)
const WORD_START = new RegExp('(^|[^\\p{L}\\p{N}])(\\p{L})', 'gu')

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(WORD_START, (_, sep: string, c: string) => sep + c.toUpperCase())
}

const HEURES_PAR_AN = 1607 // temps plein légal (35 h)

// Convertit le libellé France Travail en salaire annuel brut (euros).
// Ex. « Mensuel de 2000.0 Euros à 2500.0 Euros sur 12 mois » → { min: 24000, max: 30000 }
function parseSalaireFT(libelle: string): { min: number; max: number | null } | null {
  if (!libelle) return null
  const match = libelle.match(/(\d+(?:[.,]\d+)?)\s*Euros?\s*(?:à\s*(\d+(?:[.,]\d+)?)\s*Euros?)?/i)
  if (!match) return null
  const lower = libelle.toLowerCase()
  const toAnnual = (v: number) => {
    if (lower.includes('horaire')) return v * HEURES_PAR_AN
    if (lower.includes('annuel')) return v
    // « Mensuel » : un montant supérieur à 10 000 € est en réalité un salaire annuel mal saisi
    return v > 10_000 ? v : v * 12
  }
  const min = toAnnual(parseFloat(match[1].replace(',', '.')))
  const max = match[2] ? toAnnual(parseFloat(match[2].replace(',', '.'))) : null
  return min > 0 ? { min, max } : null
}

function formatSalaryRange(min: number | null, max: number | null): string {
  const a = min ? Math.round(min / 1000) : null
  const b = max ? Math.round(max / 1000) : null
  if (a && b && a !== b) return `${a}k€ — ${b}k€ / an`
  if (a) return `${a}k€ / an`
  if (b) return `${b}k€ / an`
  return 'Salaire NC'
}

// ── Niveau de diplôme ──────────────────────────────────────────────────────
// Échelle commune au filtre et aux badges : 0 sans diplôme … 5 Bac+5 et plus (lib/niveaux.ts)

function niveauRank(libelle: string | undefined): number | null {
  const l = (libelle || '').toLowerCase()
  if (!l) return null
  if (l.includes('bac+5')) return 5
  if (l.includes('bac+3') || l.includes('bac+4')) return 4
  if (l.includes('bac+2')) return 3
  if (l.includes('cap') || l.includes('bep')) return 1
  if (l.includes('aucune')) return 0
  if (l.includes('bac')) return 2
  return null
}

// Résume les formations d'une offre France Travail :
// - niveau le plus élevé indiqué, qu'il soit exigé OU souhaité (sert au filtre
//   « jusqu'à mon niveau » : une offre « Bac+2 souhaité » n'apparaît pas pour un Bac)
// - libellé court pour le badge, sur ce même niveau (« Bac+2 exigé », « Bac souhaité »)
function summarizeDiploma(formations: any[] | undefined) {
  const list = (formations || [])
    .map(f => ({ rank: niveauRank(f.niveauLibelle), required: f.exigence === 'E' }))
    .filter((f): f is { rank: number; required: boolean } => f.rank !== null)
  if (!list.length) return { diplomaRank: null, diploma: null }
  const rank = Math.max(...list.map(f => f.rank))
  const required = list.some(f => f.rank === rank && f.required)
  return { diplomaRank: rank, diploma: `${NIVEAUX[rank]} ${required ? 'exigé' : 'souhaité'}` }
}

function mapJob(j: any) {
  const sal = parseSalaireFT(j.salaire?.libelle || '')
  return {
    ...summarizeDiploma(j.formations),
    debutant:    j.experienceExige === 'D',
    id:          j.id,
    title:       toTitleCase(j.intitule),
    company:     j.entreprise?.nom || 'Entreprise non précisée',
    location:    j.lieuTravail?.libelle || '',
    contract:    j.typeContratLibelle || 'CDI',
    salary:      formatSalaryRange(sal?.min ?? null, sal?.max ?? null),
    salaryMin:   sal?.min ?? null,
    salaryMax:   sal?.max ?? null,
    description: j.description || '',
    url:         j.origineOffre?.urlOrigine || '',
    source:      'France Travail',
    remote:      j.teleTravailLibelle || '',
  }
}

// ── Adzuna ────────────────────────────────────────────────────────────────

const ADZUNA_CONTRACT: Record<string, string> = {
  permanent: 'CDI', contract: 'CDD', temporary: 'Intérim',
}

// Comparaison de noms sans accents ni majuscules (« Hérault » = « herault »)
function sameName(a: string, b: string): boolean {
  const n = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  return n(a) === n(b)
}

function mapAdzunaJob(j: any) {
  const salary = formatSalaryRange(j.salary_min || null, j.salary_max || null)
  return {
    id:          `adzuna-${j.id}`,
    title:       toTitleCase(j.title || ''),
    company:     j.company?.display_name || 'Entreprise non précisée',
    location:    j.location?.display_name || '',
    departementName: j.location?.area?.[2] ?? null,
    // Contrat inconnu : rien n'est affiché (et surtout pas « CDI » par défaut)
    contract:    ADZUNA_CONTRACT[j.contract_type?.toLowerCase()] || (j.contract_time === 'part_time' ? 'Temps partiel' : ''),
    salary,
    salaryMin:   j.salary_min || null,
    salaryMax:   j.salary_max || null,
    // Adzuna ne fournit ni le diplôme ni l'expérience demandés
    diploma:     null,
    diplomaRank: null,
    debutant:    null,
    description: j.description || '',
    url:         j.redirect_url || '',
    source:      'Adzuna',
    remote:      '',
  }
}

type AdzunaOptions = {
  keyword: string
  location: string
  limit: number
  contractLabel?: string            // « Alternance » : étiquette imposée
  salMin?: number | null
  salMax?: number | null
  departementName?: string | null   // ex. « Gironde » : seules les offres de ce département
  contrat?: 'CDI' | 'CDD' | null    // seuls types de contrat filtrables chez Adzuna
  distance?: string
}

async function fetchAdzunaJobs(o: AdzunaOptions): Promise<any[]> {
  const appId  = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) throw new Error('Adzuna credentials manquants (ADZUNA_APP_ID / ADZUNA_APP_KEY)')

  const params = new URLSearchParams({
    app_id:           appId,
    app_key:          appKey,
    // Avec un département, on en demande plus pour garder assez d'offres après le tri
    results_per_page: String(o.departementName ? 50 : o.limit),
  })
  const where = o.location || o.departementName || ''
  if (o.keyword) params.append('what', o.keyword)
  if (where)     params.append('where', where)
  if (o.location && o.distance) params.append('distance', o.distance)
  if (o.salMin)  params.append('salary_min', String(o.salMin))
  if (o.salMax)  params.append('salary_max', String(o.salMax))
  if (o.contrat === 'CDI') params.append('permanent', '1')
  if (o.contrat === 'CDD') params.append('contract', '1')

  const url = `https://api.adzuna.com/v1/api/jobs/fr/search/1?${params}`
  console.log('[Adzuna] search url:', url.replace(appKey, '***'))

  // Adzuna renvoie parfois des erreurs passagères (503) : jusqu'à 3 essais,
  // chacun limité à 8 secondes, avant d'abandonner
  let res: Response | null = null
  let lastError = ''
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      res = await fetch(url, { cache: 'no-store', signal: controller.signal })
      console.log('[Adzuna] status:', res.status, attempt > 1 ? `(essai ${attempt})` : '')
      if (res.ok || res.status < 500) break
      lastError = `HTTP ${res.status}`
    } catch (err) {
      res = null
      lastError = (err as Error).name === 'AbortError' ? 'délai dépassé (8 s)' : (err as Error).message
      console.warn('[Adzuna] essai', attempt, 'échoué :', lastError)
    } finally {
      clearTimeout(timeout)
    }
    if (attempt < 3) await new Promise(r => setTimeout(r, 400 * attempt))
  }
  if (!res || !res.ok) {
    const body = res ? (await res.text()).slice(0, 200) : ''
    throw new Error(`Adzuna indisponible : ${res ? `HTTP ${res.status} ${body}` : lastError}`)
  }
  const data = await res.json()
  let results: any[] = data.results || []
  // Département : Adzuna situe chaque offre (France › Région › Département › …)
  if (o.departementName) {
    results = results.filter(r => {
      const area: string[] = r.location?.area || []
      return area.length > 2 && sameName(area[2], o.departementName!)
    })
  }
  let jobs = results.slice(0, o.limit).map(mapAdzunaJob)
  if (o.contractLabel) jobs = jobs.map((j: any) => ({ ...j, contract: o.contractLabel }))
  console.log('[Adzuna] jobs returned:', jobs.length)
  return jobs
}

// ── France Travail ─────────────────────────────────────────────────────────

async function searchJobs(token: string, params: URLSearchParams) {
  const url = `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`
  console.log('[FT] search url:', url)
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })
}

// Recherche France Travail avec reprise automatique :
// jeton expiré (401) → nouveau jeton ; erreur serveur (5xx) → 2 nouvelles tentatives.
async function searchFT(params: URLSearchParams): Promise<Response> {
  let token = await getToken()
  let res = await searchJobs(token, params)

  if (res.status === 401) {
    console.log('[FT] 401 on search — refreshing token and retrying')
    invalidateToken()
    token = await getToken()
    res = await searchJobs(token, params)
  }

  for (let attempt = 1; attempt <= 2 && res.status >= 500; attempt++) {
    console.log(`[FT] ${res.status} — retry ${attempt}/2 in 500ms`)
    await new Promise(r => setTimeout(r, 500))
    res = await searchJobs(token, params)
  }
  return res
}

function buildFTParams(opts: {
  range: string; motsCles: string; codeInsee: string | null; distance: string
  departement: string; typeContrat: string; salMin: number | null; debutant: boolean
}) {
  const params = new URLSearchParams({ range: opts.range })
  const commune = opts.codeInsee ? (COMMUNES_ARRONDISSEMENTS[opts.codeInsee] ?? opts.codeInsee) : null
  if (opts.motsCles)              params.append('motsCles', opts.motsCles)
  if (commune)                    params.append('commune', commune)
  if (commune && opts.distance)   params.append('distance', opts.distance)
  // France Travail n'accepte qu'un seul critère géographique : avec une ville, le
  // département est appliqué ensuite sur les résultats (voir inDepartement)
  if (opts.departement && !commune) params.append('departement', opts.departement)
  // L'alternance n'est pas un typeContrat chez France Travail : elle passe par les mots-clés
  if (opts.typeContrat && opts.typeContrat !== 'ALTERNANCE') params.append('typeContrat', opts.typeContrat)
  // France Travail exige la période avec le salaire minimum (A = annuel, en euros)
  if (opts.salMin) {
    params.append('salaireMin', String(opts.salMin))
    params.append('periodeSalaire', 'A')
  }
  if (opts.debutant) params.append('experienceExigence', 'D') // « Débutant accepté »
  return params
}

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const source       = searchParams.get('source') || 'francetravail'
    const keyword      = (searchParams.get('keyword') || searchParams.get('q') || '').trim()
    const location     = (searchParams.get('location') || '').trim()
    const salMin       = parseSalary(searchParams.get('salMin') || '')
    const salMax       = parseSalary(searchParams.get('salMax') || '')
    const departement  = searchParams.get('departement') || ''
    const distance     = searchParams.get('distance') || ''
    const typeContrat  = searchParams.get('typeContrat') || ''
    const niveauParam  = parseInt(searchParams.get('niveau') || '', 10)
    const niveau       = niveauParam >= 0 && niveauParam <= 5 ? niveauParam : null
    const debutant     = searchParams.get('debutant') === '1'

    const isAlternance  = typeContrat === 'ALTERNANCE'
    const motsCles      = isAlternance ? [keyword, 'alternance'].filter(Boolean).join(' ') : keyword
    const contractLabel = isAlternance ? 'Alternance' : undefined

    const cacheKey = buildCacheKey(source, keyword, location, typeContrat, departement, distance, salMin, salMax, niveau, debutant ? 1 : 0)

    // « Jusqu'à mon niveau » : on retire les offres qui indiquent un diplôme plus élevé
    // (exigé ou souhaité). Les offres sans diplôme indiqué restent visibles.
    const fitsLevel = (j: any) => niveau === null || j.diplomaRank == null || j.diplomaRank <= niveau
    // Département (offres France Travail, lieu au format « 33 - BORDEAUX »)
    const inDepartement = (j: any) => !departement || String(j.location || '').startsWith(`${departement} `)
    // Avec ce filtre, on demande plus d'offres à France Travail pour en garder assez
    const ftRange = (n: number) => `0-${(niveau === null ? n : n * 2) - 1}`
    const departementName = DEPARTEMENTS.find(d => d.code === departement)?.name ?? null
    // Adzuna ne sait filtrer que CDI et CDD ; l'alternance passe par les mots-clés
    const adzunaContrat = typeContrat === 'CDI' || typeContrat === 'CDD' ? typeContrat : null
    const adzunaContratImpossible = !!typeContrat && typeContrat !== 'ALTERNANCE' && !adzunaContrat
    // Adzuna est écarté quand il ne peut pas respecter un filtre demandé
    const skipAdzuna = debutant || adzunaContratImpossible
    const adzunaNote = debutant
      ? 'Filtre « Débutant accepté » : seules les offres France Travail sont affichées, Adzuna n’indiquant pas l’expérience demandée.'
      : adzunaContratImpossible
        ? 'Ce type de contrat n’existe pas chez Adzuna : seules les offres France Travail sont affichées.'
        : undefined
    const adzunaOptions = (limit: number): AdzunaOptions => ({
      keyword: motsCles, location, limit, contractLabel, salMin, salMax,
      departementName, contrat: adzunaContrat, distance,
    })
    const cached = jobsCache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      console.log('[cache] HIT', cacheKey)
      return NextResponse.json(cached.note ? { jobs: cached.jobs, note: cached.note } : { jobs: cached.jobs }, { headers: CACHE_HEADERS })
    }

    // Réponse finale : contrôle du salaire sur les montants réels (France Travail ne gère
    // pas le maximum et se trompe sur les salaires annuels saisis comme mensuels)
    // et mise en cache, sauf si la recherche est incomplète (avertissement).
    const respond = (rawJobs: any[], warning?: string, note?: string) => {
      const jobs = rawJobs.filter(j => {
        // Offres sans salaire indiqué : retirées seulement si un filtre salaire est demandé
        if (j.salaryMin == null) return !salMin && !salMax
        const top = j.salaryMax ?? j.salaryMin
        if (salMin && top < salMin) return false        // payée moins que le minimum demandé
        if (salMax && j.salaryMin > salMax) return false // payée plus que le maximum demandé
        return true
      })
      if (warning) return NextResponse.json(note ? { jobs, warning, note } : { jobs, warning }, { headers: NO_STORE })
      jobsCache.set(cacheKey, { jobs, note, expiresAt: Date.now() + CACHE_TTL })
      return NextResponse.json(note ? { jobs, note } : { jobs }, { headers: CACHE_HEADERS })
    }

    // ── Adzuna seul ───────────────────────────────────────────────────────
    if (source === 'adzuna') {
      if (skipAdzuna) return respond([], undefined, adzunaNote)
      try {
        return respond(await fetchAdzunaJobs(adzunaOptions(20)))
      } catch (err) {
        console.error('[Adzuna seul]', (err as Error).message)
        return NextResponse.json(
          { error: 'Le service Adzuna ne répond pas pour le moment. Réessayez dans un instant, ou choisissez la source « Tout » ou « France Travail ».' },
          { status: 502 }
        )
      }
    }

    const codeInsee = location ? await resolveInseeCode(location) : null
    console.log('[FT] location:', location || '(none)', '→ INSEE:', codeInsee ?? '(none)')
    // Le code INSEE commence par le numéro du département (69123 = Lyon, Rhône)
    const villeHorsDepartement = !!(codeInsee && departement && !codeInsee.startsWith(departement))
    const villeWarning = location && !codeInsee
      ? `La ville « ${location} » n’a pas été reconnue : les offres France Travail ne sont pas filtrées par ville.`
      : villeHorsDepartement
        ? `La ville « ${location} » ne se trouve pas dans le département choisi : retirez l’un des deux filtres pour voir des offres.`
        : undefined

    // ── Tout : FT (10) + Adzuna (10) en parallèle, tolérant aux pannes ───
    if (source === 'tout') {
      // Chaque source est interrogée pour 20 offres : on en garde 10 + 10 quand les deux
      // répondent, et 20 de celle qui fonctionne si l'autre est écartée ou en panne
      const ftParams = buildFTParams({ range: ftRange(20), motsCles, codeInsee, distance, departement, typeContrat, salMin, debutant })
      const [ftResult, azResult] = await Promise.allSettled([
        (async () => {
          const r = await searchFT(ftParams)
          if (!r.ok) {
            const body = await r.text()
            console.error('[FT tout] error', r.status, body.slice(0, 400))
            throw new Error(`FT ${r.status}`)
          }
          const d = r.status === 204 ? {} : await r.json()
          return (d.resultats || []).map(mapJob).filter(fitsLevel).filter(inDepartement).slice(0, 20)
        })(),
        skipAdzuna ? Promise.resolve([]) : fetchAdzunaJobs(adzunaOptions(20)),
      ])

      const ftOk = ftResult.status === 'fulfilled'
      const azOk = azResult.status === 'fulfilled' && !skipAdzuna
      const ftAll: any[] = ftResult.status === 'fulfilled' ? ftResult.value : []
      const azAll: any[] = azResult.status === 'fulfilled' ? azResult.value : []
      const ftJobs = azOk ? ftAll.slice(0, 10) : ftAll
      const azJobs = ftOk ? azAll.slice(0, 10) : azAll
      if (ftResult.status === 'rejected') console.warn('[tout] FT failed:', ftResult.reason?.message)
      if (azResult.status === 'rejected') console.warn('[tout] Adzuna failed:', azResult.reason?.message)
      if (ftResult.status === 'rejected' && azResult.status === 'rejected') {
        return NextResponse.json({ error: 'Les services d’offres sont indisponibles. Réessayez dans un instant.' }, { status: 502 })
      }
      // Une source en panne : on affiche l'autre, sans mettre ce résultat partiel en cache
      const panne = ftResult.status === 'rejected'
        ? 'France Travail ne répond pas pour le moment : seules les offres Adzuna sont affichées.'
        : azResult.status === 'rejected'
          ? 'Adzuna ne répond pas pour le moment : seules les offres France Travail sont affichées.'
          : undefined
      const warning = villeWarning ?? panne
      return respond([...ftJobs, ...azJobs], warning, adzunaNote)
    }

    // ── France Travail seul ───────────────────────────────────────────────
    const params = buildFTParams({ range: ftRange(20), motsCles, codeInsee, distance, departement, typeContrat, salMin, debutant })
    const res = await searchFT(params)
    console.log('[FT] search status:', res.status)

    if (!res.ok) {
      const body = await res.text()
      console.error('[FT] search failed', res.status, body.slice(0, 300))
      if (res.status === 429) {
        return NextResponse.json({ error: 'Trop de requêtes — réessayez dans quelques secondes.' }, { status: 429 })
      }
      if (res.status === 400) {
        return NextResponse.json({ error: 'Paramètres de recherche invalides.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Le service France Travail ne répond pas. Réessayez dans un instant.' }, { status: 502 })
    }

    let data: any
    try {
      data = res.status === 204 ? {} : await res.json()
    } catch {
      console.error('[FT] response JSON parse failed, status was', res.status)
      return NextResponse.json({ error: 'Réponse invalide de France Travail.' }, { status: 502 })
    }

    const jobs = (data.resultats || []).map(mapJob).filter(fitsLevel).filter(inDepartement).slice(0, 20)
    console.log('[FT] jobs returned:', jobs.length)
    return respond(jobs, villeWarning)

  } catch (err) {
    const e = err as Error
    console.error('[jobs] FATAL:', e.message, e.stack?.split('\n')[1])
    return NextResponse.json({ error: 'Impossible de charger les offres. Réessayez dans un instant.' }, { status: 500 })
  }
}
