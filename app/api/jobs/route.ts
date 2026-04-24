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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword  = searchParams.get('keyword') || ''
    const location = searchParams.get('location') || ''
    const salMin   = searchParams.get('salMin') || ''
    const salMax   = searchParams.get('salMax') || ''

    const token = await getFranceTravailToken()

    const params = new URLSearchParams({
      motsCles: keyword,
      commune: location,
      range: '0-19',
    })

    if (salMin) params.append('salaireMin', salMin)
    if (salMax) params.append('salaireMax', salMax)

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
      title: j.intitule,
      company: j.entreprise?.nom || 'Entreprise non précisée',
      location: j.lieuTravail?.libelle || '',
      contract: j.typeContratLibelle || 'CDI',
      salary: j.salaire?.libelle || 'Salaire non précisé',
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