// Adresse de retour après connexion (?next=…).
// Seuls les chemins internes au site sont acceptés : « /cv?title=… » oui,
// « //autre-site.com », « https://… » ou « @autre-site.com » non.
export function safeNext(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value) return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  if (/[\r\n\t]/.test(value) || value.length > 2000) return fallback
  return value
}

export const NEXT_COOKIE = 'dropjob_next'

// Avant une connexion Google ou une inscription par e-mail : on mémorise la page
// de retour dans un cookie (1 h), lu par /auth/callback. Cela évite d'ajouter
// des paramètres à l'URL de retour, qui doit rester identique à celle autorisée
// dans Supabase.
export function rememberNext(next: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${NEXT_COOKIE}=${encodeURIComponent(safeNext(next))}; path=/; max-age=3600; samesite=lax`
}

// Lien entre connexion et inscription : on transmet ?next= s'il existe
export function keepNext(e: { preventDefault: () => void }, path: string) {
  const next = nextFromLocation()
  if (next === '/dashboard') return
  e.preventDefault()
  window.location.assign(`${path}?next=${encodeURIComponent(next)}`)
}

// Lit ?next= dans l'adresse de la page courante (côté navigateur)
export function nextFromLocation(fallback = '/dashboard'): string {
  if (typeof window === 'undefined') return fallback
  return safeNext(new URLSearchParams(window.location.search).get('next'), fallback)
}
