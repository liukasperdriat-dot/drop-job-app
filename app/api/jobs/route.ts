import { NextResponse } from 'next/server'

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
  console.log('[FT] token request body:', rawBody.replace(process.env.FRANCE_TRAVAIL_CLIENT_SECRET || 'SECRET', '***'))
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

// Warm in-memory cache: avoids hitting geo API on repeated city lookups within the same worker
const inseeCache = new Map<string, string>()

async function resolveInseeCode(cityName: string): Promise<string | null> {
  const key = cityName.toLowerCase().trim()
  if (inseeCache.has(key)) return inseeCache.get(key)!

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2000)
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
    const code: string | null = data[0]?.code ?? null
    if (code) inseeCache.set(key, code)
    else console.warn('[geo] no INSEE result for city:', cityName)
    console.log('[geo]', cityName, '→', code)
    return code
  } catch (err: any) {
    console.warn('[geo] resolve error:', err.name === 'AbortError' ? 'timeout 2s' : err.message, '— city:', cityName)
    return null
  } finally {
    clearTimeout(timeout)
  }
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

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function formatSalaire(libelle: string): string {
  if (!libelle) return 'Salaire NC'
  const match = libelle.match(/(\d+(?:[.,]\d+)?)\s*Euros?\s*(?:à\s*(\d+(?:[.,]\d+)?)\s*Euros?)?/i)
  if (!match) return 'Salaire NC'
  const min = Math.round(parseFloat(match[1].replace(',', '.')))
  const max = match[2] ? Math.round(parseFloat(match[2].replace(',', '.'))) : null
  const isAnnuel = libelle.toLowerCase().includes('annuel')
  if (isAnnuel) {
    const a = Math.round(min / 1000), b = max ? Math.round(max / 1000) : null
    return a === 0 ? 'Salaire NC' : b ? `${a}k€ — ${b}k€ / an` : `${a}k€ / an`
  }
  const a = Math.round((min * 12) / 1000), b = max ? Math.round((max * 12) / 1000) : null
  return a === 0 ? 'Salaire NC' : b ? `${a}k€ — ${b}k€ / an` : `${a}k€ / an`
}

function mapJob(j: any) {
  return {
    id:          j.id,
    title:       toTitleCase(j.intitule),
    company:     j.entreprise?.nom || 'Entreprise non précisée',
    location:    j.lieuTravail?.libelle || '',
    contract:    j.typeContratLibelle || 'CDI',
    salary:      formatSalaire(j.salaire?.libelle || ''),
    description: j.description || '',
    url:         j.origineOffre?.urlOrigine || '',
    source:      'France Travail',
    remote:      j.teleTravailLibelle || '',
  }
}

// ── Adzuna ────────────────────────────────────────────────────────────────

const ADZUNA_CONTRACT: Record<string, string> = {
  permanent: 'CDI', contract: 'CDD', part_time: 'Temps partiel', temporary: 'Intérim',
}

function mapAdzunaJob(j: any) {
  let salary = 'Salaire NC'
  if (j.salary_min || j.salary_max) {
    const min = j.salary_min ? Math.round(j.salary_min / 1000) : null
    const max = j.salary_max ? Math.round(j.salary_max / 1000) : null
    if (min && max && min !== max) salary = `${min}k€ — ${max}k€ / an`
    else if (min) salary = `${min}k€ / an`
    else if (max) salary = `${max}k€ / an`
  }
  return {
    id:          `adzuna-${j.id}`,
    title:       toTitleCase(j.title || ''),
    company:     j.company?.display_name || 'Entreprise non précisée',
    location:    j.location?.display_name || '',
    contract:    ADZUNA_CONTRACT[j.contract_type?.toLowerCase()] || 'CDI',
    salary,
    description: j.description || '',
    url:         j.redirect_url || '',
    source:      'Adzuna',
    remote:      '',
  }
}

