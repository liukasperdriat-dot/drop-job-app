import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Tu es un expert RH français. Génère une lettre de motivation professionnelle, personnalisée et convaincante en français. La lettre doit avoir : une accroche percutante, un paragraphe sur les compétences du candidat en lien avec le poste, un paragraphe sur la motivation pour l'entreprise, une conclusion avec appel à l'action. Ton : professionnel mais humain. Maximum 350 mots.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()

    if (!profile?.is_premium) {
      return NextResponse.json(
        { error: 'PREMIUM_REQUIRED', message: 'La génération de lettre de motivation est réservée aux membres Premium.' },
        { status: 403 }
      )
    }

    const { jobTitle, company, jobDescription } = await request.json()

    const { data: structuredProfile, error: spError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (spError || !structuredProfile) {
      return NextResponse.json({ error: 'Profil introuvable. Complétez votre profil avant de générer une lettre.' }, { status: 404 })
    }

    const userPrompt = `Génère une lettre de motivation pour ce candidat postulant à ce poste.

=== OFFRE CIBLE ===
Poste : ${jobTitle}
Entreprise : ${company}
Description :
${jobDescription}

=== PROFIL DU CANDIDAT ===
Nom : ${structuredProfile.full_name}
Titre actuel : ${structuredProfile.title || ''}
Compétences : ${(structuredProfile.skills || []).join(', ')}
Expériences : ${(structuredProfile.experiences || []).map((e: any) => `${e.title} chez ${e.company}`).join(', ')}
Formation : ${(structuredProfile.education || []).map((e: any) => `${e.degree} — ${e.school}`).join(', ')}

Retourne UNIQUEMENT le texte de la lettre, sans objet ni en-tête formel, prêt à être copié-collé.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const letter = completion.choices[0].message.content || ''
    return NextResponse.json({ letter })

  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Erreur inconnue' }, { status: 500 })
  }
}
