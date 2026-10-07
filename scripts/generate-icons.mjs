import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * High-quality procedural PNG generator for Context Vault icon.
 * Features:
 * - Rounded squircle dark slate container
 * - Electric Indigo -> Violet -> Cyan gradient border & glow
 * - Vault / Bookmark Clip glyph in center
 * - Pixel-perfect scaling at 16x16, 48x48, and 128x128
 */

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

// Distance to rounded rectangle
function sdRoundedBox(px, py, bx, by, r) {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  return Math.min(Math.max(qx, qy), 0.0) + Math.hypot(Math.max(qx, 0.0), Math.max(qy, 0.0)) - r;
}

// Distance to vertical capsule
function sdCapsule(px, py, ax, ay, bx, by, r) {
  const pax = px - ax, pay = py - ay;
  const bax = bx - ax, bay = by - ay;
  const h = Math.max(0.0, Math.min(1.0, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  return Math.hypot(dx, dy) - r;
}

function renderPixel(x, y, size) {
  // Normalize to [-1, 1]
  const nx = (x / (size - 1)) * 2 - 1;
  const ny = (y / (size - 1)) * 2 - 1;

  // Squircle background
  const cardRadius = 0.38;
  const cardHalf = 0.82;
  const dCard = sdRoundedBox(nx, ny, cardHalf, cardHalf, cardRadius);

  if (dCard > 0.06) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Smooth anti-aliased edge
  const edgeAlpha = Math.max(0, Math.min(1, (0.06 - dCard) * 30));

  // Base background gradient: Deep slate-950
  let r = 10, g = 14, b = 28, a = 255;

  // Outer Border Glow: Indigo -> Violet -> Cyan
  const borderDist = Math.abs(dCard);
  if (borderDist < 0.12) {
    const t = (nx + ny + 2) / 4; // 0 to 1 diagonally
    const glowR = 99 + t * 40;   // 99 to 139 (Indigo-Cyan)
    const glowG = 102 + t * 80;  // 102 to 182
    const glowB = 241 + t * 14;  // 241 to 255
    const blend = 1 - (borderDist / 0.12);
    r = r * (1 - blend) + glowR * blend;
    g = g * (1 - blend) + glowG * blend;
    b = b * (1 - blend) + glowB * blend;
  }

  // Glyph Symbol: Vault Shackle + Ribbon Bookmark
  // 1. Vault Top Shackle Arch (U-shape)
  const shackleRadius = 0.30;
  const shackleThick = size >= 32 ? 0.09 : 0.14;
  const distFromCenter = Math.hypot(nx, ny + 0.18);
  const isShackleArch = ny < -0.12 && Math.abs(distFromCenter - shackleRadius) < shackleThick && Math.abs(nx) < 0.38;

  // 2. Vault Box Body
  const dVaultBox = sdRoundedBox(nx, ny - 0.12, 0.44, 0.36, 0.10);
  const isBoxOutline = Math.abs(dVaultBox) < (size >= 32 ? 0.08 : 0.12);

  // 3. Central Keyhole / Memory Node
  const dKeyholeCircle = Math.hypot(nx, ny - 0.12) - (size >= 32 ? 0.14 : 0.16);
  const isKeyhole = Math.abs(dKeyholeCircle) < 0.06;

  // 4. Bookmark Ribbon Tab on right
  const dRibbon = sdCapsule(nx, ny, 0.28, -0.42, 0.28, 0.46, size >= 32 ? 0.09 : 0.12);
  const isRibbon = dRibbon < 0;

  // Combine glyph shapes
  if (isShackleArch || isBoxOutline || isKeyhole || isRibbon) {
    // Electric Indigo / Cyan neon fill for glyph
    const t = (nx - ny + 2) / 4;
    const glyphR = 120 + t * 100;
    const glyphG = 160 + t * 80;
    const glyphB = 255;

    r = glyphR;
    g = glyphG;
    b = glyphB;
  }

  return [Math.round(r), Math.round(g), Math.round(b), Math.round(a * edgeAlpha)];
}

function generatePNG(size) {
  const width = size;
  const height = size;

  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdr);

  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [pr, pg, pb, pa] = renderPixel(x, y, size);
      rawData[offset++] = pr;
      rawData[offset++] = pg;
      rawData[offset++] = pb;
      rawData[offset++] = pa;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const png = generatePNG(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`✅ Generated premium icon${size}.png (${size}x${size})`);
});
