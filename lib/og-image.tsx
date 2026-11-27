import { ImageResponse } from 'next/og'

// Image d'aperçu de partage (LinkedIn, WhatsApp, X…) commune à tout le site :
// 1200 × 630, aux couleurs de Drop-Job. Chaque page n'en change que les textes.

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

export function renderOgImage({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 55%, #e8f1fd 100%)',
          color: '#1d1d1f',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#0071e3',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }}>drop-job</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {eyebrow && (
            <div style={{ fontSize: 28, fontWeight: 600, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {eyebrow}
            </div>
          )}
          <div style={{ fontSize: title.length > 48 ? 58 : 70, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', maxWidth: 1040 }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: 30, color: '#6e6e73', lineHeight: 1.3, maxWidth: 1000 }}>{subtitle}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 24, color: '#6e6e73' }}>
          <div>Offres France Travail et Adzuna · CV adapté par l’IA</div>
          <div style={{ color: '#1d1d1f', fontWeight: 600 }}>www.drop-job.fr</div>
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
