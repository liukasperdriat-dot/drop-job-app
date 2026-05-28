import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Tu es un expert en recrutement et rédaction de CV en France.
Tu génères des CV professionnels, précis et optimisés ATS (Applicant Tracking Systems).

RÈGLES ABSOLUES — à respecter impérativement :
- Tu n'inventes JAMAIS de faits, diplômes, entreprises, dates, compétences ou langues absents du profil fourni.
- Le résumé NE DOIT JAMAIS mentionner de technologies, langages, frameworks ou outils absents du profil fourni. Si l'offre demande des compétences que le candidat n'a pas, le résumé ne les cite PAS — il valorise uniquement ce que le candidat possède réellement.
- Tu reformules et réordonnes uniquement ce qui existe dans le profil pour maximiser la pertinence avec l'offre.
- Tu écris en français impeccable, professionnel, sans faute d'orthographe ni de grammaire.
- Le résumé fait 3 à 4 phrases, personnalisé pour cette offre spécifique, en valorisant les atouts du candidat.
- Les descriptions d'expérience sont réécrites pour intégrer les mots-clés de l'offre, sans déformer les faits.
- Les compétences sont triées par pertinence décroissante pour cette offre.
- Le matchScore reflète objectivement la correspondance réelle profil/offre (0–100).
- Tu réponds UNIQUEMENT en JSON valide selon le schéma demandé, sans markdown ni backticks.`

export async function POST(request: Request) {
  console.log('[generate-cv] START')
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[generate-cv] auth:', user?.id ?? null, authError?.message ?? null)

    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // ── Vérification du quota ──────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, cv_count_this_month')
      .eq('id', user.id)
      .single()
    console.log('[generate-cv] quota select → data:', JSON.stringify(profile), '| error:', profileError ? `${profileError.code} ${profileError.message}` : null)

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Erreur quota', code: profileError.code, details: profileError.message }, { status: 500 })
    }

    // Aucune ligne → on initialise avec les valeurs par défaut
    let quota = profile
    if (!quota) {
      console.log('[generate-cv] no quota row, upserting…')
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, is_premium: false, cv_count_this_month: 0 })
        .select('is_premium, cv_count_this_month')
        .single()
      console.log('[generate-cv] upsert → data:', JSON.stringify(created), '| error:', createError ? `${createError.code} ${createError.message} — ${createError.details}` : null)

      if (createError || !created) {
        return NextResponse.json({ error: 'Impossible d\'initialiser le quota.', code: createError?.code, details: createError?.message }, { status: 500 })
      }
      quota = created
    }

    if (!quota.is_premium && quota.cv_count_this_month >= 1) {
      return NextResponse.json(
        { error: 'QUOTA_EXCEEDED', message: 'Vous avez utilisé votre CV gratuit ce mois-ci. Passez à Premium pour en générer plus.' },
        { status: 403 }
      )
    }

    // ── Profil structuré ──────────────────────────────────────────────────
    const { jobTitle, company, jobDescription } = await request.json()

    const { data: structuredProfile, error: spError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    console.log('[generate-cv] user_profiles → found:', !!structuredProfile, '| error:', spError ? `${spError.code} ${spError.message}` : null)

    if (spError || !structuredProfile) {
      return NextResponse.json({ error: 'Profil introuvable. Complétez votre profil avant de générer un CV.', code: spError?.code, details: spError?.message }, { status: 404 })
    }

    // ── Génération ────────────────────────────────────────────────────────
    const userPrompt = `Génère un CV optimisé pour cette offre à partir du profil structuré ci-dessous.

=== OFFRE CIBLE ===
Poste : ${jobTitle}
Entreprise : ${company}
Description :
${jobDescription}

=== PROFIL DU CANDIDAT ===
${JSON.stringify(structuredProfile, null, 2)}

=== INSTRUCTIONS ===
Le profil contient les champs : full_name, title, summary, experiences (tableau avec title/company/location/start_date/end_date/current/description), education (tableau avec degree/school/start_date/end_date), skills (tableau de strings), languages (tableau avec name/level).

1. Reprends full_name tel quel dans "name".
2. Adapte "title" pour correspondre précisément au poste visé (en t'inspirant du titre existant du candidat).
3. Rédige "summary" en 3-4 phrases qui connectent directement le profil à l'offre, en utilisant les mots-clés de la description. IMPORTANT : le résumé n'invente aucune technologie ou compétence. Il s'appuie UNIQUEMENT sur les compétences listées dans skills[] et les expériences listées dans experiences[]. Si le candidat ne maîtrise pas une technologie citée dans l'offre, ne la mentionne pas.
4. Dans "experience" (sortie) : reprends les entrées de "experiences" (profil). Réordonne par pertinence pour l'offre. Ne modifie JAMAIS company, dates ni title — reformule uniquement description. Pour "period" : formate start_date/end_date en "MM/YYYY – MM/YYYY" ; si current=true, utilise "présent".
5. Dans "skills" : sélectionne parmi les compétences existantes du profil et trie-les par pertinence décroissante pour cette offre. N'ajoute aucune compétence absente du profil. Cette règle s'applique aussi au résumé et aux descriptions d'expérience — aucun outil, langage ou framework ne peut apparaître s'il n'est pas explicitement listé dans skills[].
6. Dans "education" (sortie) : reprends toutes les entrées de "education" (profil). Pour "period" : formate start_date/end_date en "YYYY – YYYY".
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
      .update({ cv_count_this_month: quota.cv_count_this_month + 1 })
      .eq('id', user.id)

    cv.watermark = !quota.is_premium

    return NextResponse.json({ cv, isPremium: quota.is_premium })

  } catch (err: any) {
    console.error('[generate-cv] FATAL ERROR:', err?.message, '| code:', err?.code, '| stack:', err?.stack)
    return NextResponse.json({ error: err?.message ?? 'Erreur inconnue', code: err?.code, details: err?.details }, { status: 500 })
  }
}
