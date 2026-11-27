import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentCvCount } from '@/lib/quota'

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
  // Restitution du CV gratuit réservé, appelée sur toute erreur après la réservation
  let refundReservation: (() => Promise<void>) | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // ── Vérification du quota ──────────────────────────────────────────────
    // Lecture/écriture via la clé service_role : les utilisateurs n'ont plus
    // le droit de modifier eux-mêmes la table profiles (cf. supabase/profiles-securite.sql).
    const admin = createAdminClient()
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[generate-cv] quota select error:', profileError.code, profileError.message)
      return NextResponse.json({ error: 'Erreur lors de la vérification du quota.' }, { status: 500 })
    }

    // Aucune ligne → on initialise avec les valeurs par défaut
    let quota = profile
    if (!quota) {
      const { data: created, error: createError } = await admin
        .from('profiles')
        .upsert({ id: user.id, email: user.email, is_premium: false, cv_count_this_month: 0 })
        .select('*')
        .single()

      if (createError || !created) {
        console.error('[generate-cv] quota init error:', createError?.code, createError?.message)
        return NextResponse.json({ error: 'Impossible d\'initialiser le quota.' }, { status: 500 })
      }
      quota = created
    }

    // Remise à zéro mensuelle du compteur (si la colonne cv_count_period existe)
    const currentPeriod = new Date().toISOString().slice(0, 7) // 'AAAA-MM'
    const hasPeriod = 'cv_count_period' in quota
    const cvCount = currentCvCount(quota)

    const quotaExceeded = () => NextResponse.json(
      { error: 'QUOTA_EXCEEDED', message: 'Vous avez utilisé votre CV gratuit ce mois-ci. Passez à Premium pour en générer plus.' },
      { status: 403 }
    )
    if (!quota.is_premium && cvCount >= 1) return quotaExceeded()

    // ── Offre ─────────────────────────────────────────────────────────────
    const body = await request.json().catch(() => null) as { jobTitle?: unknown; company?: unknown; jobDescription?: unknown } | null
    const field = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
    const jobTitle = field(body?.jobTitle, 200)
    const company = field(body?.company, 200)
    const jobDescription = field(body?.jobDescription, 15000)
    if (!jobTitle || !company || !jobDescription) {
      return NextResponse.json({ error: 'Renseignez le poste, l’entreprise et la description de l’offre.' }, { status: 400 })
    }

    // ── Profil structuré ──────────────────────────────────────────────────

    const { data: structuredProfile, error: spError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (spError || !structuredProfile) {
      if (spError && spError.code !== 'PGRST116') console.error('[generate-cv] user_profiles error:', spError.code, spError.message)
      return NextResponse.json({ error: 'Profil introuvable. Complétez votre profil avant de générer un CV.' }, { status: 404 })
    }

    // ── Réservation du CV gratuit ─────────────────────────────────────────
    // Mise à jour conditionnelle (« compare-and-swap ») : elle n'aboutit que si la
    // ligne est restée exactement dans l'état lu plus haut — compteur ET période.
    // Deux générations simultanées (double clic, deux onglets) : la seconde ne
    // modifie aucune ligne et reçoit QUOTA_EXCEEDED. La période fait partie de la
    // condition : sans elle, deux demandes lancées au changement de mois (compteur
    // encore à 1 sur le mois précédent) réussissaient toutes les deux.
    const storedCount = quota.cv_count_this_month ?? null
    const storedPeriod = hasPeriod ? (quota.cv_count_period ?? null) : undefined
    const reserve = hasPeriod
      ? { cv_count_this_month: cvCount + 1, cv_count_period: currentPeriod }
      : { cv_count_this_month: cvCount + 1 }
    if (!quota.is_premium) {
      let reservation = admin.from('profiles').update(reserve).eq('id', user.id)
      reservation = storedCount === null
        ? reservation.is('cv_count_this_month', null)
        : reservation.eq('cv_count_this_month', storedCount)
      if (storedPeriod !== undefined) {
        reservation = storedPeriod === null
          ? reservation.is('cv_count_period', null)
          : reservation.eq('cv_count_period', storedPeriod)
      }
      const { data: reserved, error: reserveError } = await reservation.select('id')
      if (reserveError) {
        console.error('[generate-cv] quota reserve error:', reserveError.code, reserveError.message)
        return NextResponse.json({ error: 'Erreur lors de la vérification du quota.' }, { status: 500 })
      }
      if (!reserved?.length) return quotaExceeded()
    }
    // CV gratuit rendu si la génération n'aboutit pas. Conditionnel lui aussi :
    // il n'annule que SA réservation (ligne encore à cvCount + 1 sur ce mois).
    let refunded = false
    const refund = async () => {
      if (quota.is_premium || refunded) return
      refunded = true
      let undo = admin.from('profiles').update({ cv_count_this_month: cvCount }).eq('id', user.id).eq('cv_count_this_month', cvCount + 1)
      if (hasPeriod) undo = undo.eq('cv_count_period', currentPeriod)
      const { error } = await undo
      if (error) console.error('[generate-cv] quota refund error:', error.code, error.message)
    }
    refundReservation = refund

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
9. Liste 2–3 "matchStrengths" : points forts du profil pour cette offre (max 10 mots chacun, uniquement des faits du profil).
10. Liste 1–3 "matchGaps" : exigences de l'offre absentes ou faibles dans le profil (max 10 mots chacun). Tableau vide si le profil couvre tout.

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
  "matchStrengths": ["Point fort 1", "Point fort 2"],
  "matchGaps": ["Point à renforcer 1"]
}`

    let completion: OpenAI.Chat.Completions.ChatCompletion
    try {
      completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      })
    } catch (err) {
      await refund()
      throw err
    }

    const content = completion.choices[0]?.message.content || '{}'
    let cv: any
    try {
      cv = JSON.parse(content)
    } catch {
      cv = null
    }
    // Réponse vide ou incomplète : rien d'utilisable, le CV gratuit est rendu
    if (!cv || typeof cv !== 'object' || typeof cv.name !== 'string' || !Array.isArray(cv.experience)) {
      await refund()
      return NextResponse.json({ error: 'Réponse IA invalide, réessayez.' }, { status: 500 })
    }

    // ── Compteur des comptes Premium (statistiques, sans limite) ──────────
    if (quota.is_premium) {
      const { error: countError } = await admin.from('profiles').update(reserve).eq('id', user.id)
      if (countError) console.error('[generate-cv] quota update error:', countError.code, countError.message)
    }

    // Score de matching nettoyé (affiché à tous les utilisateurs)
    const shortList = (value: unknown) => Array.isArray(value)
      ? value.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map(x => x.trim().slice(0, 120)).slice(0, 3)
      : []
    const score = Number(cv.matchScore)
    cv.matchScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null
    cv.matchStrengths = shortList(cv.matchStrengths)
    cv.matchGaps = shortList(cv.matchGaps)

    cv.watermark = !quota.is_premium

    return NextResponse.json({ cv, isPremium: quota.is_premium })

  } catch (err) {
    const e = err as Error
    console.error('[generate-cv] FATAL ERROR:', e?.message, '| stack:', e?.stack)
    if (refundReservation) await refundReservation().catch(() => {})
    return NextResponse.json({ error: 'La génération du CV a échoué. Réessayez dans un instant.' }, { status: 500 })
  }
}
