import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { consumeAiUsage } from '@/lib/ai-usage'
import { letterToText, type LetterParts } from '@/lib/letter'

// Lettre de motivation au format professionnel complet.
// - Premium : lettre entière (texte + blocs pour l'aperçu et le PDF).
// - Gratuit : aperçu limité (en-tête, objet et premier paragraphe uniquement ;
//   la suite n'est jamais envoyée au navigateur), 3 aperçus par 24 h.

const FREE_PREVIEWS_PER_DAY = 3

const SYSTEM_PROMPT = `Tu es un expert RH français qui rédige des lettres de motivation professionnelles, personnalisées et convaincantes, en français impeccable.

RÈGLES ABSOLUES :
- Tu n'inventes JAMAIS de faits : expériences, diplômes, compétences, chiffres ou résultats doivent figurer dans le profil fourni.
- Tu ne prêtes à l'entreprise que ce que dit la description de l'offre (pas de chiffres ni de faits inventés sur elle).
- Ton professionnel mais humain, phrases claires, sans formules creuses ni superlatifs excessifs.
- Le corps fait entre 250 et 350 mots au total.
- Tu n'écris NI l'en-tête, NI la date, NI l'objet, NI « Madame, Monsieur », NI la signature : ils sont ajoutés automatiquement.

Le corps compte exactement 4 paragraphes :
1. Accroche : le poste visé, l'entreprise, et ce qui rend la candidature pertinente en une ou deux phrases fortes.
2. Compétences et expériences du candidat directement liées aux missions de l'offre (exemples concrets tirés du profil).
3. Motivation pour cette entreprise et ce poste, en s'appuyant sur la description de l'offre.
4. Conclusion : disponibilité et demande d'entretien.

Réponds UNIQUEMENT en JSON valide :
{ "paragraphs": ["§1", "§2", "§3", "§4"], "closing": "Formule de politesse complète" }
La formule de politesse est une phrase classique, par exemple : « Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées. »`

const DEFAULT_CLOSING = "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."

// « le 1er décembre 2026 », « le 16 novembre 2026 » (heure de Paris)
function frenchDate(d = new Date()): string {
  const parts = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).formatToParts(d)
  const get = (type: string) => parts.find(p => p.type === type)?.value || ''
  const day = get('day') === '1' ? '1er' : get('day')
  return `${day} ${get('month')} ${get('year')}`
}

function cleanText(value: unknown, max = 2000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { data: account } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .maybeSingle()
    const isPremium = account?.is_premium === true

    const body = await request.json().catch(() => ({}))
    const jobTitle = cleanText(body?.jobTitle, 200)
    const company = cleanText(body?.company, 200)
    const jobDescription = cleanText(body?.jobDescription, 12000)
    if (!jobTitle || !company || !jobDescription) {
      return NextResponse.json({ error: 'Poste, entreprise et description de l’offre sont nécessaires.' }, { status: 400 })
    }

    const { data: p, error: spError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (spError || !p) {
      return NextResponse.json({ error: 'Profil introuvable. Complétez votre profil avant de générer une lettre.' }, { status: 404 })
    }

    if (!isPremium && !(await consumeAiUsage(user.id, 'letter_preview', FREE_PREVIEWS_PER_DAY, 24 * 60 * 60 * 1000))) {
      return NextResponse.json(
        { error: 'LIMIT_REACHED', message: 'Vous avez atteint la limite d’aperçus gratuits pour aujourd’hui. Passez Premium pour des lettres complètes et illimitées.' },
        { status: 429 }
      )
    }

    const experiences = (p.experiences || []).map((e: any) =>
      `- ${e.title} chez ${e.company} (${e.start_date || '?'} – ${e.current ? 'aujourd’hui' : e.end_date || '?'}) : ${e.description || ''}`
    ).join('\n')
    const education = (p.education || []).map((e: any) => `- ${e.degree} — ${e.school}`).join('\n')
    const languages = (p.languages || []).map((l: any) => `${l.name} (${l.level})`).join(', ')

    const userPrompt = `=== OFFRE CIBLE ===
Poste : ${jobTitle}
Entreprise : ${company}
Description :
${jobDescription}

=== PROFIL DU CANDIDAT ===
Nom : ${p.full_name || ''}
Titre : ${p.title || ''}
Résumé : ${p.summary || ''}
Compétences : ${(p.skills || []).join(', ')}
Langues : ${languages}
Expériences :
${experiences}
Formation :
${education}`

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    let raw: { paragraphs?: unknown; closing?: unknown }
    try {
      raw = JSON.parse(completion.choices[0]?.message?.content || '{}')
    } catch {
      return NextResponse.json({ error: 'La génération de la lettre a échoué. Réessayez.' }, { status: 502 })
    }
    const paragraphs = Array.isArray(raw.paragraphs)
      ? raw.paragraphs.map(x => cleanText(x)).filter(Boolean).slice(0, 6)
      : []
    if (paragraphs.length === 0) {
      return NextResponse.json({ error: 'La génération de la lettre a échoué. Réessayez.' }, { status: 502 })
    }

    // En-tête construit à partir du profil réel (jamais par l'IA)
    const name = cleanText(p.full_name, 120)
    const city = cleanText(p.location, 120).split(',')[0].trim()
    const parts: LetterParts = {
      sender: [name, cleanText(p.location, 120), cleanText(p.phone, 40), cleanText(p.email, 160)].filter(Boolean),
      recipient: [company, 'Service recrutement'],
      placeDate: city ? `${city}, le ${frenchDate()}` : `Le ${frenchDate()}`,
      subject: `Objet : Candidature au poste de ${jobTitle}`,
      salutation: 'Madame, Monsieur,',
      paragraphs,
      closing: cleanText(raw.closing, 300) || DEFAULT_CLOSING,
      signature: name,
    }

    if (!isPremium) {
      // Aperçu gratuit : seul le premier paragraphe quitte le serveur
      return NextResponse.json({
        locked: true,
        hiddenParagraphs: paragraphs.length - 1,
        parts: { ...parts, paragraphs: [paragraphs[0]], closing: '', signature: '' },
      })
    }

    return NextResponse.json({ letter: letterToText(parts), parts })

  } catch (err) {
    console.error('[generate-cover-letter]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'La génération de la lettre a échoué. Réessayez dans un instant.' }, { status: 500 })
  }
}
