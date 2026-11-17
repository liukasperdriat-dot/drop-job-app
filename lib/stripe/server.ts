import Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'

// Outils Stripe partagés par le paiement (Checkout), sa confirmation et le webhook.
// À n'importer que côté serveur : la clé secrète ne doit jamais partir au navigateur.

export type BillingPeriod = 'monthly' | 'weekly'

export const isBillingPeriod = (value: unknown): value is BillingPeriod =>
  value === 'monthly' || value === 'weekly'

let client: Stripe | null = null

/** Client Stripe, ou null si la clé secrète n'est pas configurée. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!client) client = new Stripe(key)
  return client
}

/** Identifiant du prix Stripe d'une formule (liste fermée côté serveur). */
export function priceIdFor(period: BillingPeriod): string | null {
  const id = period === 'weekly' ? process.env.STRIPE_PRICE_WEEKLY : process.env.STRIPE_PRICE_MONTHLY
  return id && id.startsWith('price_') ? id : null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const idOf = (value: string | { id: string } | null | undefined): string | null =>
  typeof value === 'string' ? value : value?.id ?? null

/** Session payée (ou sans paiement dû, ex. code promo à 100 %) */
export function isSessionPaid(session: Stripe.Checkout.Session): boolean {
  return session.status === 'complete' &&
    (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')
}

export type ActivationResult =
  | { ok: true; profileId: string }
  | { ok: false; reason: 'not_paid' | 'profile_not_found' }

/**
 * Passe au statut Premium le compte lié à une session Checkout payée.
 * Idempotent : appeler deux fois avec la même session donne le même résultat.
 * Lève une erreur si la base de données refuse l'écriture (le webhook renvoie
 * alors 500 et Stripe retente plus tard).
 */
export async function activatePremiumFromSession(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<ActivationResult> {
  if (!isSessionPaid(session)) return { ok: false, reason: 'not_paid' }

  const profileId = await findProfileId(admin, session)
  if (!profileId) return { ok: false, reason: 'profile_not_found' }

  const update: Record<string, unknown> = { is_premium: true }
  const customer = idOf(session.customer)
  const subscription = idOf(session.subscription)
  if (customer) update.stripe_customer_id = customer
  if (subscription) update.stripe_subscription_id = subscription

  const { error } = await admin.from('profiles').update(update).eq('id', profileId)
  if (error) throw new Error(`mise à jour Premium : ${error.message}`)
  return { ok: true, profileId }
}

// Retrouve le compte : d'abord par l'identifiant transmis à Stripe
// (client_reference_id ou metadata.user_id), sinon par l'e-mail saisi sur Stripe.
async function findProfileId(admin: SupabaseClient, session: Stripe.Checkout.Session): Promise<string | null> {
  const ref = session.client_reference_id || session.metadata?.user_id || null
  if (ref && UUID.test(ref)) {
    const { data } = await admin.from('profiles').select('id').eq('id', ref).maybeSingle()
    if (data) return data.id as string
    // Le compte existe mais n'a pas encore de ligne profiles : on la crée.
    const { data: user } = await admin.auth.admin.getUserById(ref)
    if (user?.user) {
      const { error } = await admin.from('profiles').upsert({ id: ref, email: user.user.email })
      if (!error) return ref
    }
  }

  const email = session.customer_details?.email
  if (email) {
    // Comparaison insensible à la casse ; % et _ sont échappés pour ne pas servir de jokers.
    const pattern = email.replace(/[\\%_]/g, '\\$&')
    const { data } = await admin.from('profiles').select('id').ilike('email', pattern).limit(1).maybeSingle()
    if (data) return data.id as string
  }

  return null
}
