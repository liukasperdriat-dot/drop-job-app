import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import JsonLd, { breadcrumb } from '@/components/JsonLd'
import { computeOffresStats, formatAnnual, formatK, type OffresStats } from '@/lib/offres-stats'
import CvForJobButton from '@/components/CvForJobButton'
import { METIERS, VILLES, findMetier, findVille, offresPath, modelePath } from '@/lib/seo-catalog'
import { findModele } from '@/lib/cv-modeles'
import { getJobsForPage, type PageJob } from '@/lib/jobs-server'

// Pages générées à la première visite puis régénérées toutes les heures
export const revalidate = 3600
export const dynamicParams = true
export function generateStaticParams() {
  return []
}

type Params = { metier: string; ville: string }

function resolve(params: Params) {
  const metier = findMetier(params.metier)
  const ville = findVille(params.ville)
  return metier && ville ? { metier, ville } : null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = resolve(await params)
  if (!found) return {}
  const { metier, ville } = found
  const path = offresPath(metier.slug, ville.slug)
  const { jobs } = await getJobsForPage(metier.keyword, ville.label)
  const stats = computeOffresStats(jobs)
  const title = `Offres d'emploi ${metier.label} à ${ville.label} | Drop-Job`
  const details = [
    jobs.length > 0 ? `${jobs.length} offres récentes` : '',
    stats.salary ? `salaire médian annoncé ${formatK(stats.salary.median)} brut/an` : '',
    stats.contracts[0] ? `${stats.contracts[0].pct} % en ${stats.contracts[0].label}` : '',
  ].filter(Boolean).join(', ')
  const description = `Offres d'emploi ${metier.label} à ${ville.label}${details ? ` : ${details}` : ''}. Réunies depuis France Travail et Adzuna, avec un CV adapté à chaque offre par l'IA, gratuitement.`
  return {
    title,
    description,
    alternates: { canonical: path },
    // Aucune offre en ce moment (ou sources en panne) : page à ne pas indexer,
    // mais ses liens restent suivis. Elle redevient indexable dès qu'il y a des offres.
    ...(jobs.length === 0 ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, url: path, type: 'website', siteName: 'Drop-Job', locale: 'fr_FR' },
  }
}

