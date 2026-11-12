'use client'

import { useState } from 'react'

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function openPortal() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError(data.error || 'Une erreur est survenue.')
    } catch {
      setError('Une erreur est survenue.')
    }
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={openPortal}
        disabled={loading}
        style={{
          padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 500,
          cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
        }}
      >
        {loading ? 'Ouverture…' : 'Gérer mon abonnement'}
      </button>
      {error && <div style={{ fontSize: 12, color: '#fff', marginTop: 8, opacity: 0.85 }}>{error}</div>}
    </div>
  )
}
