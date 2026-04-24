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

    return NextResponse.json({ cv })
  } catch (err: any) {
    console.error('OpenAI error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}