export default async function OffresMetierVillePage({ params }: { params: Promise<Params> }) {
  const found = resolve(await params)
  if (!found) notFound()
  const { metier, ville } = found
  const modele = metier.hasCvModel ? findModele(metier.slug) : undefined
  const { jobs, failed } = await getJobsForPage(metier.keyword, ville.label)
  // Sources d'offres en panne : on lève une erreur plutôt que d'enregistrer une
  // page vide. Next.js garde alors la dernière version valide en cache (ou affiche
  // error.tsx à la toute première visite), et retente à la visite suivante.
  if (failed) throw new Error(`Sources d'offres indisponibles (${metier.slug}/${ville.slug})`)
  const stats = computeOffresStats(jobs)
  const searchUrl = `/jobs?${new URLSearchParams({ q: metier.keyword, location: ville.label })}`
  const path = offresPath(metier.slug, ville.slug)

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <JsonLd data={breadcrumb([
        { name: 'Accueil', path: '/' },
        { name: 'Offres par métier', path: '/offres' },
        { name: `${metier.label} à ${ville.label}`, path },
      ])} />
      {jobs.length > 0 && (
        // Page de liste : ItemList (et non JobPosting, réservé par Google à la page d'une offre unique)
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Offres d'emploi ${metier.label} à ${ville.label}`,
          numberOfItems: jobs.length,
          itemListElement: jobs.map((job, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: [job.title, job.company].filter(Boolean).join(' — '),
            ...(job.applyUrl ? { url: job.applyUrl } : {}),
          })),
        }} />
      )}
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-[#6e6e73]">
          <Link href="/" className="no-underline hover:text-[#1d1d1f]">Accueil</Link>
          <span className="mx-1.5">›</span>
          <Link href="/offres" className="no-underline hover:text-[#1d1d1f]">Offres par métier</Link>
          <span className="mx-1.5">›</span>
          <span className="text-[#1d1d1f]">{metier.label} à {ville.label}</span>
        </nav>

        <h1 className="text-[clamp(26px,4.5vw,40px)] font-semibold leading-tight tracking-tight">
          Offres d&apos;emploi {metier.label} à {ville.label}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] font-light text-[#6e6e73]">
          {jobs.length > 0
            ? `${jobs.length} offres récentes de ${metier.label.toLowerCase()} à ${ville.label} et alentours, réunies depuis France Travail et Adzuna. Pour chacune, Drop-Job adapte votre CV aux mots-clés de l'annonce en 30 secondes.`
            : `Les offres de ${metier.label.toLowerCase()} à ${ville.label}, réunies depuis France Travail et Adzuna, avec un CV adapté à chaque annonce en 30 secondes.`}
        </p>

        {modele && (
          <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Compétences recherchées">
            {modele.competences.slice(0, 6).map(c => (
              <span key={c} className="rounded-full border border-black/[0.08] bg-white px-3 py-1 text-xs text-[#3a3a3c]">{c}</span>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
          <section aria-label="Offres d'emploi">
            {jobs.length > 0 ? (
              <ul className="space-y-3">
                {jobs.map((job, i) => <JobCard key={job.id || i} job={job} />)}
              </ul>
            ) : (
              <div className="rounded-2xl border border-black/[0.08] bg-white p-6 text-center">
                <p className="text-[15px] text-[#6e6e73]">
                  {`Aucune offre de ${metier.label.toLowerCase()} trouvée à ${ville.label} en ce moment.`}
                </p>
                <Link href={searchUrl} className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[#0071e3] px-5 text-sm font-semibold text-white no-underline hover:bg-[#0062c4]">
                  Lancer la recherche en direct →
                </Link>
              </div>
            )}
            {jobs.length > 0 && (
              <p className="mt-5 text-center">
                <Link href={searchUrl} className="text-sm font-medium text-[#0071e3] no-underline hover:underline">
                  Filtrer ces offres (contrat, salaire, niveau d&apos;études…) →
                </Link>
              </p>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-2xl bg-[#0071e3] p-5 text-white shadow-lg shadow-[#0071e3]/20">
              <p className="text-[17px] font-semibold leading-snug">Un CV adapté à chaque offre, en 30 secondes</p>
              <p className="mt-2 text-sm text-white/80">L&apos;IA reprend vos vraies expériences et les mots-clés de l&apos;annonce. 1 CV gratuit par mois, sans carte bancaire.</p>
              <Link href="/auth/register?next=/cv" className="mt-4 flex min-h-[44px] items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#0071e3] no-underline hover:bg-white/90">
                Créer mon CV gratuitement
              </Link>
            </div>
            <div className="rounded-2xl border border-black/[0.08] bg-white p-5 text-sm">
              <p className="font-semibold">Préparez votre candidature</p>
              <ul className="mt-3 space-y-2">
                {modele && <li><Link href={modelePath(modele.slug)} className="text-[#0071e3] no-underline hover:underline">Modèle de CV {metier.label.toLowerCase()} →</Link></li>}
                <li><Link href="/score-ats" className="text-[#0071e3] no-underline hover:underline">Tester mon CV face à une offre (score ATS) →</Link></li>
                <li><Link href="/pricing" className="text-[#0071e3] no-underline hover:underline">CV et lettres illimités : voir les tarifs →</Link></li>
              </ul>
            </div>
          </aside>
        </div>

        <MarcheSection metierLabel={metier.label} villeLabel={ville.label} stats={stats} modele={modele} />

        <section className="mt-14 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">{metier.label} dans d&apos;autres villes</h2>
            <ul className="flex flex-wrap gap-2">
              {VILLES.filter(v => v.slug !== ville.slug).map(v => (
                <li key={v.slug}>
                  <Link href={offresPath(metier.slug, v.slug)} className="inline-block rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs text-[#3a3a3c] no-underline hover:border-[#0071e3]/40">{v.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Autres métiers à {ville.label}</h2>
            <ul className="flex flex-wrap gap-2">
              {METIERS.filter(m => m.slug !== metier.slug).map(m => (
                <li key={m.slug}>
                  <Link href={offresPath(m.slug, ville.slug)} className="inline-block rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs text-[#3a3a3c] no-underline hover:border-[#0071e3]/40">{m.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function JobCard({ job }: { job: PageJob }) {
  const tags = [job.contract, job.salary, job.debutant ? 'Débutant accepté' : '', job.diploma].filter(Boolean)
  const excerpt = job.description.replace(/\s+/g, ' ').slice(0, 220)
  return (
    <li className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug">{job.title}</h3>
          <p className="mt-0.5 text-sm text-[#6e6e73]">{[job.company, job.location].filter(Boolean).join(' · ')}</p>
        </div>
        <span className="shrink-0 rounded-full border border-black/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#aeaeb2]">{job.source}</span>
      </div>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map(t => <span key={t} className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs text-[#3a3a3c]">{t}</span>)}
        </div>
      )}
      {excerpt && <p className="mt-3 text-sm leading-relaxed text-[#6e6e73]">{excerpt}{job.description.length > 220 ? '…' : ''}</p>}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <CvForJobButton job={job} />
        {job.applyUrl && (
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer nofollow"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-black/[0.14] px-4 text-sm font-medium text-[#1d1d1f] no-underline hover:bg-[#f5f5f7]">
            Voir l&apos;offre officielle
          </a>
        )}
      </div>
    </li>
  )
}

// Contenu propre à chaque page : chiffres tirés des offres affichées, puis
// compétences et conseils du métier (repris du modèle de CV correspondant).
function MarcheSection({ metierLabel, villeLabel, stats, modele }: {
  metierLabel: string
  villeLabel: string
  stats: OffresStats
  modele: ReturnType<typeof findModele>
}) {
  const metierLower = metierLabel.toLowerCase()
  const hasFigures = stats.total > 0
  if (!hasFigures && !modele) return null
  return (
    <section className="mt-14" aria-labelledby="marche-titre">
      <h2 id="marche-titre" className="text-xl font-semibold tracking-tight">
        Le marché {metierLower} à {villeLabel}
      </h2>

      {hasFigures && (
        <>
          <p className="mt-1 text-xs text-[#aeaeb2]">D&apos;après les {stats.total} offres affichées ci-dessus, mises à jour toutes les heures.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#aeaeb2]">Salaire annoncé</h3>
              {stats.salary ? (
                <>
                  <p className="mt-2 text-[22px] font-semibold tracking-tight">{formatK(stats.salary.median)} <span className="text-sm font-normal text-[#6e6e73]">médian brut/an</span></p>
                  <p className="mt-1 text-sm text-[#6e6e73]">
                    Soit {formatAnnual(stats.salary.median)}. Fourchette observée : {formatK(stats.salary.low)} à {formatK(stats.salary.high)}, sur {stats.salary.count} offres qui précisent le salaire (temps partiels compris).
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-[#6e6e73]">Trop peu d&apos;offres de {metierLower} à {villeLabel} indiquent un salaire en ce moment pour publier une médiane fiable.</p>
              )}
            </div>
            <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#aeaeb2]">Types de contrat</h3>
              {stats.contracts.length > 0 ? (
                <ul className="mt-2 space-y-1.5 text-sm">
                  {stats.contracts.slice(0, 4).map(c => (
                    <li key={c.label} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-[#3a3a3c]">{c.label}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8e8ed]" aria-hidden="true">
                        <span className="block h-full rounded-full bg-[#0071e3]" style={{ width: `${c.pct}%` }} />
                      </span>
                      <span className="w-10 shrink-0 text-right tabular-nums text-[#6e6e73]">{c.pct} %</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[#6e6e73]">Type de contrat non précisé dans les offres actuelles.</p>
              )}
            </div>
            <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#aeaeb2]">Profils recherchés</h3>
              <p className="mt-2 text-[22px] font-semibold tracking-tight">{stats.debutantPct} % <span className="text-sm font-normal text-[#6e6e73]">ouvertes aux débutants</span></p>
              {stats.diplomas.length > 0 && (
                <p className="mt-1 text-sm text-[#6e6e73]">
                  Niveaux demandés le plus souvent : {stats.diplomas.map(d => `${d.label} (${d.count})`).join(', ')}.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {modele && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-[15px] font-semibold">Compétences attendues</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {[...modele.competences, ...modele.qualites].map(c => (
                <li key={c} className="rounded-full border border-black/[0.08] bg-white px-3 py-1 text-xs text-[#3a3a3c]">{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold">Réussir sa candidature de {metierLower} à {villeLabel}</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-[#3a3a3c]">
              {modele.conseils.map(c => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
