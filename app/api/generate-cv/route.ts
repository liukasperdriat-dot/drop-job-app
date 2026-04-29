import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // ── Vérification du quota ──────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, cv_count_this_month, cv_reset_date')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    }

    // Reset mensuel : si cv_reset_date est dans un mois passé, on remet à 0
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

    // Freemium : 1 CV max par mois
    if (!profile.is_premium && profile.cv_count_this_month >= 1) {
      return NextResponse.json(
        { error: 'QUOTA_EXCEEDED', message: 'Vous avez utilisé votre CV gratuit ce mois-ci. Passez à Premium pour en générer plus.' },
        { status: 403 }
      )
    }

    // ── Génération du CV ───────────────────────────────────────────────────
    const { jobTitle, company, jobDescription, userProfile } = await request.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en recrutement et rédaction de CV. 
Tu génères des CV professionnels optimisés pour les ATS (Applicant Tracking Systems).
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`,
        },
        {
          role: 'user',
          content: `Génère un CV optimisé pour cette offre d'emploi.
OFFRE:
Poste: ${jobTitle}
Entreprise: ${company}
Description: ${jobDescription}
PROFIL DU CANDIDAT:
${userProfile}
Réponds en JSON avec cette structure exacte:
{
  "name": "Prénom Nom",
  "title": "Titre adapté au poste",
  "summary": "Résumé professionnel de 3 lignes adapté à l'offre",
  "experience": [
    {
      "title": "Titre du poste",
      "company": "Entreprise",
      "period": "2022 - Present",
      "description": "Description adaptée aux mots-clés de l'offre"
    }
  ],
  "skills": ["Compétence 1", "Compétence 2", "Compétence 3"],
  "education": [
    {
      "degree": "Diplôme",
      "school": "École",
      "year": "2020"
    }
  ],
  "matchScore": 85
}`,
        },
      ],
    })

    const content = completion.choices[0].message.content || ''
    const cv = JSON.parse(content)

    // ── Incrémenter le compteur ────────────────────────────────────────────
    await supabase
      .from('profiles')
      .update({ cv_count_this_month: profile.cv_count_this_month + 1 })
      .eq('id', user.id)

    // Ajouter le filigrane si pas premium
    cv.watermark = !profile.is_premium

    return NextResponse.json({ cv, isPremium: profile.is_premium })

  } catch (err: any) {
    console.error('generate-cv error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}