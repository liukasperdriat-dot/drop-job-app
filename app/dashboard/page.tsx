import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import CheckoutButton from '@/components/CheckoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="#1d1d1f" strokeWidth="2.2" fill="none"/>
              <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="#1d1d1f" strokeWidth="1.5" fill="none" opacity="0.45"/>
              <circle cx="20" cy="20" r="7.5" stroke="#1d1d1f" strokeWidth="1.8" fill="none"/>
              <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="17,20.5 20,23.5 23,20.5" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span style={styles.logoText}>drop-job</span>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <div style={styles.content}>
        <h1 style={styles.title}>Bonjour 👋</h1>
        <p style={styles.email}>{user.email}</p>

        <div style={styles.quotaCard}>
          <div style={styles.quotaLabel}>CV gratuit ce mois-ci</div>
          <div style={styles.quotaBar}>
            <div style={{ ...styles.quotaFill, width: '33%' }} />
          </div>
          <div style={styles.quotaMeta}>1 / 1 utilisé · <CheckoutButton /></div>
        </div>

        <div style={styles.sectionTitle}>Vos candidatures</div>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <div style={styles.emptyText}>Aucune candidature pour l'instant.</div>
          <div style={styles.emptyHint}>Parcourez les offres et générez votre premier CV IA.</div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Inter', -apple-system, sans-serif" },
  nav: { position: 'sticky', top: 0, zIndex: 100, height: 52, background: 'rgba(245,245,247,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.08)' },
  navInner: { maxWidth: 1080, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 7 },
  logoText: { fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: '#1d1d1f' },
  content: { maxWidth: 1080, margin: '0 auto', padding: '48px 24px' },
  title: { fontSize: 32, fontWeight: 600, letterSpacing: '-0.04em', color: '#1d1d1f', marginBottom: 4 },
  email: { fontSize: 15, color: '#6e6e73', marginBottom: 32 },
  quotaCard: { background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', padding: '20px 22px', marginBottom: 32, maxWidth: 400, boxShadow: '0 1px 2px rgba(0,0,0,.05)' },
  quotaLabel: { fontSize: 13, fontWeight: 500, color: '#1d1d1f', marginBottom: 10 },
  quotaBar: { height: 6, background: '#e8e8ed', borderRadius: 3, marginBottom: 8 },
  quotaFill: { height: '100%', background: '#0071e3', borderRadius: 3 },
  quotaMeta: { fontSize: 12, color: '#6e6e73' },
  blue: { color: '#0071e3', cursor: 'pointer' },
  sectionTitle: { fontSize: 18, fontWeight: 600, letterSpacing: '-0.025em', color: '#1d1d1f', marginBottom: 16 },
  emptyState: { background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', padding: '40px 24px', textAlign: 'center', maxWidth: 400 },
  emptyIcon: { fontSize: 32, marginBottom: 12 },
  emptyText: { fontSize: 15, fontWeight: 500, color: '#1d1d1f', marginBottom: 6 },
  emptyHint: { fontSize: 13, color: '#6e6e73' },
}