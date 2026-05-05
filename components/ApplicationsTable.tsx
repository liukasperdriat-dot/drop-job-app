'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUSES = ['En cours', 'Entretien', 'Accepté', 'Refusé'] as const

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  'En cours':  { bg: 'rgba(0,113,227,.08)',  color: '#0071e3' },
  'Entretien': { bg: 'rgba(180,83,9,.08)',   color: '#b45309' },
  'Accepté':   { bg: 'rgba(29,131,72,.12)',  color: '#1d8348' },
  'Refusé':    { bg: 'rgba(192,57,43,.07)',  color: '#c0392b' },
  'Relancé':   { bg: 'rgba(180,83,9,.08)',   color: '#b45309' },
}

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? { bg: 'rgba(0,0,0,.05)', color: '#6e6e73' }
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return "à l'instant"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'hier'
  if (days < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`
  const months = Math.floor(days / 30)
  if (months < 12) return `il y a ${months} mois`
  return `il y a ${Math.floor(months / 12)} an${Math.floor(months / 12) > 1 ? 's' : ''}`
}

const v = {
  bg: '#f5f5f7', white: '#fff',
  text: '#1d1d1f', text2: '#6e6e73', text3: '#aeaeb2',
  line: 'rgba(0,0,0,0.08)',
  blue: '#0071e3',
  shadow: '0 1px 2px rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.05)',
  shadow2: '0 2px 6px rgba(0,0,0,.07), 0 8px 28px rgba(0,0,0,.07)',
}

const COLS = '1fr 160px 130px 80px 36px'

export default function ApplicationsTable({ initialApps }: { initialApps: any[] }) {
  const [apps, setApps]           = useState(initialApps)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setApps(prev => prev.filter(a => a.id !== id))
    fetch(`/api/applications/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setOpenMenuId(null)
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {})
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.025em' }}>Mes candidatures</div>
        {apps.length > 0 && (
          <div style={{ fontSize: 13, color: v.text3 }}>{apps.length} candidature{apps.length > 1 ? 's' : ''}</div>
        )}
      </div>

      {apps.length === 0 ? (
        <div style={{ background: v.white, borderRadius: 18, border: `1px solid ${v.line}`, padding: '48px 24px', textAlign: 'center', boxShadow: v.shadow }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: v.text, marginBottom: 6 }}>Aucune candidature pour l'instant.</div>
          <div style={{ fontSize: 13, color: v.text2, marginBottom: 20 }}>Parcourez les offres et générez votre premier CV IA.</div>
          <Link href="/jobs" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 100, background: v.blue, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Voir les offres
          </Link>
        </div>
      ) : (
        <>
          {/* Overlay to close open menu on outside click */}
          {openMenuId && (
            <div onClick={() => setOpenMenuId(null)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
          )}

          <div style={{ background: v.white, borderRadius: 18, border: `1px solid ${v.line}`, overflow: 'hidden', boxShadow: v.shadow }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '11px 20px', borderBottom: `1px solid ${v.line}`, background: v.bg }}>
              {(['Poste · Entreprise', 'Statut', 'Contrat', 'Date'] as const).map(label => (
                <div key={label} style={{ fontSize: 11, fontWeight: 600, color: v.text3, letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</div>
              ))}
              <div />
            </div>

            {apps.map((app: any, i: number) => {
              const s = statusStyle(app.status)
              const isHovered = hoveredId === app.id
              return (
                <div
                  key={app.id}
                  onMouseEnter={() => setHoveredId(app.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: COLS,
                    padding: '14px 20px',
                    alignItems: 'center',
                    borderBottom: i < apps.length - 1 ? `1px solid ${v.line}` : 'none',
                    background: isHovered ? 'rgba(0,0,0,.015)' : 'transparent',
                    transition: 'background .1s',
                  }}
                >
                  {/* Poste + entreprise */}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: v.text, marginBottom: 2 }}>{app.job_title}</div>
                    <div style={{ fontSize: 12, color: v.text2 }}>{app.company}{app.location ? ` · ${app.location}` : ''}</div>
                  </div>

                  {/* Badge statut cliquable */}
                  <div style={{ position: 'relative' }}>
                    <span
                      onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 11px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, cursor: 'pointer', userSelect: 'none' }}
                    >
                      {app.status}
                      <svg viewBox="0 0 8 5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width={8} height={5}>
                        <polyline points="1,1 4,4 7,1" />
                      </svg>
                    </span>

                    {openMenuId === app.id && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: v.white, border: `1px solid ${v.line}`, borderRadius: 10, boxShadow: v.shadow2, overflow: 'hidden', minWidth: 130 }}>
                        {STATUSES.map(st => {
                          const ss = statusStyle(st)
                          const isActive = app.status === st
                          return (
                            <div
                              key={st}
                              onClick={() => handleStatusChange(app.id, st)}
                              style={{ padding: '8px 14px', fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? ss.color : v.text, background: isActive ? ss.bg : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                              <span style={{ width: 10, display: 'inline-flex', flexShrink: 0 }}>
                                {isActive && (
                                  <svg viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={10} height={8}>
                                    <polyline points="1,4 4,7 9,1" />
                                  </svg>
                                )}
                              </span>
                              {st}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Contrat */}
                  <div style={{ fontSize: 12, color: v.text2 }}>{app.contract || '—'}</div>

                  {/* Date */}
                  <div style={{ fontSize: 12, color: v.text3 }}>{formatRelativeDate(app.created_at)}</div>

                  {/* Bouton supprimer */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleDelete(app.id)}
                      title="Supprimer"
                      style={{ width: 28, height: 28, borderRadius: 8, background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: v.text3, opacity: isHovered ? 1 : 0, transition: 'opacity .15s' }}
                      onMouseEnter={e => { const b = e.currentTarget; b.style.color = '#c0392b'; b.style.background = 'rgba(192,57,43,.07)' }}
                      onMouseLeave={e => { const b = e.currentTarget; b.style.color = v.text3; b.style.background = 'none' }}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                        <polyline points="3,4 13,4" />
                        <path d="M5.5 4V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1" />
                        <path d="M10 4l-.5 8H6.5L6 4" />
                        <line x1="6.5" y1="7" x2="6.5" y2="11" />
                        <line x1="9.5" y1="7" x2="9.5" y2="11" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
