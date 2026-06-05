import zlib from 'zlib'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const BLUE  = [0x25, 0x63, 0xeb, 0xff]
const WHITE = [0xff, 0xff, 0xff, 0xff]
const TRANS = [0x00, 0x00, 0x00, 0x00]

// 5×7 bitmap font
const GLYPH_D = [
  [1,1,1,0,0],
  [1,0,0,1,0],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [1,0,0,1,0],
  [1,1,1,0,0],
]
const GLYPH_J = [
  [0,0,1,1,1],
  [0,0,0,1,0],
  [0,0,0,1,0],
  [0,0,0,1,0],
  [1,0,0,1,0],
  [1,0,0,1,0],
  [0,1,1,0,0],
]

function createPixels(size) {
  const px = new Uint8Array(size * size * 4)
  const scale  = size >= 32 ? 2 : 1
  const radius = Math.round(size * 0.18)

  // Background: blue with rounded corners transparent
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const cx = Math.min(x, size - 1 - x)
      const cy = Math.min(y, size - 1 - y)
      const inCorner = cx < radius && cy < radius
      const dist = Math.sqrt((radius - cx) ** 2 + (radius - cy) ** 2)
      const color = inCorner && dist > radius ? TRANS : BLUE
      px[i] = color[0]; px[i+1] = color[1]; px[i+2] = color[2]; px[i+3] = color[3]
    }
  }

  // "DJ" text
  const cw = 5 * scale
  const ch = 7 * scale
  const totalW = cw * 2 + 2
  const xOff = Math.floor((size - totalW) / 2)
  const yOff = Math.floor((size - ch) / 2)

  function drawGlyph(glyph, ox) {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (!glyph[row][col]) continue
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const px2 = ox + col * scale + dx
            const py2 = yOff + row * scale + dy
            if (px2 < 0 || px2 >= size || py2 < 0 || py2 >= size) continue
            const i = (py2 * size + px2) * 4
            px[i] = WHITE[0]; px[i+1] = WHITE[1]; px[i+2] = WHITE[2]; px[i+3] = WHITE[3]
          }
        }
      }
    }
  }

  drawGlyph(GLYPH_D, xOff)
  drawGlyph(GLYPH_J, xOff + cw + 2)

  return px
}

// CRC32 table (computed once)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF]
  return (c ^ 0xFFFFFFFF) >>> 0
}

function makeChunk(type, data) {
  const typeB = Buffer.from(type)
  const lenB  = Buffer.alloc(4); lenB.writeUInt32BE(data.length)
  const crcB  = Buffer.alloc(4); crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])))
  return Buffer.concat([lenB, typeB, data, crcB])
}

function buildPNG(size, pixels) {
  const sig  = Buffer.from([137,80,78,71,13,10,26,10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0  // RGBA

  const raw = Buffer.alloc(size * (1 + size * 4))
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0
    for (let x = 0; x < size; x++) {
      const pi = (y * size + x) * 4
      const ri = y * (1 + size * 4) + 1 + x * 4
      raw[ri]=pixels[pi]; raw[ri+1]=pixels[pi+1]; raw[ri+2]=pixels[pi+2]; raw[ri+3]=pixels[pi+3]
    }
  }

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', zlib.deflateSync(raw)),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

function buildICO(pngBuf) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4)

  const dir = Buffer.alloc(16)
  dir[0]=32; dir[1]=32; dir[2]=0; dir[3]=0
  dir.writeUInt16LE(1, 4); dir.writeUInt16LE(32, 6)
  dir.writeUInt32LE(pngBuf.length, 8)
  dir.writeUInt32LE(22, 12)  // 6 header + 16 dir

  return Buffer.concat([header, dir, pngBuf])
}

const px32 = createPixels(32)
const png32 = buildPNG(32, px32)

writeFileSync(join(publicDir, 'favicon.png'), png32)
writeFileSync(join(publicDir, 'favicon.ico'), buildICO(png32))

console.log('favicon.png et favicon.ico générés dans /public')
