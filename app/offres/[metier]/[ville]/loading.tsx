import SiteHeader from '@/components/SiteHeader'

// Squelette affiché pendant la première génération de la page (mêmes dimensions : pas de saut de mise en page)
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl animate-pulse px-4 pb-16 pt-6 sm:px-6 sm:pt-10" aria-label="Chargement des offres">
        <div className="mb-4 h-3 w-48 rounded bg-black/[0.06]" />
        <div className="h-9 w-3/4 rounded-lg bg-black/[0.08]" />
        <div className="mt-3 h-4 w-2/3 rounded bg-black/[0.06]" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl border border-black/[0.06] bg-white" />
            ))}
          </div>
          <div className="h-52 rounded-2xl bg-[#0071e3]/20" />
        </div>
      </main>
    </div>
  )
}
