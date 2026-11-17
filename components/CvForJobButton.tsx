'use client'

import { useEffect, useState } from 'react'
import { openCvForJob } from '@/lib/cv-link'
import type { PageJob } from '@/lib/jobs-server'

// « Créer mon CV pour cette offre » : garde l'offre puis passe par l'inscription
// (un utilisateur déjà connecté est renvoyé directement sur /cv).
export default function CvForJobButton({ job }: { job: PageJob }) {
  const [loading, setLoading] = useState(false)
  // Retour arrière depuis la page suivante (page restaurée du cache) : bouton réactivé
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => { if (e.persisted) setLoading(false) }
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])
  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true)
        openCvForJob(job, url => { window.location.href = `/auth/register?next=${encodeURIComponent(url)}` })
      }}
      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0071e3] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0062c4] disabled:cursor-wait disabled:opacity-70"
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />}
      {loading ? 'Ouverture…' : 'Créer mon CV pour cette offre'}
    </button>
  )
}
