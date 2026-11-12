// Nombre de CV générés ce mois-ci, en tenant compte de la remise à zéro
// mensuelle (colonne cv_count_period au format 'AAAA-MM').
export function currentCvCount(profile: { cv_count_this_month?: number | null; cv_count_period?: string | null } | null | undefined): number {
  if (!profile) return 0
  const count = profile.cv_count_this_month ?? 0
  if ('cv_count_period' in profile && profile.cv_count_period !== new Date().toISOString().slice(0, 7)) return 0
  return count
}
