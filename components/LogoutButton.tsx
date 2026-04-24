'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} style={styles.btn}>
      Déconnexion
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    padding: '6px 16px', borderRadius: 100,
    background: 'transparent', color: '#6e6e73',
    border: '1px solid rgba(0,0,0,0.14)',
    fontSize: 13, fontWeight: 400, cursor: 'pointer',
    fontFamily: 'inherit',
  },
}