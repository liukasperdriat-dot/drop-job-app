// Ancienne adresse du webhook Stripe, gardée pour ne rien casser tant que
// l'endpoint configuré dans Stripe n'a pas été changé pour /api/webhooks/stripe.
// Même traitement (signature, anti-doublon, mise à jour du Premium).
export { POST } from '../webhooks/stripe/route'
