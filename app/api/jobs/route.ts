import { NextResponse } from 'next/server'

async function getFranceTravailToken() {
  const res = await fetch('https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.FRANCE_TRAVAIL_CLIENT_ID!,
      client_secret: process.env.FRANCE_TRAVAIL_CLIENT_SECRET!,
      scope: 'api_offresdemploiv2 o2dsoffre',
    }),
  })
  const data = await res.json()
  return data.access_token
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
    const annMin = Math.round(min / 1000)
    const annMax = max ? Math.round(max / 1000) : null
    if (annMin === 0) return 'Salaire NC'
    return annMax ? `${annMin}k€ — ${annMax}k€ / an` : `${annMin}k€ / an`
  }

  // Mensuel → annuel
  const annMin = Math.round((min * 12) / 1000)
  const annMax = max ? Math.round((max * 12) / 1000) : null
  if (annMin === 0) return 'Salaire NC'
  return annMax ? `${annMin}k€ — ${annMax}k€ / an` : `${annMin}k€ / an`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword  = searchParams.get('keyword') || searchParams.get('q') || ''
    const location = searchParams.get('location') || ''
    const salMin   = searchParams.get('salMin') || ''
    const salMax   = searchParams.get('salMax') || ''

    const token = await getFranceTravailToken()

    const params = new URLSearchParams({ range: '0-19' })
    if (keyword)  params.append('motsCles', keyword)
    if (location) params.append('commune', location)
    if (salMin)   params.append('salaireMin', salMin)
    if (salMax)   params.append('salaireMax', salMax)

    const res = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    )

    const data = await res.json()

    const jobs = (data.resultats || []).map((j: any) => ({
      id: j.id,
      title: toTitleCase(j.intitule),
      company: j.entreprise?.nom || 'Entreprise non précisée',
      location: j.lieuTravail?.libelle || '',
      contract: j.typeContratLibelle || 'CDI',
      salary: formatSalaire(j.salaire?.libelle || ''),
      description: j.description || '',
      url: j.origineOffre?.urlOrigine || '',
      source: 'France Travail',
      remote: j.teleTravailLibelle || '',
    }))

    return NextResponse.json({ jobs })
  } catch (err: any) {
    console.error('France Travail error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}