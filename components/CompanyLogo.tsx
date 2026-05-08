'use client'

import { useState } from 'react'

const STOP_WORDS = new Set([
  'interim','intérim','emploi','group','groupe','rh','conseil','consulting',
  'france','recrutement','recruitment','solutions','services','management',
  'international','sa','sas','sarl','srl','inc','ltd','gmbh','bv','nv',
  'the','and','et','de','du','le','la','les','en','par',
])

function companyToDomain(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
    .join('')
  const base = slug || name.toLowerCase().replace(/\s+/g, '')
  return `${base}.fr`
}

function nameColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  const palette = [
    '#1d1d1f','#0071e3','#1d8348','#b45309','#7d3c98',
    '#154360','#0e6655','#784212','#922b21','#1a5276',
  ]
  return palette[Math.abs(h) % palette.length]
}

function companyInitials(name: string): string {
  const words = name.trim().replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export default function CompanyLogo({ company, size = 38 }: { company: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const domain  = companyToDomain(company)
  const logoUrl = `https://img.logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGODEV_TOKEN}&size=128&format=png`
  const radius  = Math.round(size * 0.24)

  if (failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius,
        background: nameColor(company),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.34), fontWeight: 600, color: '#fff',
        letterSpacing: '-0.01em', flexShrink: 0,
      }}>
        {companyInitials(company)}
      </div>
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: '#f5f5f7', border: '1px solid rgba(0,0,0,.06)',
      overflow: 'hidden', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      <img
        src={logoUrl}
        alt={company}
        onError={() => setFailed(true)}
        style={{ width: Math.round(size * 0.74), height: Math.round(size * 0.74), objectFit: 'contain' }}
      />
    </div>
  )
}
