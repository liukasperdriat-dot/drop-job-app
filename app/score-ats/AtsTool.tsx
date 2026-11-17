'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { AtsResult } from '@/lib/ats-score'
import { saveOfferDraft } from '@/lib/cv-link'

const MAX = 15000

function scoreColor(score: number) {
  if (score >= 75) return '#1d8348'
  if (score >= 50) return '#b45309'
  return '#c0392b'
}

function scoreVerdict(score: number) {
  if (score >= 85) return 'Excellent : votre CV parle le même langage que l’offre.'
  if (score >= 70) return 'Bon score, mais quelques mots-clés importants manquent encore.'
  if (score >= 50) return 'Score moyen : un logiciel de tri risque d’écarter votre CV.'
  return 'Score faible : votre CV ne reprend pas les mots-clés de l’offre.'
}

export default function AtsTool() {
  const [cv, setCv] = useState('')
  const [offer, setOffer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AtsResult | null>(null)
  // Mots-clés manquants réservés au Premium (seul leur nombre est reçu)
  const [lockedMissing, setLockedMissing] = useState(0)
  const [premium, setPremium] = useState(false)

  async function analyze(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (cv.trim().length < 50) { setError('Collez le texte complet de votre CV.'); return }
    if (offer.trim().length < 50) { setError('Collez le texte complet de l’offre d’emploi.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/score-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, offer }),
      })
      const data = await res.json().catch(() => ({ error: 'L’analyse a échoué. Réessayez.' }))
      if (!res.ok || !data.result) { setError(data.error || 'L’analyse a échoué. Réessayez.'); return }
      setResult(data.result)
      setLockedMissing(typeof data.lockedMissing === 'number' ? data.lockedMissing : 0)
      setPremium(data.premium === true)
      // Affiche le résultat sur mobile, où il se trouve sous le formulaire
      requestAnimationFrame(() => document.getElementById('resultat-ats')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch {
      setError('Connexion impossible. Vérifiez votre accès à Internet puis réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const textarea = 'w-full resize-y rounded-xl border border-black/[0.14] bg-white px-3.5 py-3 text-base text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:border-[#0071e3]/50 focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 sm:text-sm'

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <form onSubmit={analyze} className="space-y-4 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm sm:p-6">
        <div>
          <label htmlFor="ats-cv" className="mb-1.5 flex justify-between text-sm font-semibold text-[#1d1d1f]">
            1. Le texte de votre CV <span className="font-normal text-[#aeaeb2]">{cv.length.toLocaleString('fr-FR')} / 15 000</span>
          </label>
          <textarea id="ats-cv" rows={8} maxLength={MAX} value={cv} onChange={e => setCv(e.target.value)} className={textarea}
            placeholder="Ouvrez votre CV (Word, PDF…), sélectionnez tout le texte, copiez-le puis collez-le ici." />
        </div>
        <div>
          <label htmlFor="ats-offre" className="mb-1.5 flex justify-between text-sm font-semibold text-[#1d1d1f]">
            2. Le texte de l&apos;offre d&apos;emploi <span className="font-normal text-[#aeaeb2]">{offer.length.toLocaleString('fr-FR')} / 15 000</span>
          </label>
          <textarea id="ats-offre" rows={8} maxLength={MAX} value={offer} onChange={e => setOffer(e.target.value)} className={textarea}
            placeholder="Copiez l'annonce complète : missions, profil recherché, compétences…" />
        </div>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#0071e3] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0062c4] disabled:cursor-not-allowed disabled:bg-[#e8e8ed] disabled:text-[#aeaeb2]">
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
          {loading ? 'Analyse en cours…' : 'Calculer mon score ATS'}
        </button>
        <p className="text-xs text-[#aeaeb2]">Gratuit et sans inscription. Vos textes sont analysés puis oubliés : rien n&apos;est enregistré.</p>
      </form>

      <div id="resultat-ats" className="scroll-mt-20 min-h-[320px] rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm sm:p-6" aria-live="polite">
        {loading ? <ResultSkeleton /> : result ? <ResultView result={result} offer={offer} lockedMissing={lockedMissing} premium={premium} /> : <ResultEmpty />}
      </div>
    </div>
  )
}

function ResultEmpty() {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-[#e8e8ed] text-2xl font-bold text-[#aeaeb2]">?</div>
      <p className="text-sm font-medium text-[#6e6e73]">Votre score apparaîtra ici</p>
      <p className="mt-1 text-xs text-[#aeaeb2]">Collez votre CV et l&apos;offre, puis lancez l&apos;analyse.</p>
    </div>
  )
}

function ResultSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Analyse en cours">
      <div className="mx-auto h-28 w-28 rounded-full bg-[#f0f0f3]" />
      <div className="mx-auto h-4 w-2/3 rounded bg-[#f0f0f3]" />
      <div className="h-3 w-full rounded bg-[#f0f0f3]" />
      <div className="h-3 w-5/6 rounded bg-[#f0f0f3]" />
      <div className="h-12 w-full rounded-xl bg-[#f0f0f3]" />
    </div>
  )
}

function ResultView({ result, offer, lockedMissing, premium }: { result: AtsResult; offer: string; lockedMissing: number; premium: boolean }) {
  const color = scoreColor(result.score)
  const circumference = 2 * Math.PI * 52
  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <svg width="132" height="132" viewBox="0 0 120 120" role="img" aria-label={`Score ATS : ${result.score} sur 100`}>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#f0f0f3" strokeWidth="10" />
          <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference * (1 - result.score / 100)} transform="rotate(-90 60 60)" />
          <text x="60" y="58" textAnchor="middle" fontSize="30" fontWeight="700" fill={color}>{result.score}</text>
          <text x="60" y="78" textAnchor="middle" fontSize="11" fill="#6e6e73">sur 100</text>
        </svg>
        <p className="mt-2 text-[15px] font-semibold text-[#1d1d1f]">{scoreVerdict(result.score)}</p>
      </div>

      {result.missing.length > 0 && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-amber-800">
            {premium ? `Mots-clés absents de votre CV (${result.missing.length})` : 'Mots-clés critiques absents de votre CV'}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {result.missing.map(k => (
              <li key={k} className="rounded-full border border-amber-300 bg-white px-3 py-1 text-sm font-medium text-amber-900">{k}</li>
            ))}
          </ul>
          {lockedMissing > 0 && <LockedKeywords count={lockedMissing} offer={offer} />}
        </div>
      )}

      {result.matched.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1d8348]">Déjà présents ({result.matched.length})</h3>
          <ul className="flex flex-wrap gap-1.5">
            {result.matched.map(k => <li key={k} className="rounded-full bg-[#1d8348]/[0.08] px-2.5 py-1 text-xs text-[#1d8348]">✓ {k}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">Structure du CV</h3>
        <ul className="grid gap-1 sm:grid-cols-2">
          {result.checks.map(c => (
            <li key={c.label} className={`text-xs ${c.ok ? 'text-[#3a3a3c]' : 'text-[#c0392b]'}`}>{c.ok ? '✓' : '✗'} {c.label}</li>
          ))}
        </ul>
      </div>

      <Link
        href="/auth/register?next=/cv"
        onClick={() => saveOfferDraft(offer)}
        className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#0071e3] px-4 py-3 text-center text-[15px] font-semibold leading-snug text-white no-underline shadow-md shadow-[#0071e3]/25 hover:bg-[#0062c4]"
      >
        Corriger automatiquement mon CV pour atteindre 90 %+ avec l&apos;IA
      </Link>
      <p className="mt-2 text-center text-xs text-[#6e6e73]">Gratuit · L&apos;IA réécrit votre CV avec les mots-clés de cette offre, sans rien inventer.</p>
    </div>
  )
}

// Aperçu flouté des autres mots-clés manquants (réservés au Premium).
// Les étiquettes affichées sont factices : les vrais mots-clés ne sont pas envoyés au navigateur.
const FILLER = ['Gestion des priorités', 'Outils bureautiques', 'Suivi qualité', 'Planification', 'Relation fournisseurs', 'Reporting hebdo', 'Esprit d’équipe', 'Normes sécurité']

function LockedKeywords({ count, offer }: { count: number; offer: string }) {
  return (
    <div className="relative mt-3 overflow-hidden rounded-lg">
      <ul aria-hidden="true" className="pointer-events-none flex select-none flex-wrap gap-2 blur-[5px]">
        {FILLER.slice(0, Math.min(count, FILLER.length)).map(k => (
          <li key={k} className="rounded-full border border-amber-300 bg-white px-3 py-1 text-sm font-medium text-amber-900">{k}</li>
        ))}
      </ul>
      <div className="absolute inset-0 flex items-center justify-center bg-amber-50/40 p-2">
        <Link
          href="/pricing?next=%2Fcv"
          onClick={() => saveOfferDraft(offer)}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 text-center text-[13px] font-semibold text-white no-underline shadow-md hover:bg-black"
        >
          🔒 Voir {count === 1 ? 'l’autre mot-clé manquant' : `les ${count} autres mots-clés manquants`}
        </Link>
      </div>
    </div>
  )
}
