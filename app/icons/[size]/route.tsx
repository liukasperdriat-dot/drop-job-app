import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  _request: NextRequest,
  { params }: { params: { size: string } }
) {
  const px = params.size.includes('512') ? 512 : 192
  const radius = Math.round(px * 0.2)
  const fontSize = Math.round(px * 0.34)

  return new ImageResponse(
    (
      <div
        style={{
          width: px,
          height: px,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2563eb',
          borderRadius: radius,
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontFamily: 'sans-serif',
          }}
        >
          DJ
        </span>
      </div>
    ),
    { width: px, height: px }
  )
}
