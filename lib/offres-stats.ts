import type { PageJob } from '@/lib/jobs-server'

// Chiffres propres à une page « métier × ville », calculés sur les offres
// réellement affichées (aucune donnée inventée) : contrats, salaires annoncés,
// part des offres ouvertes aux débutants, niveaux de diplôme demandés.

export type ContractShare = { label: string; count: number; pct: number }

export type OffresStats = {
  total: number
  contracts: ContractShare[]
  salary: { count: number; median: number; low: number; high: number } | null
  debutantPct: number
  diplomas: { label: string; count: number }[]
}

function contractFamily(raw: string): string {
  const c = raw.toLowerCase()
  if (!c) return ''
  if (c.includes('apprenti') || c.includes('alternance') || c.includes('professionnalisation')) return 'Alternance'
  if (c.includes('indétermin') || /\bcdi\b/.test(c)) return 'CDI'
  if (c.includes('intérim') || c.includes('interim') || c.includes('temporaire')) return 'Intérim'
  if (c.includes('saisonn')) return 'Saisonnier'
  if (c.includes('détermin') || /\bcdd\b/.test(c)) return 'CDD'
  if (c.includes('libéral') || c.includes('franchise') || c.includes('indépendant')) return 'Indépendant'
  if (c.includes('partiel')) return 'Temps partiel'
  return 'Autre'
}

// Salaires annuels bruts plausibles uniquement (écarte les erreurs de saisie)
const MIN_ANNUAL = 10_000
const MAX_ANNUAL = 200_000

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

export function computeOffresStats(jobs: PageJob[]): OffresStats {
  const total = jobs.length

  const byContract = new Map<string, number>()
  for (const j of jobs) {
    const family = contractFamily(j.contract)
    if (family) byContract.set(family, (byContract.get(family) ?? 0) + 1)
  }
  const contracted = [...byContract.values()].reduce((a, b) => a + b, 0)
  const contracts = [...byContract.entries()]
    .map(([label, count]) => ({ label, count, pct: Math.round((count / Math.max(contracted, 1)) * 100) }))
    .sort((a, b) => b.count - a.count)

  const salaries: { mid: number; low: number; high: number }[] = []
  for (const j of jobs) {
    const low = j.salaryMin ?? j.salaryMax
    const high = j.salaryMax ?? j.salaryMin
    if (low == null || high == null) continue
    if (low < MIN_ANNUAL || high > MAX_ANNUAL) continue
    salaries.push({ mid: (low + high) / 2, low, high })
  }
  // Au moins 3 offres chiffrées pour publier une médiane qui ait du sens
  const salary = salaries.length >= 3
    ? {
        count: salaries.length,
        median: median(salaries.map(s => s.mid)),
        low: Math.min(...salaries.map(s => s.low)),
        high: Math.max(...salaries.map(s => s.high)),
      }
    : null

  const debutantPct = total ? Math.round((jobs.filter(j => j.debutant).length / total) * 100) : 0

  const byDiploma = new Map<string, number>()
  for (const j of jobs) {
    const d = j.diploma.trim()
    if (d) byDiploma.set(d, (byDiploma.get(d) ?? 0) + 1)
  }
  const diplomas = [...byDiploma.entries()]
    .map(([label, count]) => ({ label, count }))
    .filter(d => d.count >= 2) // un niveau cité une seule fois n'est pas une tendance
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return { total, contracts, salary, debutantPct, diplomas }
}

const euros = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

/** 24 000 € → « 24 000 € brut/an (≈ 2 000 € par mois) » */
export function formatAnnual(value: number): string {
  const yearly = Math.round(value / 100) * 100
  const monthly = Math.round(value / 12 / 10) * 10
  return `${euros.format(yearly)} € brut/an (≈ ${euros.format(monthly)} € par mois)`
}

export function formatK(value: number): string {
  return `${euros.format(Math.round(value / 1000))} k€`
}
