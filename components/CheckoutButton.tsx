'use client'

import { useState } from 'react'

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly')

  async function handleCheckout() {
    setLoading(true)

const priceId = period === 'monthly'
  ? 'price_1TPmCXD7v3UUsIMkWgxoRWEl'
  : 'price_1TPmD6D7v3UUsIMkxBejoz9u'

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.toggle}>
        <button
          style={{ ...styles.tBtn, ...(period === 'monthly' ? styles.tBtnOn : {}) }}
          onClick={() => setPeriod('monthly')}
        >
          9,90€/mois
        </button>
        <button
          style={{ ...styles.tBtn, ...(period === 'weekly' ? styles.tBtnOn : {}) }}
          onClick={() => setPeriod('weekly')}
        >
          3,49€/semaine
        </button>
      </div>
      <button onClick={handleCheckout} disabled={loading} style={styles.btn}>
        {loading ? 'Redirection…' : 'Passer Premium →'}
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 },
  toggle: {
    display: 'flex', background: '#f5f5f7',
    borderRadius: 100, padding: 3, gap: 2,
    border: '1px solid rgba(0,0,0,0.08)', width: 'fit-content',
  },
  tBtn: {
    padding: '6px 16px', borderRadius: 100, border: 'none',
    background: 'transparent', color: '#6e6e73',
    fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  tBtnOn: {
    background: '#fff', color: '#1d1d1f',
    boxShadow: '0 1px 4px rgba(0,0,0,.1)',
  },
  btn: {
    padding: '11px 20px', borderRadius: 10,
    background: '#0071e3', color: '#fff', border: 'none',
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit', width: 'fit-content',
  },
}