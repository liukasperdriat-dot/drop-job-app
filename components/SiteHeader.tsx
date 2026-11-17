import Link from 'next/link'

// En-tête des pages publiques (outils, offres par ville, modèles de CV)
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-black/[0.08] bg-[#f5f5f7]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[#1d1d1f] no-underline">
          <Logo />
          drop-job
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 text-[13px] sm:flex">
          <Link href="/jobs" className="rounded-full px-3 py-1.5 text-[#6e6e73] no-underline hover:text-[#1d1d1f]">Offres</Link>
          <Link href="/modeles-cv" className="rounded-full px-3 py-1.5 text-[#6e6e73] no-underline hover:text-[#1d1d1f]">Modèles de CV</Link>
          <Link href="/score-ats" className="rounded-full px-3 py-1.5 text-[#6e6e73] no-underline hover:text-[#1d1d1f]">Score ATS gratuit</Link>
          <Link href="/pricing" className="rounded-full px-3 py-1.5 text-[#6e6e73] no-underline hover:text-[#1d1d1f]">Tarifs</Link>
        </nav>
        <Link
          href="/auth/register?next=/cv"
          className="inline-flex min-h-[40px] items-center rounded-full bg-[#0071e3] px-4 text-[13px] font-medium text-white no-underline hover:bg-[#0062c4]"
        >
          Créer mon CV
        </Link>
      </div>
    </header>
  )
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={size} height={size} aria-hidden="true">
      <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="2.2" fill="none" />
      <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.45" />
      <circle cx="20" cy="20" r="7.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline points="17,20.5 20,23.5 23,20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
