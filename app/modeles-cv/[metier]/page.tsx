import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import JsonLd, { breadcrumb } from '@/components/JsonLd'
import { MODELES_CV, findModele, type ModeleCv } from '@/lib/cv-modeles'
import { TOP_VILLES, offresPath, modelePath } from '@/lib/seo-catalog'

// 20 pages statiques, générées au build
export const dynamicParams = false
export function generateStaticParams() {
  return MODELES_CV.map(m => ({ metier: m.slug }))
}

type Params = { metier: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const modele = findModele((await params).metier)
  if (!modele) return {}
  const title = `Modèle de CV ${modele.metier} : exemple gratuit et conseils | Drop-Job`
  const description = `Exemple de CV ${modele.metier.toLowerCase()} à suivre, compétences clés attendues par les recruteurs et conseils concrets. Personnalisez ce modèle avec votre profil grâce à l'IA.`
  return {
    title,
    description,
    alternates: { canonical: modelePath(modele.slug) },
    openGraph: { title, description, url: modelePath(modele.slug), type: 'article' },
  }
}

export default async function ModeleCvPage({ params }: { params: Promise<Params> }) {
  const modele = findModele((await params).metier)
  if (!modele) notFound()
  const autres = MODELES_CV.filter(m => m.slug !== modele.slug)

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <JsonLd data={breadcrumb([
        { name: 'Accueil', path: '/' },
        { name: 'Modèles de CV', path: '/modeles-cv' },
        { name: `CV ${modele.metier}`, path: modelePath(modele.slug) },
      ])} />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-[#6e6e73]">
          <Link href="/" className="no-underline hover:text-[#1d1d1f]">Accueil</Link>
          <span className="mx-1.5">›</span>
          <Link href="/modeles-cv" className="no-underline hover:text-[#1d1d1f]">Modèles de CV</Link>
          <span className="mx-1.5">›</span>
          <span className="text-[#1d1d1f]">{modele.metier}</span>
        </nav>

        <h1 className="text-[clamp(26px,4.5vw,40px)] font-semibold leading-tight tracking-tight">
          Modèle de CV {modele.metier} : exemple et conseils
        </h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[#6e6e73]">{modele.intro}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
          <CvExemple modele={modele} />

          <aside className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-2xl bg-[#0071e3] p-5 text-white shadow-lg shadow-[#0071e3]/20">
              <p className="text-[17px] font-semibold leading-snug">Ce modèle, avec votre parcours</p>
              <p className="mt-2 text-sm text-white/80">L&apos;IA met en forme vos vraies expériences et les adapte à l&apos;offre visée, en 30 secondes.</p>
              <Link href="/auth/register?next=/cv" className="mt-4 flex min-h-[48px] items-center justify-center rounded-xl bg-white px-4 text-center text-sm font-semibold text-[#0071e3] no-underline hover:bg-white/90">
                Personnaliser ce modèle avec mon profil
              </Link>
              <p className="mt-2 text-center text-xs text-white/70">1 CV gratuit par mois · sans carte bancaire</p>
            </div>
            <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
              <p className="text-sm font-semibold">Offres de {modele.metier.toLowerCase()}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {TOP_VILLES.map(v => (
                  <li key={v.slug}>
                    <Link href={offresPath(modele.slug, v.slug)} className="inline-block rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs text-[#3a3a3c] no-underline hover:text-[#0071e3]">{v.label}</Link>
                  </li>
                ))}
              </ul>
              <Link href="/score-ats" className="mt-4 block text-sm text-[#0071e3] no-underline hover:underline">Tester mon CV actuel (score ATS) →</Link>
            </div>
          </aside>
        </div>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black/[0.08] bg-white p-6">
            <h2 className="text-lg font-semibold tracking-tight">Compétences clés d&apos;un {modele.metier.toLowerCase()}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {modele.competences.map(c => <li key={c} className="rounded-full bg-[#0071e3]/[0.07] px-3 py-1.5 text-sm text-[#0062c4]">{c}</li>)}
            </ul>
            <h3 className="mt-6 text-sm font-semibold">Qualités appréciées</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {modele.qualites.map(q => <li key={q} className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-sm text-[#3a3a3c]">{q}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-black/[0.08] bg-white p-6">
            <h2 className="text-lg font-semibold tracking-tight">3 conseils pour un CV de {modele.metier.toLowerCase()} efficace</h2>
            <ol className="mt-4 space-y-3">
              {modele.conseils.map((c, i) => (
                <li key={c} className="flex gap-3 text-sm leading-relaxed text-[#3a3a3c]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-xs font-bold text-white">{i + 1}</span>
                  {c}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Autres modèles de CV</h2>
          <ul className="flex flex-wrap gap-2">
            {autres.map(m => (
              <li key={m.slug}>
                <Link href={modelePath(m.slug)} className="inline-block rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs text-[#3a3a3c] no-underline hover:border-[#0071e3]/40">CV {m.metier}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

// Exemple de CV mis en page comme une feuille A4
function CvExemple({ modele }: { modele: ModeleCv }) {
  const e = modele.exemple
  return (
    <article aria-label={`Exemple de CV ${modele.metier}`} className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm sm:p-10">
      <p className="mb-4 inline-block rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6e6e73]">Exemple fictif</p>
      <header className="border-b-2 border-[#1d1d1f] pb-4">
        <p className="text-2xl font-bold tracking-tight">{e.nom}</p>
        <p className="mt-1 text-[15px] font-medium text-[#0071e3]">{e.titre}</p>
        <p className="mt-1 text-xs text-[#6e6e73]">{e.ville} · prenom.nom@email.fr · 06 00 00 00 00</p>
      </header>
      <p className="mt-4 text-sm leading-relaxed text-[#3a3a3c]">{e.accroche}</p>

      <CvSection title="Expérience professionnelle">
        <div className="space-y-4">
          {e.experiences.map(x => (
            <div key={x.poste + x.periode}>
              <div className="flex flex-col justify-between gap-0.5 sm:flex-row sm:items-baseline">
                <p className="text-sm font-semibold">{x.poste}</p>
                <p className="text-xs text-[#6e6e73]">{x.periode}</p>
              </div>
              <p className="text-xs italic text-[#6e6e73]">{x.entreprise}</p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm text-[#3a3a3c]">
                {x.missions.map(m => <li key={m}>{m}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </CvSection>

      <CvSection title="Formation">
        {e.formation.map(f => (
          <div key={f.diplome} className="flex flex-col justify-between gap-0.5 sm:flex-row sm:items-baseline">
            <p className="text-sm"><span className="font-semibold">{f.diplome}</span> — {f.ecole}</p>
            <p className="text-xs text-[#6e6e73]">{f.annee}</p>
          </div>
        ))}
      </CvSection>

      <CvSection title="Compétences">
        <p className="text-sm text-[#3a3a3c]">{modele.competences.join(' · ')}</p>
      </CvSection>

      {e.langues.length > 0 && (
        <CvSection title="Langues et permis">
          <p className="text-sm text-[#3a3a3c]">{e.langues.join(' · ')}</p>
        </CvSection>
      )}
    </article>
  )
}

function CvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 border-b border-black/[0.1] pb-1 text-[11px] font-bold uppercase tracking-widest text-[#1d1d1f]">{title}</h2>
      {children}
    </section>
  )
}
