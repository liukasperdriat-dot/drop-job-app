import { NextResponse } from 'next/server'
import { analyzeAts } from '@/lib/ats-score'

// Outil public « Score ATS » : accessible sans compte.
// L'analyse est faite sur le serveur, sans IA externe ni enregistrement :
// le CV et l'offre collés ne sont ni stockés ni transmis à un tiers.

const MIN_CHARS = 50
const MAX_CHARS = 15000

// Limite anti-abus par adresse IP (mémoire de l'instance, au mieux)
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 30
const hits = new Map<string, number[]>()

function allowed(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) { hits.set(ip, recent); return false }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear() // évite une croissance sans fin
  return true
}

export async function POST(request: Request) {
  try {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnue'
    if (!allowed(ip)) {
      return NextResponse.json({ error: 'Trop d’analyses en peu de temps. Réessayez dans quelques minutes.' }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    const cv = typeof body?.cv === 'string' ? body.cv.trim() : ''
    const offer = typeof body?.offer === 'string' ? body.offer.trim() : ''

    if (cv.length < MIN_CHARS) {
      return NextResponse.json({ error: 'Collez le texte complet de votre CV (au moins quelques lignes).' }, { status: 400 })
    }
    if (offer.length < MIN_CHARS) {
      return NextResponse.json({ error: 'Collez le texte complet de l’offre d’emploi (au moins quelques lignes).' }, { status: 400 })
    }
    if (cv.length > MAX_CHARS || offer.length > MAX_CHARS) {
      return NextResponse.json({ error: 'Texte trop long (15 000 caractères maximum pour le CV comme pour l’offre).' }, { status: 400 })
    }

    const result = analyzeAts(cv, offer)
    if (result.totalKeywords === 0) {
      return NextResponse.json({ error: 'Aucun mot-clé exploitable dans cette offre. Collez le texte complet de l’annonce.' }, { status: 422 })
    }

    return NextResponse.json({ result }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[score-ats]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'L’analyse a échoué. Réessayez dans un instant.' }, { status: 500 })
  }
}
