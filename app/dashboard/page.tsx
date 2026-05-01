import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import CheckoutButton from '@/components/CheckoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Récupérer le vrai profil depuis Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, cv_count_this_month')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.is_premium || false
  const cvUsed = profile?.cv_count_this_month || 0
  const cvMax = isPremium ? '∞' : 1
  const cvPct = isPremium ? 0 : Math.min((cvUsed / 1) * 100, 100)

  const v = {
    bg: '#f5f5f7', white: '#fff',
    text: '#1d1d1f', text2: '#6e6e73', text3: '#aeaeb2',
    line: 'rgba(0,0,0,0.08)', line2: 'rgba(0,0,0,0.14)',
    blue: '#0071e3',
    shadow: '0 1px 2px rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.05)',
    shadow2: '0 2px 6px rgba(0,0,0,.07), 0 8px 28px rgba(0,0,0,.07)',
  }

  return (
    <div style={{ minHeight: '100vh', background: v.bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, height: 52, background: 'rgba(245,245,247,0.92)', backdropFilter: 'blur(24px) saturate(180%)', borderBottom: `1px solid ${v.line}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: v.text, fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>
            <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
              <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="2.2" fill="none"/>
              <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.45"/>
              <circle cx="20" cy="20" r="7.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="17,20.5 20,23.5 23,20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            drop-job
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/jobs" style={{ fontSize: 13, color: v.text2, textDecoration: 'none', padding: '5px 13px', borderRadius: 100 }}>Offres</Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 600, letterSpacing: '-0.04em', marginBottom: 4 }}>
            Bonjour 👋
          </h1>
          <p style={{ fontSize: 15, color: v.text2, fontWeight: 300 }}>{user.email}</p>
        </div>

        {/* Bento grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 36 }}>

          {/* Quota CV */}
          <div style={{ background: v.white, borderRadius: 18, border: `1px solid ${v.line}`, padding: '24px 22px', boxShadow: v.shadow }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: v.text3, marginBottom: 14 }}>
              CV ce mois-ci
            </div>
            <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.04em', marginBottom: 8 }}>
              {cvUsed}<span style={{ fontSize: 18, color: v.text3 }}> / {cvMax}</span>
            </div>
            {!isPremium && (
              <>
                <div style={{ height: 4, background: '#e8e8ed', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${cvPct}%`, background: cvPct >= 100 ? '#c0392b' : v.blue, borderRadius: 2, transition: 'width .3s' }} />
                </div>
                <div style={{ fontSize: 12, color: cvPct >= 100 ? '#c0392b' : v.text3 }}>
                  {cvPct >= 100 ? 'Quota atteint ce mois-ci' : `${cvUsed} utilisé${cvUsed > 1 ? 's' : ''} sur 1`}
                </div>
              </>
            )}
            {isPremium && (
              <div style={{ fontSize: 12, color: '#1d8348', fontWeight: 500 }}>✓ CV illimités</div>
            )}
          </div>

          {/* Statut abonnement */}
          <div style={{ background: isPremium ? v.blue : v.white, borderRadius: 18, border: `1.5px solid ${isPremium ? v.blue : v.line}`, padding: '24px 22px', boxShadow: isPremium ? '0 0 0 3px rgba(0,113,227,.1)' : v.shadow }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: isPremium ? 'rgba(255,255,255,0.6)' : v.text3, marginBottom: 14 }}>
              Abonnement
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: isPremium ? '#fff' : v.text, marginBottom: 8 }}>
              {isPremium ? 'Premium ✨' : 'Gratuit'}
            </div>
            {!isPremium && (
              <div style={{ marginTop: 12 }}>
                <CheckoutButton />
              </div>
            )}
            {isPremium && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Merci de votre confiance !</div>
            )}
          </div>

          {/* Accès rapide */}
          <div style={{ background: v.white, borderRadius: 18, border: `1px solid ${v.line}`, padding: '24px 22px', boxShadow: v.shadow }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: v.text3, marginBottom: 14 }}>
              Accès rapide
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/jobs" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: v.bg, border: `1px solid ${v.line}`, textDecoration: 'none', color: v.text, fontSize: 13, fontWeight: 500 }}>
                <span>🔍</span> Chercher des offres
              </Link>
              <Link href="/cv" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(0,113,227,.07)', border: '1px solid rgba(0,113,227,.14)', textDecoration: 'none', color: v.blue, fontSize: 13, fontWeight: 500 }}>
                <span>✨</span> Générer un CV
              </Link>
            </div>
          </div>
        </div>

        {/* Candidatures */}
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.025em', marginBottom: 16 }}>Vos candidatures</div>
          <div style={{ background: v.white, borderRadius: 18, border: `1px solid ${v.line}`, padding: '48px 24px', textAlign: 'center', boxShadow: v.shadow }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: v.text, marginBottom: 6 }}>Aucune candidature pour l'instant.</div>
            <div style={{ fontSize: 13, color: v.text2, marginBottom: 20 }}>Parcourez les offres et générez votre premier CV IA.</div>
            <Link href="/jobs" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 100, background: v.blue, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Voir les offres
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}