import { createBrowserClient } from '@supabase/ssr'
import { navigatorLock, NavigatorLockAcquireTimeoutError } from '@supabase/supabase-js'

// Verrou de session partagé entre onglets.
//
// Supabase demande le verrou « sans attendre » (délai 0) à chaque tick du
// rafraîchissement automatique du jeton. Quand un autre onglet ou un autre appel
// le détient, la version d'origine lève l'erreur À L'INTÉRIEUR du rappel passé à
// navigator.locks.request : certains navigateurs la signalent alors comme
// « Uncaught (in promise) … immediately failed », bien que Supabase l'intercepte.
// Ici, l'indisponibilité est renvoyée comme une valeur, et l'erreur n'est levée
// qu'en dehors du LockManager, où Supabase l'attrape et ignore ce tick.
const NOT_AVAILABLE = Symbol('lock-not-available')

async function sessionLock<R>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
  if (acquireTimeout !== 0 || !locks?.request) return navigatorLock(name, acquireTimeout, fn)

  const result = await locks.request(name, { mode: 'exclusive', ifAvailable: true }, async lock =>
    lock ? fn() : NOT_AVAILABLE,
  )
  if (result === NOT_AVAILABLE) {
    throw new NavigatorLockAcquireTimeoutError(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`)
  }
  return result as R
}

// Filet de sécurité : un conflit de verrou n'a aucune conséquence (la session est
// relue au tick suivant). On l'empêche seulement d'apparaître comme erreur non
// interceptée ; toute autre erreur reste visible.
let guardInstalled = false
function installLockRejectionGuard() {
  if (guardInstalled || typeof window === 'undefined') return
  guardInstalled = true
  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason as { isAcquireTimeout?: unknown; message?: unknown } | null
    const isLockConflict = reason?.isAcquireTimeout === true
      || (typeof reason?.message === 'string' && reason.message.includes('Navigator LockManager lock'))
    if (isLockConflict) event.preventDefault()
  })
}

export function createClient() {
  installLockRejectionGuard()
  // createBrowserClient renvoie une instance unique dans le navigateur
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { lock: sessionLock } },
  )
}
