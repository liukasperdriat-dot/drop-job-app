import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Tu es un expert en recrutement et rédaction de CV en France.
Tu génères des CV professionnels, précis et optimisés ATS (Applicant Tracking Systems).

RÈGLES ABSOLUES — à respecter impérativement :
- Tu n'inventes JAMAIS de faits, diplômes, entreprises, dates, compétences ou langues absents du profil fourni.
- Tu reformules et réordonnes uniquement ce qui existe dans le profil pour maximiser la pertinence avec l'offre.
- Tu écris en français impeccable, professionnel, sans faute d'orthographe ni de grammaire.
- Le résumé fait 3 à 4 phrases, personnalisé pour cette offre spécifique, en valorisant les atouts du candidat.
- Les descriptions d'expérience sont réécrites pour intégrer les mots-clés de l'offre, sans déformer les faits.
- Les compétences sont triées par pertinence décroissante pour cette offre.
- Le matchScore reflète objectivement la correspondance réelle profil/offre (0–100).
- Tu réponds UNIQUEMENT en JSON valide selon le schéma demandé, sans markdown ni backticks.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // ── Vérification du quota ──────────────────────────────────────────────
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, cv_count_this_month, cv_reset_date')
      .eq('id', user.id)
      .single()

    // Aucune ligne → on crée la ligne quota avec les valeurs par défaut
    if (profileError || !profile) {
      const today = new Date().toISOString().split('T')[0]
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, is_premium: false, cv_count_this_month: 0, cv_reset_date: today })
        .select('is_premium, cv_count_this_month, cv_reset_date')
        .single()

      if (createError || !created) {
        return NextResponse.json({ error: 'Impossible d\'initialiser le quota.' }, { status: 500 })
      }
      profile = created
    }

    const now = new Date()
    const resetDate = new Date(profile.cv_reset_date)
    const needsReset =
      now.getMonth() !== resetDate.getMonth() ||
      now.getFullYear() !== resetDate.getFullYear()

    if (needsReset) {
      await supabase
        .from('profiles')
        .update({ cv_count_this_month: 0, cv_reset_date: now.toISOString().split('T')[0] })
        .eq('id', user.id)
      profile.cv_count_this_month = 0
    }

    if (!profile.is_premium && profile.cv_count_this_month >= 1) {
      return NextResponse.json(
        { error: 'QUOTA_EXCEEDED', message: 'Vous avez utilisé votre CV gratuit ce mois-ci. Passez à Premium pour en générer plus.' },
        { status: 403 }
      )
    }

    // ── Génération ────────────────────────────────────────────────────────
    const { jobTitle, company, jobDescription, structuredProfile } = await request.json()

    const userPrompt = `Génère un CV optimisé pour cette offre à partir du profil structuré ci-dessous.

=== OFFRE CIBLE ===
Poste : ${jobTitle}
Entreprise : ${company}
Description :
${jobDescription}

=== PROFIL DU CANDIDAT ===
${JSON.stringify(structuredProfile, null, 2)}

=== INSTRUCTIONS ===
1. Reprends le nom complet du candidat (full_name) tel quel dans "name".
2. Adapte "title" pour correspondre précisément au poste visé (en t'inspirant du titre existant du candidat).
3. Rédige "summary" en 3-4 phrases qui connectent directement le profil à l'offre, en utilisant les mots-clés de la description.
4. Dans "experience" : réordonne les postes par pertinence pour l'offre. Ne modifie JAMAIS entreprise, dates ni intitulé de poste — reformule uniquement les descriptions pour mettre en avant les mots-clés pertinents.
5. Dans "skills" : sélectionne parmi les compétences existantes du profil et trie-les par pertinence décroissante pour cette offre. N'ajoute aucune compétence absente du profil.
6. Inclus toutes les formations (education) du profil, sans modification.
7. Inclus toutes les langues (languages) du profil, sans modification.
8. Calcule "matchScore" (0–100) basé sur la correspondance objective compétences/expérience requises vs profil réel.
9. Liste 2–3 "matchReasons" courtes (max 8 mots chacune) expliquant le score (points forts ou manques).

Réponds avec cette structure JSON exacte :
{
  "name": "Prénom Nom",
  "title": "Titre adapté au poste visé",
  "summary": "Résumé personnalisé de 3-4 phrases…",
  "experience": [
    {
      "title": "Intitulé exact du poste",
      "company": "Entreprise exacte",
      "period": "MM/YYYY – MM/YYYY ou MM/YYYY – présent",
      "description": "Description réécrite orientée offre…"
    }
  ],
  "skills": ["Compétence 1", "Compétence 2"],
  "education": [
    {
      "degree": "Diplôme exact",
      "school": "École exacte",
      "period": "YYYY – YYYY"
    }
  ],
  "languages": [
    { "name": "Langue", "level": "Niveau" }
  ],
  "matchScore": 85,
  "matchReasons": ["Point fort ou manque 1", "Point fort ou manque 2"]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const content = completion.choices[0].message.content || '{}'
    let cv: any
    try {
      cv = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: 'Réponse IA invalide, réessayez.' }, { status: 500 })
    }

    // ── Incrémenter le compteur ────────────────────────────────────────────
    await supabase
      .from('profiles')
      .update({ cv_count_this_month: profile.cv_count_this_month + 1 })
      .eq('id', user.id)

    cv.watermark = !profile.is_premium

    return NextResponse.json({ cv, isPremium: profile.is_premium })

  } catch (err: any) {
    console.error('generate-cv error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
