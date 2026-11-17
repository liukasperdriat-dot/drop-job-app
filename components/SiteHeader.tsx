'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from './Logo'

export { Logo }

// En-tête unique de tout le site : mêmes liens sur chaque page.
// Seul le lien de compte change selon la connexion (Connexion / Mon espace).

export const NAV_LINKS = [
  { href: '/jobs', label: 'Offres' },
  { href: '/modeles-cv', label: 'Modèles de CV' },
  { href: '/score-ats', label: 'Score ATS gratuit' },
  { href: '/pricing', label: 'Tarifs' },
] as const

type AuthState = 'unknown' | 'in' | 'out'

function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>('unknown')
  useEffect(() => {
    const supabase = createClient()
    // Session lue dans les cookies du navigateur : pas d'appel réseau
    supabase.auth.getSession()
      .then(({ data }) => setState(data.session ? 'in' : 'out'))
      .catch(() => setState('out'))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setState(session ? 'in' : 'out'))
    return () => sub.subscription.unsubscribe()
  }, [])
  return state
}

export default function SiteHeader() {
  const pathname = usePathname() || '/'
  const auth = useAuthState()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Menu mobile : fermé à chaque changement de page, touche Échap, page figée derrière
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) { setMenuPath(pathname); setOpen(false) }
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', onKey) }
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const loggedIn = auth === 'in'
  const account = loggedIn
    ? { href: '/dashboard', label: 'Mon espace' }
    : { href: '/auth/login', label: 'Connexion' }
  const ctaHref = loggedIn ? '/cv' : '/auth/register?next=/cv'

  async function logout() {
    setLoggingOut(true)
    try {
      await createClient().auth.signOut()
      // Efface les copies de pages gardées par le service worker sur cet appareil
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map(k => caches.delete(k)))
      }
    } catch {
      // sans incidence sur la déconnexion
    }
    window.location.assign('/')
  }

  return (
    <>
    <header className="sticky top-0 z-[200] h-14 border-b border-black/[0.08] bg-[#f5f5f7]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[#1d1d1f] no-underline">
          <Logo />
          drop-job
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 text-[13px] md:flex">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={`rounded-full px-3 py-1.5 no-underline hover:text-[#1d1d1f] ${isActive(l.href) ? 'font-medium text-[#1d1d1f]' : 'text-[#6e6e73]'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Largeur réservée : pas de décalage quand l'état de connexion arrive */}
          <span className="hidden min-w-[88px] justify-end md:flex">
            {auth !== 'unknown' && (
              <Link
                href={account.href}
                aria-current={isActive(account.href) ? 'page' : undefined}
                className="rounded-full px-3 py-1.5 text-[13px] text-[#6e6e73] no-underline hover:text-[#1d1d1f]"
              >
                {account.label}
              </Link>
            )}
          </span>
          <Link
            href={ctaHref}
            className="inline-flex min-h-[40px] items-center whitespace-nowrap rounded-full bg-[#0071e3] px-4 text-[13px] font-medium text-white no-underline hover:bg-[#0062c4]"
          >
            Créer mon CV
          </Link>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#1d1d1f] hover:bg-black/[0.05] md:hidden"
          >
            <svg viewBox="0 0 20 20" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              {open
                ? <><line x1="5" y1="5" x2="15" y2="15" /><line x1="15" y1="5" x2="5" y2="15" /></>
                : <><line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" /></>}
            </svg>
          </button>
        </div>
      </div>
    </header>

      {/* Hors du <header> : son flou d'arrière-plan limiterait le menu à la hauteur de l'en-tête */}
      {open && (
        <div id="menu-mobile" className="fixed inset-x-0 bottom-0 top-14 z-[199] overflow-y-auto bg-[#f5f5f7] px-6 pb-8 md:hidden">
          <nav aria-label="Menu" className="flex flex-col">
            {[...NAV_LINKS, account].map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={`border-b border-black/[0.08] py-4 text-[22px] font-medium tracking-tight no-underline ${isActive(l.href) ? 'text-[#0071e3]' : 'text-[#1d1d1f]'}`}
              >
                {l.label}
              </Link>
            ))}
            {loggedIn && (
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="border-b border-black/[0.08] py-4 text-left text-[22px] font-medium tracking-tight text-[#6e6e73] disabled:opacity-60"
              >
                {loggingOut ? 'Déconnexion…' : 'Déconnexion'}
              </button>
            )}
          </nav>
          <Link
            href={ctaHref}
            onClick={() => setOpen(false)}
            className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-[#0071e3] text-base font-medium text-white no-underline"
          >
            Créer mon CV
          </Link>
        </div>
      )}
    </>
  )
}
