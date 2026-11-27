import { createAdminClient } from '@/lib/supabase/admin'

// Suivi des conversions côté serveur (table conversion_events, voir
// supabase/conversion-events.sql). Aucun cookie, aucun script tiers.
//
// Ne lève jamais d'erreur : un échec d'enregistrement ne doit pas bloquer
// une inscription, une génération ou un paiement.

export type ConversionEvent =
  | 'signup'
  | 'profile_completed'
  | 'cv_generated'
  | 'checkout_opened'
  | 'subscription_paid'

type Metadata = Record<string, string | number | boolean | null>

let tableMissingLogged = false

export async function trackConversion(event: ConversionEvent, userId: string | null, metadata: Metadata = {}): Promise<void> {
  try {
    const { error } = await createAdminClient()
      .from('conversion_events')
      .insert({ event, user_id: userId, metadata })
    if (!error) return
    // Déjà compté (inscription, profil complété, rejeu du webhook) : normal
    if (error.code === '23505') return
    if (error.code === '42P01' || error.code === 'PGRST205') {
      if (!tableMissingLogged) {
        tableMissingLogged = true
        console.warn('[conversions] table conversion_events absente : exécuter supabase/conversion-events.sql')
      }
      return
    }
    console.error('[conversions] enregistrement impossible :', event, error.code, error.message)
  } catch (err) {
    console.error('[conversions] enregistrement impossible :', event, err instanceof Error ? err.message : err)
  }
}

/** Compte créé il y a moins d'une heure : la connexion correspond à une inscription. */
export function isNewAccount(createdAt: string | undefined): boolean {
  if (!createdAt) return false
  const age = Date.now() - new Date(createdAt).getTime()
  return age >= 0 && age < 60 * 60 * 1000
}

/** Profil exploitable pour générer un CV : nom, titre et au moins une expérience. */
export function isProfileComplete(profile: { full_name?: unknown; title?: unknown; experiences?: unknown } | null | undefined): boolean {
  if (!profile) return false
  const filled = (v: unknown) => typeof v === 'string' && v.trim() !== ''
  return filled(profile.full_name) && filled(profile.title) && Array.isArray(profile.experiences) && profile.experiences.length > 0
}