async function fetchAdzunaJobs(keyword: string, location: string, limit = 20): Promise<any[]> {
  const appId  = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) throw new Error('Adzuna credentials manquants (ADZUNA_APP_ID / ADZUNA_APP_KEY)')

  const params = new URLSearchParams({
    app_id:           appId,
    app_key:          appKey,
    results_per_page: String(limit),
  })
  if (keyword)  params.append('what', keyword)
  if (location) params.append('where', location)

  const url = `https://api.adzuna.com/v1/api/jobs/fr/search/1?${params}`
  console.log('[Adzuna] search url:', url.replace(appKey, '***'))

  const res = await fetch(url, { cache: 'no-store' })
  console.log('[Adzuna] status:', res.status)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Adzuna HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  const jobs = (data.results || []).map(mapAdzunaJob)
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const source       = searchParams.get('source') || 'francetravail'
    const keyword      = searchParams.get('keyword') || searchParams.get('q') || ''
    const location     = searchParams.get('location') || ''
    const salMin       = searchParams.get('salMin') || ''
    const salMax       = searchParams.get('salMax') || ''
    const departement  = searchParams.get('departement') || ''
    const distance     = searchParams.get('distance') || ''
    const typeContrat  = searchParams.get('typeContrat') || ''

    // ── Adzuna only ───────────────────────────────────────────────────────
    if (source === 'adzuna') {
      const jobs = await fetchAdzunaJobs(keyword, location)
      return NextResponse.json({ jobs })
    }

    // ── Tout : FT (10) + Adzuna (10) en parallèle, tolérant aux pannes ───
    if (source === 'tout') {
      const [codeInsee, token] = await Promise.all([
        location ? resolveInseeCode(location) : Promise.resolve(null),
        getToken(),
      ])

      const codePourFT = codeInsee ? (COMMUNES_ARRONDISSEMENTS[codeInsee] ?? codeInsee) : null

      const ftParams = new URLSearchParams({ range: '0-9' })
      if (keyword)      ftParams.append('motsCles', keyword)
      if (codePourFT)   ftParams.append('commune', codePourFT)
      if (codePourFT && distance) ftParams.append('distance', distance)
      if (departement)  ftParams.append('departement', departement)
      if (typeContrat)  ftParams.append('typeContrat', typeContrat)
      if (salMin)       ftParams.append('salaireMin', salMin)
      if (salMax)       ftParams.append('salaireMax', salMax)

      const [ftResult, azResult] = await Promise.allSettled([
        (async () => {
          let tok = token
          let r = await searchJobs(tok, ftParams)
          if (r.status === 401) { invalidateToken(); tok = await getToken(); r = await searchJobs(tok, ftParams) }
          if (!r.ok) throw new Error(`FT ${r.status}`)
          const d = await r.json()
          return (d.resultats || []).map(mapJob)
        })(),
        fetchAdzunaJobs(keyword, location, 10),
      ])

      const ftJobs = ftResult.status === 'fulfilled' ? ftResult.value : []
      const azJobs = azResult.status === 'fulfilled' ? azResult.value : []
      if (ftResult.status === 'rejected') console.warn('[tout] FT failed:', (ftResult as PromiseRejectedResult).reason?.message)
      if (azResult.status === 'rejected') console.warn('[tout] Adzuna failed:', (azResult as PromiseRejectedResult).reason?.message)

      return NextResponse.json({ jobs: [...ftJobs, ...azJobs] })
    }
    // ─────────────────────────────────────────────────────────────────────

    // Resolve INSEE code and fetch token in parallel to cut latency
    const [codeInsee, token] = await Promise.all([
      location ? resolveInseeCode(location) : Promise.resolve(null),
      getToken(),
    ])
    console.log('[FT] location:', location || '(none)', '→ INSEE:', codeInsee ?? '(none)')

    const codePourFT = codeInsee ? (COMMUNES_ARRONDISSEMENTS[codeInsee] ?? codeInsee) : null

    const params = new URLSearchParams({ range: '0-19' })
    if (keyword)      params.append('motsCles', keyword)
    if (codePourFT)   params.append('commune', codePourFT)
    if (codePourFT && distance) params.append('distance', distance)
    if (departement)  params.append('departement', departement)
    if (typeContrat)  params.append('typeContrat', typeContrat)
    if (salMin)       params.append('salaireMin', salMin)
    if (salMax)       params.append('salaireMax', salMax)

    let currentToken = token
    let res = await searchJobs(currentToken, params)
    console.log('[FT] search status:', res.status)

    // If 401, the cached token was externally invalidated — refresh once and retry
    if (res.status === 401) {
      console.log('[FT] 401 on search — refreshing token and retrying')
      invalidateToken()
      currentToken = await getToken()
      res = await searchJobs(currentToken, params)
      console.log('[FT] retry (401) status:', res.status)
    }

    // If 5XX, retry up to 2 times with 500ms delay before giving up
    if (res.status >= 500) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        console.log(`[FT] ${res.status} — retry ${attempt}/2 in 500ms`)
        await new Promise(r => setTimeout(r, 500))
        res = await searchJobs(currentToken, params)
        console.log(`[FT] retry ${attempt}/2 status:`, res.status)
        if (res.status < 500) break
      }
    }

    if (!res.ok) {
      const body = await res.text()
      console.error('[FT] search failed', res.status, body.slice(0, 300))
      if (res.status === 429) {
        return NextResponse.json({ error: 'Trop de requêtes — réessayez dans quelques secondes.' }, { status: 429 })
      }
      if (res.status === 400) {
        return NextResponse.json({ error: 'Paramètres invalides.', detail: body.slice(0, 200) }, { status: 400 })
      }
      return NextResponse.json({ error: `Search error ${res.status}` }, { status: 502 })
    }

    let data: any
    try {
      data = await res.json()
    } catch {
      console.error('[FT] response JSON parse failed, status was', res.status)
      return NextResponse.json({ error: 'Réponse API invalide.' }, { status: 502 })
    }

    const jobs = (data.resultats || []).map(mapJob)
    console.log('[FT] jobs returned:', jobs.length)
    return NextResponse.json({ jobs })

  } catch (err: any) {
    console.error('[FT] FATAL:', err.message, err.stack?.split('\n')[1])
    return NextResponse.json({ error: err.message ?? 'Erreur inconnue' }, { status: 500 })
  }
}
