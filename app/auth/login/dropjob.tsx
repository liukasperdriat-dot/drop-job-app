'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const router   = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="#1d1d1f" strokeWidth="2.2" fill="none"/>
            <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="#1d1d1f" strokeWidth="1.5" fill="none" opacity="0.45"/>
            <circle cx="20" cy="20" r="7.5" stroke="#1d1d1f" strokeWidth="1.8" fill="none"/>
            <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="17,20.5 20,23.5 23,20.5" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={styles.logoText}>drop-job</span>
        </div>

        <h1 style={styles.title}>Connexion</h1>
        <p style={styles.sub}>Content de vous revoir.</p>

        <button onClick={handleGoogle} style={styles.googleBtn} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine}/>
          <span style={styles.dividerText}>ou</span>
          <span style={styles.dividerLine}/>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required style={styles.input}/>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={styles.input}/>
          </div>
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <Link href="/auth/register" style={styles.link}>Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif" },
  card: { background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 6px rgba(0,0,0,.07), 0 8px 28px rgba(0,0,0,.07)', padding: '36px 32px', width: '100%', maxWidth: 420 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 },
  logoText: { fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: '#1d1d1f' },
  title: { fontSize: 26, fontWeight: 600, letterSpacing: '-0.035em', color: '#1d1d1f', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6e6e73', marginBottom: 24, fontWeight: 300 },
  googleBtn: { width: '100%', padding: '11px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: '#1d1d1f' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' },
  dividerText: { fontSize: 12, color: '#aeaeb2' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  errorBox: { background: 'rgba(192,57,43,.05)', border: '1px solid rgba(192,57,43,.15)', borderRadius: 8, padding: '10px 13px', fontSize: 13, color: '#c0392b' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 500, color: '#1d1d1f' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', fontSize: 15, fontFamily: 'inherit', color: '#1d1d1f', outline: 'none', background: '#fff' },
  submitBtn: { marginTop: 4, padding: '12px', borderRadius: 10, background: '#0071e3', color: '#fff', border: 'none', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  footer: { textAlign: 'center' as const, fontSize: 13, color: '#6e6e73', marginTop: 20 },
  link: { color: '#0071e3', textDecoration: 'none', fontWeight: 500 },
}