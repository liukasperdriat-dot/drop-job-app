import { createAdminClient } from '@/lib/supabase/admin'

// Limite d'utilisation des fonctions IA (protection contre les abus de l'API OpenAI).
// Chaque appel est noté dans la table public.ai_usage (cf. supabase/ai-usage.sql),
// lue et écrite uniquement avec la clé service_role.
//
// Si la table est absente ou inaccessible, l'appel est autorisé (et l'erreur
// journalisée) : une panne de comptage ne doit pas bloquer les utilisateurs.

export type AiUsageKind = 'profile_import' | 'letter_preview'

export async function consumeAiUsage(
  userId: string,
  kind: AiUsageKind,
  max: number,
  windowMs: number,
): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - windowMs).toISOString()

    const { count, error } = await admin
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('kind', kind)
      .gte('created_at', since)

    if (error) {
      console.error('[ai-usage] lecture impossible:', error.code, error.message)
      return true
    }
    if ((count ?? 0) >= max) return false

    const { error: insertError } = await admin.from('ai_usage').insert({ user_id: userId, kind })
    if (insertError) console.error('[ai-usage] écriture impossible:', insertError.code, insertError.message)
    return true
  } catch (err) {
    console.error('[ai-usage] erreur:', err instanceof Error ? err.message : err)
    return true
  }
}
