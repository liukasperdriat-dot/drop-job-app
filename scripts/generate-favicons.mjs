import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root       = join(__dirname, '..')
const publicDir  = join(root, 'public')
const iconsDir   = join(publicDir, 'icons')

mkdirSync(iconsDir, { recursive: true })

// Logo SVG avec traits blancs sur fond transparent
const logoSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="white" stroke-width="2.2" fill="none"/>
  <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="white" stroke-width="1.5" fill="none" opacity="0.45"/>
  <circle cx="20" cy="20" r="7.5" stroke="white" stroke-width="1.8" fill="none"/>
  <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <polyline points="17,20.5 20,23.5 23,20.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`)

// Fond bleu avec coins arrondis
function bgSvg(size) {
  const rx = Math.round(size * 0.2)
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" rx="${rx}" fill="#2563eb"/>` +
    `</svg>`
  )
}

async function generateIcon(size, padding) {
  const logoSize = size - padding * 2
  const bg   = await sharp(bgSvg(size)).png().toBuffer()
  const logo = await sharp(logoSvg).resize(logoSize, logoSize).png().toBuffer()
  return sharp(bg)
    .composite([{ input: logo, top: padding, left: padding }])
    .png()
    .toBuffer()
}

function buildICO(pngBuf) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const dir = Buffer.alloc(16)
  dir[0] = 32; dir[1] = 32; dir[2] = 0; dir[3] = 0
  dir.writeUInt16LE(1, 4)
  dir.writeUInt16LE(32, 6)
  dir.writeUInt32LE(pngBuf.length, 8)
  dir.writeUInt32LE(22, 12)
  return Buffer.concat([header, dir, pngBuf])
}

const [png32, png192, png512] = await Promise.all([
  generateIcon(32,  4),
  generateIcon(192, 24),
  generateIcon(512, 64),
])

writeFileSync(join(publicDir, 'favicon.png'), png32)
console.log('✓ public/favicon.png (32×32)')

writeFileSync(join(publicDir, 'favicon.ico'), buildICO(png32))
console.log('✓ public/favicon.ico (32×32 ICO)')

writeFileSync(join(iconsDir, 'icon-192.png'), png192)
console.log('✓ public/icons/icon-192.png')

writeFileSync(join(iconsDir, 'icon-512.png'), png512)
console.log('✓ public/icons/icon-512.png')
