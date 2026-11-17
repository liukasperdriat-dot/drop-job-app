import Link from 'next/link'
import { METIERS, offresPath, modelePath } from '@/lib/seo-catalog'
import { Logo } from './SiteHeader'

// Pied de page commun : maillage interne vers les outils, les modèles de CV
// et les offres par ville (indexation rapide par les moteurs de recherche).

const OFFRES_POPULAIRES: [string, string, string][] = [
  ['vendeur', 'paris', 'Vendeur à Paris'],
  ['preparateur-de-commandes', 'lyon', 'Préparateur de commandes à Lyon'],
  ['infirmier', 'marseille', 'Infirmier à Marseille'],
  ['developpeur-web', 'toulouse', 'Développeur web à Toulouse'],
  ['commercial', 'bordeaux', 'Commercial à Bordeaux'],
  ['aide-soignant', 'nantes', 'Aide-soignant à Nantes'],
  ['serveur', 'nice', 'Serveur à Nice'],
  ['comptable', 'lille', 'Comptable à Lille'],
]

const linkClass = 'text-[13px] text-[#6e6e73] no-underline hover:text-[#1d1d1f]'

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/[0.08] bg-white">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#1d1d1f]">Outils gratuits</h2>
          <ul className="space-y-2">
            <li><Link href="/score-ats" className={linkClass}>Score ATS de votre CV</Link></li>
            <li><Link href="/jobs" className={linkClass}>Recherche d&apos;offres</Link></li>
            <li><Link href="/modeles-cv" className={linkClass}>Modèles de CV par métier</Link></li>
            <li><Link href="/offres" className={linkClass}>Offres par métier et ville</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#1d1d1f]">Modèles de CV</h2>
          <ul className="space-y-2">
            {METIERS.filter(m => m.hasCvModel).slice(0, 6).map(m => (
              <li key={m.slug}><Link href={modelePath(m.slug)} className={linkClass}>CV {m.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#1d1d1f]">Offres d&apos;emploi</h2>
          <ul className="space-y-2">
            {OFFRES_POPULAIRES.map(([m, v, label]) => (
              <li key={`${m}-${v}`}><Link href={offresPath(m, v)} className={linkClass}>{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#1d1d1f]">Informations</h2>
          <ul className="space-y-2">
            <li><Link href="/legal/mentions-legales" className={linkClass}>Mentions légales</Link></li>
            <li><Link href="/legal/confidentialite" className={linkClass}>Confidentialité</Link></li>
            <li><Link href="/legal/cgu" className={linkClass}>CGU</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/[0.06]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-5 text-[12px] text-[#aeaeb2] sm:px-6">
          <span className="flex items-center gap-1.5 font-semibold text-[#1d1d1f]"><Logo size={20} /> drop-job</span>
          <span>© {new Date().getFullYear()} Drop-Job</span>
        </div>
      </div>
    </footer>
  )
}
