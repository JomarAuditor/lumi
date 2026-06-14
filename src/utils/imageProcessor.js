/**
 * imageProcessor.js
 * HTML5 Canvas pipeline for applying filters, compositing photo strips,
 * overlaying meme templates, and rendering final print layouts.
 */

// ─── Filter Definitions ──────────────────────────────────────────────────────
//
// 16 world-class aesthetic filters researched from:
//   • Instagram's top global filters (Clarendon #1 worldwide, Juno, Lark, Valencia)
//   • VSCO's film presets (A4, A6, film grain, faded)
//   • 2024-2026 trending aesthetics: disposable film, Y2K, golden hour, cyberpunk, dreamy
//   • CSSgram open-source filter library (una.im/cssgram)
//
// Each filter uses multiple chained CSS functions.
// The `canvas` property is used for baking the filter into the final JPEG.
//
// Filter pipeline order matters:
//   sepia → hue-rotate creates realistic color toning
//   contrast before saturate = more punch
//   brightness last = global exposure

export const FILTERS = {
  // ── No filter ────────────────────────────────────────────────────────────
  none: {
    label: 'Original',
    icon: '○',
    css: 'none',
    description: 'Clean, no adjustments',
    tag: null,
  },

  // ── #1 CLARENDON — Most popular Instagram filter globally ────────────────
  // High contrast + cool blue tones + boosted saturation
  // Great for portraits, lifestyle, outdoor shots
  clarendon: {
    label: 'Clarendon',
    icon: '◈',
    css: 'contrast(1.2) saturate(1.4) brightness(1.05) hue-rotate(-5deg)',
    description: 'High contrast, punchy colors',
    tag: 'trending',
  },

  // ── JUNO — Warm tones, brightened whites, portrait-perfect ───────────────
  // Boosts warm tones, lifts highlights, flattering on skin
  juno: {
    label: 'Juno',
    icon: '☀',
    css: 'contrast(1.1) brightness(1.08) saturate(1.3) sepia(0.12) hue-rotate(-8deg)',
    description: 'Warm, glowing, portrait-ready',
    tag: 'warm',
  },

  // ── GOLDEN HOUR — Rich amber warmth, cinematic glow ─────────────────────
  // 2024/2026 viral aesthetic — summer, sunsets, warmth
  goldenHour: {
    label: 'Golden Hour',
    icon: '◐',
    css: 'brightness(1.1) saturate(1.3) sepia(0.35) contrast(1.05) hue-rotate(-15deg)',
    description: 'Amber warmth, summer glow',
    tag: 'warm',
  },

  // ── LARK — Cool editorial, desaturated, fashion magazine look ────────────
  // Cool highlights, desaturated shadows, airy
  lark: {
    label: 'Lark',
    icon: '◇',
    css: 'contrast(0.9) brightness(1.1) saturate(0.8) hue-rotate(5deg)',
    description: 'Cool, airy, editorial',
    tag: null,
  },

  // ── FILM — Disposable camera, 90s/Y2K trending aesthetic ────────────────
  // #1 trending in 2024-2026 per TechRepublic — faded, grain-like, light leak warmth
  film: {
    label: 'Film',
    icon: '▣',
    css: 'contrast(0.88) brightness(1.05) saturate(0.75) sepia(0.2) hue-rotate(-8deg)',
    description: '90s disposable, faded & warm',
    tag: 'trending',
  },

  // ── DREAMY — Soft, pastel, lifted blacks, blogcore aesthetic ─────────────
  // Low contrast, lifted shadows, slightly desaturated — "soft girl" aesthetic
  dreamy: {
    label: 'Dreamy',
    icon: '✦',
    css: 'contrast(0.8) brightness(1.15) saturate(0.85) sepia(0.08)',
    description: 'Soft, lifted, pastel mood',
    tag: null,
  },

  // ── VALENCIA — Warm vintage fade, food & lifestyle ───────────────────────
  // Classic Instagram, warm yellow-orange tint, slightly faded
  valencia: {
    label: 'Valencia',
    icon: '◑',
    css: 'contrast(0.9) brightness(1.08) saturate(1.1) sepia(0.15) hue-rotate(-12deg)',
    description: 'Warm vintage, cozy tones',
    tag: 'warm',
  },

  // ── NOIR — High-drama B&W, fashion editorial ─────────────────────────────
  // True black & white with deep shadows and crisp highlights
  noir: {
    label: 'Noir',
    icon: '◼',
    css: 'grayscale(1) contrast(1.3) brightness(0.92)',
    description: 'Deep B&W, dramatic shadows',
    tag: null,
  },

  // ── MOON — Bright, airy B&W, soft luminance ──────────────────────────────
  // Soft grayscale, luminous highlights — lighter and more editorial than Noir
  moon: {
    label: 'Moon',
    icon: '◻',
    css: 'grayscale(1) contrast(1.1) brightness(1.12) saturate(0)',
    description: 'Bright B&W, soft luminance',
    tag: null,
  },

  // ── CYBERPUNK — Teal shadows, orange highlights, heavy contrast ──────────
  // Cinematic teal-orange color grading, neon city aesthetic
  cyberpunk: {
    label: 'Cyberpunk',
    icon: '⬡',
    css: 'contrast(1.25) saturate(1.5) brightness(0.95) hue-rotate(-20deg)',
    description: 'Teal & orange cinematic grade',
    tag: 'bold',
  },

  // ── Y2K — Oversaturated, high contrast, chromatic nostalgia ─────────────
  // Inspired by early 2000s digital camera aesthetic, oversaturated pop
  y2k: {
    label: 'Y2K',
    icon: '✸',
    css: 'contrast(1.3) saturate(1.6) brightness(1.05) hue-rotate(10deg)',
    description: 'Oversaturated 2000s pop',
    tag: 'bold',
  },

  // ── FADE — Matte, lifted blacks, VSCO-style ──────────────────────────────
  // Soft fade, lifted shadows — the "VSCO girl" matte aesthetic
  fade: {
    label: 'Fade',
    icon: '◌',
    css: 'contrast(0.82) brightness(1.12) saturate(0.88)',
    description: 'Matte, lifted blacks, VSCO',
    tag: null,
  },

  // ── VIVID — Max vibrancy, festival photos ────────────────────────────────
  // Maximum saturation and brightness — for colorful, energetic scenes
  vivid: {
    label: 'Vivid',
    icon: '◉',
    css: 'saturate(1.6) contrast(1.15) brightness(1.05)',
    description: 'Maximum color intensity',
    tag: 'bold',
  },

  // ── REYES — Faded warm, film analog feel ─────────────────────────────────
  // Soft warm vintage, characteristic VSCO film stock feel
  reyes: {
    label: 'Reyes',
    icon: '◎',
    css: 'sepia(0.22) contrast(0.85) brightness(1.1) saturate(0.75)',
    description: 'Faded warm, analog film',
    tag: 'warm',
  },

  // ── BROOKLYN — Cool urban, moody street aesthetic ────────────────────────
  // Cool blue cast, slight fade, moody street photography look
  brooklyn: {
    label: 'Brooklyn',
    icon: '◧',
    css: 'contrast(0.9) brightness(1.05) saturate(0.85) hue-rotate(8deg)',
    description: 'Cool, moody, street aesthetic',
    tag: null,
  },

  // ── ROSE — Pink-tinted soft glow, beauty aesthetic ───────────────────────
  // Warm pink/peach cast — trending in beauty and lifestyle content
  rose: {
    label: 'Rose',
    icon: '✿',
    css: 'brightness(1.08) saturate(1.1) sepia(0.18) hue-rotate(-20deg) contrast(0.95)',
    description: 'Pink-tinted, beauty glow',
    tag: 'warm',
  },

  // ── NASHVILLE — Warm pink highlights, light fade ─────────────────────────
  // Vintage warm with pink highlights, characteristic Nashville tone
  nashville: {
    label: 'Nashville',
    icon: '♫',
    css: 'sepia(0.25) contrast(0.95) brightness(1.05) saturate(0.9) hue-rotate(-10deg)',
    description: 'Warm pink vintage with soft fade',
    tag: 'warm',
  },
}

// ─── Layout Definitions ──────────────────────────────────────────────────────
// Four photobooth layouts:
//   Dual-strip (3 & 4 pose) — side-by-side duplicate strips with branded footer
//   Single-strip (3 & 4 pose) — one strip only, wider, with branded footer
//
// Dual-strip canvas anatomy:
//
//  ┌──────────────────────────────────────────────────────┐
//  │  OUTER_PAD                                           │
//  │  ┌───────────────┐  CENTER_GAP  ┌───────────────┐   │
//  │  │  photo 1      │              │  photo 1      │   │
//  │  ├───────────────┤              ├───────────────┤   │
//  │  │  photo 2      │              │  photo 2      │   │
//  │  ├───────────────┤              ├───────────────┤   │
//  │  │  photo 3      │              │  photo 3      │   │
//  │  └───────────────┘              └───────────────┘   │
//  ├──────────────────────────────────────────────────────┤
//  │  FOOTER: lumi. wordmark · date taken                 │
//  └──────────────────────────────────────────────────────┘
//
// Single-strip canvas anatomy:
//
//  ┌───────────────────────────┐
//  │  OUTER_PAD                │
//  │  ┌─────────────────────┐  │
//  │  │  photo 1            │  │
//  │  ├─────────────────────┤  │
//  │  │  photo 2            │  │
//  │  ├─────────────────────┤  │
//  │  │  photo 3            │  │
//  │  └─────────────────────┘  │
//  ├───────────────────────────┤
//  │  FOOTER: lumi. · date     │
//  └───────────────────────────┘

// Canvas constants — shared by dual-strip layouts
const DS_STRIP_W    = 520   // width of each individual strip column
const DS_PHOTO_H    = 390   // height of each photo row
const DS_OUTER      = 28    // outer padding on all sides (top/sides)
const DS_BOTTOM_PAD = 24    // extra bottom padding above footer
const DS_CELL_GAP   = 12    // gap between photo rows (visible theme color)
const DS_CENTER_GAP = 24    // gap between the two strips (visible theme color)
const DS_FOOTER_H   = 110   // branded footer height

// Canvas constants — single strip layouts
const SS_STRIP_W    = 640    // single strip is wider than a dual-strip column
const SS_PHOTO_H    = 480    // slightly taller photos for single strip
const SS_OUTER      = 28     // outer padding (top/sides)
const SS_BOTTOM_PAD = 56     // extra bottom padding below last photo before footer
const SS_CELL_GAP   = 10     // gap between photo rows
const SS_FOOTER_H   = 120    // footer height — roomier for spacing

// Compute total canvas dimensions from row count — dual strip
function dsDims(rows) {
  const w = DS_OUTER + DS_STRIP_W + DS_CENTER_GAP + DS_STRIP_W + DS_OUTER
  const h = DS_OUTER + rows * DS_PHOTO_H + (rows - 1) * DS_CELL_GAP + DS_BOTTOM_PAD + DS_FOOTER_H
  return { w, h }
}

// Compute total canvas dimensions from row count — single strip
function ssDims(rows) {
  const w = SS_OUTER + SS_STRIP_W + SS_OUTER
  const h = SS_OUTER + rows * SS_PHOTO_H + (rows - 1) * SS_CELL_GAP + SS_BOTTOM_PAD + SS_FOOTER_H
  return { w, h }
}

export const LAYOUTS = {
  'dual-strip-3': {
    label: 'Classic Duo',
    description: '3 poses · dual strip · branded footer',
    photoCount: 3,
    isDualStrip: true,
    isSingleStrip: false,
    ...dsDims(3),
    slots: [], // populated below
  },
  'dual-strip-4': {
    label: 'Extended Duo',
    description: '4 poses · dual strip · branded footer',
    photoCount: 4,
    isDualStrip: true,
    isSingleStrip: false,
    ...dsDims(4),
    slots: [], // populated below
  },
  'single-strip-3': {
    label: 'Classic Solo',
    description: '3 poses · single strip · branded footer',
    photoCount: 3,
    isDualStrip: false,
    isSingleStrip: true,
    ...ssDims(3),
    slots: [], // populated below
  },
  'single-strip-4': {
    label: 'Extended Solo',
    description: '4 poses · single strip · branded footer',
    photoCount: 4,
    isDualStrip: false,
    isSingleStrip: true,
    ...ssDims(4),
    slots: [], // populated below
  },
  // Meme layout — kept for Meme Mode, not shown in FrameSelector
  'meme-split': {
    label: 'Meme Split',
    description: 'Meme + 4 Photos Layout',
    photoCount: 4,
    width: 1200,
    height: 1600,
    slotGap: 12,
    slots: [],
    borderWidth: 8,
    labelArea: null,
    labelLines: [],
    centered: true,
    isMeme: true,
  },
}

// Populate slots for dual-strip layouts (left strip only — right is mirrored at render time)
;['dual-strip-3', 'dual-strip-4'].forEach(key => {
  const layout = LAYOUTS[key]
  const rows = layout.photoCount
  layout.slots = Array.from({ length: rows }, (_, i) => ({
    x: DS_OUTER,
    y: DS_OUTER + i * (DS_PHOTO_H + DS_CELL_GAP),
    w: DS_STRIP_W,
    h: DS_PHOTO_H,
  }))
  // Expose dims on the layout object under the keys compositePrint expects
  layout.width  = layout.w
  layout.height = layout.h
})

// Populate slots for single-strip layouts
;['single-strip-3', 'single-strip-4'].forEach(key => {
  const layout = LAYOUTS[key]
  const rows = layout.photoCount
  layout.slots = Array.from({ length: rows }, (_, i) => ({
    x: SS_OUTER,
    y: SS_OUTER + i * (SS_PHOTO_H + SS_CELL_GAP),
    w: SS_STRIP_W,
    h: SS_PHOTO_H,
  }))
  layout.width  = layout.w
  layout.height = layout.h
})

// Populate slots for meme layout
;(() => {
  const layout = LAYOUTS['meme-split']
  const { width, height, slotGap, borderWidth } = layout
  const leftW  = width * 0.45 - slotGap
  const rightW = width * 0.55 - slotGap
  const col2X  = leftW + slotGap * 2
  layout.slots = [
    { x: borderWidth + slotGap, y: borderWidth + slotGap, w: leftW, h: height * 0.45 - slotGap },
    { x: col2X, y: borderWidth + slotGap, w: rightW, h: (height - borderWidth * 2 - slotGap * 5) / 3 },
    { x: col2X, y: borderWidth + slotGap * 2 + (height - borderWidth * 2 - slotGap * 5) / 3, w: rightW, h: (height - borderWidth * 2 - slotGap * 5) / 3 },
    { x: col2X, y: borderWidth + slotGap * 3 + ((height - borderWidth * 2 - slotGap * 5) / 3) * 2, w: rightW, h: (height - borderWidth * 2 - slotGap * 5) / 3 },
    { x: borderWidth + slotGap, y: height * 0.5 + slotGap, w: leftW, h: height * 0.45 - slotGap },
  ]
})()

// ─── Color Themes ─────────────────────────────────────────────────────────────
// Curated palette for aesthetic photobooth strips.
// All themes are light, airy, and print-ready — inspired by film photography,
// editorial design, and 2024-2026 trending colour palettes.

export const COLOR_THEMES = {
  white: {
    label: 'Classic White',
    bg: '#FFFFFF',
    border: '#1b1c1c',
    text: '#1b1c1c',
    accent: '#1b1c1c',
    pattern: null,
  },
  cream: {
    label: 'Warm Cream',
    bg: '#FAF6EF',
    border: '#2C2416',
    text: '#2C2416',
    accent: '#8B6914',
    pattern: 'dots',
  },
  black: {
    label: 'Midnight',
    bg: '#1C1A1E',
    border: '#F0ECE8',
    text: '#F0ECE8',
    accent: '#C8B8A2',
    pattern: 'grid',
  },
  // ── Replaced "Deep Red" with a soft dusty rose ──────────────────────────
  rose: {
    label: 'Dusty Rose',
    bg: '#FAF0F2',
    border: '#C47A8A',
    text: '#7A3347',
    accent: '#E8A0B0',
    pattern: 'dots',
  },
  // ── Replaced "Cobalt Blue" with a light sky blue ─────────────────────────
  sky: {
    label: 'Sky Blue',
    bg: '#EBF4FF',
    border: '#5B9BD5',
    text: '#1A3F6F',
    accent: '#5B9BD5',
    pattern: 'dots',
  },
  // ── Replaced "Forest" with a soft sage / mint green ──────────────────────
  sage: {
    label: 'Sage',
    bg: '#F0F7F2',
    border: '#5A9A72',
    text: '#1E4D2E',
    accent: '#7BBD95',
    pattern: null,
  },
  blush: {
    label: 'Blush',
    bg: '#FFF5F7',
    border: '#C47A8A',
    text: '#6B2D3E',
    accent: '#E88FA0',
    pattern: 'dots',
  },
  lavender: {
    label: 'Lavender',
    bg: '#F4F0FF',
    border: '#7C5CBF',
    text: '#3D2575',
    accent: '#9B7FD4',
    pattern: null,
  },
}

// ─── Core Compositor — Dual Strip ────────────────────────────────────────────

/**
 * compositeDualStrip
 *
 * Unified compositor for all photobooth strip formats:
 *   - Dual strip  (dual-strip-3, dual-strip-4): two identical side-by-side strips
 *   - Single strip (single-strip-3, single-strip-4): one centered strip
 *
 * A branded footer with lumi. wordmark and date sits at the bottom.
 *
 * @param {string[]} photos    — base64 data URLs (3 or 4 shots)
 * @param {string}   layoutKey — 'dual-strip-3' | 'dual-strip-4' | 'single-strip-3' | 'single-strip-4'
 * @param {string}   colorKey  — key from COLOR_THEMES
 * @param {string}   filterKey — key from FILTERS (applied via pixel ops for b&w)
 * @param {object}   options   — { date? }
 * @returns {Promise<string>}  — base64 JPEG data URL at 96% quality
 */
export async function compositeDualStrip(photos, layoutKey, colorKey, filterKey, options = {}) {
  const layout = LAYOUTS[layoutKey] || LAYOUTS['dual-strip-3']
  const theme  = COLOR_THEMES[colorKey] || COLOR_THEMES['white']
  const rows   = layout.photoCount
  const isSingle = layout.isSingleStrip === true

  // Date in MM/DD/YYYY format
  const now = new Date()
  const date = options.date || `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`

  if (isSingle) {
    return compositeSingleStrip(photos, rows, theme, filterKey, date)
  }

  // ── DUAL STRIP ────────────────────────────────────────────────────────────
  const totalW = DS_OUTER + DS_STRIP_W + DS_CENTER_GAP + DS_STRIP_W + DS_OUTER
  const totalH = DS_OUTER + rows * DS_PHOTO_H + (rows - 1) * DS_CELL_GAP + DS_BOTTOM_PAD + DS_FOOTER_H

  const canvas = document.createElement('canvas')
  canvas.width  = totalW
  canvas.height = totalH
  const ctx = canvas.getContext('2d')

  // ── Full background — theme color everywhere (padding, gaps, footer zone) ─
  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, totalW, totalH)

  // Subtle texture pattern
  drawPattern(ctx, theme.pattern, theme.border, totalW, totalH)

  // ── Load images ───────────────────────────────────────────────────────────
  const images = await Promise.all(
    photos.slice(0, rows).map(src => loadDSImage(src))
  )

  // ── Draw both strips — left then right ────────────────────────────────────
  const stripXs = [DS_OUTER, DS_OUTER + DS_STRIP_W + DS_CENTER_GAP]

  for (const stripX of stripXs) {
    for (let row = 0; row < rows; row++) {
      const y   = DS_OUTER + row * (DS_PHOTO_H + DS_CELL_GAP)
      const img = images[row]

      ctx.save()
      ctx.beginPath()
      ctx.rect(stripX, y, DS_STRIP_W, DS_PHOTO_H)
      ctx.clip()

      if (img) {
        drawCoverDS(ctx, img, stripX, y, DS_STRIP_W, DS_PHOTO_H)
      } else {
        ctx.fillStyle = theme.border + '30'
        ctx.fillRect(stripX, y, DS_STRIP_W, DS_PHOTO_H)
      }

      // B&W bake for noir / moon filter
      if (filterKey === 'noir' || filterKey === 'moon') {
        const d = ctx.getImageData(stripX, y, DS_STRIP_W, DS_PHOTO_H)
        const px = d.data
        for (let i = 0; i < px.length; i += 4) {
          const luma = 0.299 * px[i] + 0.587 * px[i+1] + 0.114 * px[i+2]
          const g = filterKey === 'noir'
            ? Math.min(255, Math.round(luma * 1.1))
            : Math.min(255, Math.round(luma))
          px[i] = px[i+1] = px[i+2] = g
        }
        ctx.putImageData(d, stripX, y)
      }

      ctx.restore()
      // No cell border — clean look, theme color gaps do the separation
    }
  }

  // ── Footer — lives inside the bottom DS_FOOTER_H zone ────────────────────
  // Background is already theme.bg. Just draw the text.
  const photosEndY  = DS_OUTER + rows * DS_PHOTO_H + (rows - 1) * DS_CELL_GAP
  const footerZoneY = photosEndY + DS_BOTTOM_PAD
  const leftCx      = DS_OUTER + DS_STRIP_W / 2
  const rightCx     = DS_OUTER + DS_STRIP_W + DS_CENTER_GAP + DS_STRIP_W / 2
  const footerMidY  = footerZoneY + DS_FOOTER_H / 2 - 8

  for (const cx of [leftCx, rightCx]) {
    // "lumi." wordmark
    ctx.fillStyle = theme.text
    ctx.font = 'italic 600 22px "Space Grotesk", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('lumi.', cx, footerMidY)

    // Date below wordmark
    ctx.fillStyle = theme.text
    ctx.globalAlpha = 0.45
    ctx.font = '400 11px "JetBrains Mono", monospace'
    ctx.fillText(date, cx, footerMidY + 24)
    ctx.globalAlpha = 1
  }

  return canvas.toDataURL('image/jpeg', 0.96)
}

/**
 * compositeSingleStrip — internal helper for single-strip layouts.
 * Produces one centered strip with a branded footer.
 * The entire canvas (outer padding + gaps + footer) uses theme.bg,
 * so the selected color is visible everywhere around the photos.
 */
async function compositeSingleStrip(photos, rows, theme, filterKey, date) {
  const totalW = SS_OUTER + SS_STRIP_W + SS_OUTER
  const totalH = SS_OUTER + rows * SS_PHOTO_H + (rows - 1) * SS_CELL_GAP + SS_BOTTOM_PAD + SS_FOOTER_H

  const canvas = document.createElement('canvas')
  canvas.width  = totalW
  canvas.height = totalH
  const ctx = canvas.getContext('2d')

  // ── Full background — theme color fills everything ────────────────────────
  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, totalW, totalH)

  // Subtle texture pattern over background
  drawPattern(ctx, theme.pattern, theme.border, totalW, totalH)

  // ── Load images ───────────────────────────────────────────────────────────
  const images = await Promise.all(
    photos.slice(0, rows).map(src => loadDSImage(src))
  )

  // ── Draw photo cells ──────────────────────────────────────────────────────
  for (let row = 0; row < rows; row++) {
    const x   = SS_OUTER
    const y   = SS_OUTER + row * (SS_PHOTO_H + SS_CELL_GAP)
    const img = images[row]

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, SS_STRIP_W, SS_PHOTO_H)
    ctx.clip()

    if (img) {
      drawCoverDS(ctx, img, x, y, SS_STRIP_W, SS_PHOTO_H)
    } else {
      ctx.fillStyle = theme.border + '30'
      ctx.fillRect(x, y, SS_STRIP_W, SS_PHOTO_H)
    }

    // B&W bake for noir / moon filter
    if (filterKey === 'noir' || filterKey === 'moon') {
      const d = ctx.getImageData(x, y, SS_STRIP_W, SS_PHOTO_H)
      const px = d.data
      for (let i = 0; i < px.length; i += 4) {
        const g = filterKey === 'noir'
          ? Math.min(255, (0.299 * px[i] + 0.587 * px[i+1] + 0.114 * px[i+2]) * 1.1)
          : 0.299 * px[i] + 0.587 * px[i+1] + 0.114 * px[i+2]
        px[i] = px[i+1] = px[i+2] = g
      }
      ctx.putImageData(d, x, y)
    }

    ctx.restore()
    // No cell border — theme color gaps do the separation cleanly
  }

  // ── Footer — sits in SS_BOTTOM_PAD + SS_FOOTER_H space below last photo ──
  // The background is already theme.bg. Just draw the text.

  const cx         = totalW / 2
  const photosEndY = SS_OUTER + rows * SS_PHOTO_H + (rows - 1) * SS_CELL_GAP
  const footerZoneY = photosEndY + SS_BOTTOM_PAD
  const footerMidY  = footerZoneY + SS_FOOTER_H / 2 - 10

  // Small accent dot above wordmark
  ctx.fillStyle = theme.accent
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.arc(cx, footerMidY - 22, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // "lumi." wordmark
  ctx.fillStyle = theme.text
  ctx.font = 'italic 700 28px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('lumi.', cx, footerMidY)

  // Date — MM/DD/YYYY — spaced below wordmark
  ctx.fillStyle = theme.text
  ctx.globalAlpha = 0.45
  ctx.font = '400 13px "JetBrains Mono", monospace'
  ctx.fillText(date, cx, footerMidY + 28)
  ctx.globalAlpha = 1

  return canvas.toDataURL('image/jpeg', 0.96)
}

// Keep the old export name as an alias so any existing callers don't break
export const compositePrint = compositeDualStrip

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadDSImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function drawCoverDS(ctx, img, dx, dy, dw, dh) {
  const iw = img.naturalWidth  || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih) return
  const scale = Math.max(dw / iw, dh / ih)
  const sw = dw / scale
  const sh = dh / scale
  const sx = (iw - sw) / 2
  const sy = (ih - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function drawPattern(ctx, pattern, color, w, h) {
  if (!pattern) return
  ctx.save()
  ctx.globalAlpha = 0.06

  if (pattern === 'dots') {
    ctx.fillStyle = color
    for (let x = 12; x < w; x += 24) {
      for (let y = 12; y < h; y += 24) {
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (pattern === 'grid') {
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    for (let x = 0; x < w; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
  }

  ctx.restore()
}

// ─── Meme Compositor ─────────────────────────────────────────────────────────
//
// Canvas is built dynamically based on how many frames the user selected (1–6).
// Each row = one meme reference (left) + one webcam shot (right).
//
//   ┌────────────────┬────────────────┐
//   │  REFERENCE     │  YOUR TAKE     │
//   │  meme frame    │  webcam shot   │
//   └────────────────┴────────────────┘
//
// Fixed constants
const MEME_W = 1200
const MEME_COL_W = 600     // each column width
const MEME_ROW_H = 400     // each row height (fixed — consistent aspect ratio)
const MEME_DIVIDER = 6     // px — vertical + horizontal cell borders
const MEME_OUTER = 16      // px — outer frame border
const MEME_LABEL_H = 60    // px — bottom label strip

// Computed height based on row count
function getMemeCanvasHeight(rowCount) {
  return MEME_OUTER + rowCount * MEME_ROW_H + (rowCount - 1) * MEME_DIVIDER + MEME_LABEL_H
}

/**
 * Load an image from a URL or data URL.
 * Falls back to a solid-color placeholder canvas if the load fails.
 */
function loadMemeImage(src, fallbackColor = '#2a2a2a') {
  return new Promise((resolve) => {
    if (!src) {
      resolve(makePlaceholder(MEME_COL_W, MEME_ROW_H, fallbackColor))
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(makePlaceholder(MEME_COL_W, MEME_ROW_H, fallbackColor))
    img.src = src
  })
}

function makePlaceholder(w, h, fill) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.fillStyle = fill
  ctx.fillRect(0, 0, w, h)
  // Draw a subtle "?" label so you can tell it's a missing image in testing
  ctx.fillStyle = '#555'
  ctx.font = '600 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('?', w / 2, h / 2)
  return c
}

/**
 * Cover-fit: draw img into (dx, dy, dw, dh) on ctx with center-crop.
 * Same as CSS object-fit: cover.
 */
function drawCellCover(ctx, img, dx, dy, dw, dh) {
  const srcW = img.naturalWidth || img.width
  const srcH = img.naturalHeight || img.height
  if (!srcW || !srcH) {
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(dx, dy, dw, dh)
    return
  }
  const scale = Math.max(dw / srcW, dh / srcH)
  const sw = dw / scale
  const sh = dh / scale
  const sx = (srcW - sw) / 2
  const sy = (srcH - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

/**
 * compositeMemePrint
 *
 * Builds a dynamic-height side-by-side meme composite.
 * Works with any number of rows (1 to 6).
 *
 * Canvas width:  1200px (600px per column, always)
 * Canvas height: MEME_OUTER + (rows × ROW_H) + ((rows-1) × DIVIDER) + LABEL_H
 *
 * @param {string[]} webcamPhotos         — base64 data URLs from webcam (right column)
 * @param {Array<{src:string}>} memeFrames — meme reference frame objects (left column)
 * @param {string} colorKey               — key from COLOR_THEMES
 * @param {Object} theme                  — COLOR_THEMES[colorKey] object
 * @param {string} packLabel              — display name in the bottom label strip
 * @returns {Promise<string>}             — base64 JPEG data URL at 95% quality
 */
export async function compositeMemePrint(
  webcamPhotos,
  memeFrames,
  colorKey,
  theme,
  packLabel = 'Meme Mode'
) {
  const resolvedTheme = theme || COLOR_THEMES[colorKey] || COLOR_THEMES['white']
  const rowCount = Math.max(memeFrames?.length || 1, webcamPhotos?.length || 1)
  const MEME_H = getMemeCanvasHeight(rowCount)

  const canvas = document.createElement('canvas')
  canvas.width = MEME_W
  canvas.height = MEME_H
  const ctx = canvas.getContext('2d')

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = resolvedTheme.bg
  ctx.fillRect(0, 0, MEME_W, MEME_H)

  // ── Outer border frame (around the photo area only, not the label strip) ──
  ctx.strokeStyle = resolvedTheme.border
  ctx.lineWidth = MEME_OUTER
  ctx.strokeRect(
    MEME_OUTER / 2,
    MEME_OUTER / 2,
    MEME_W - MEME_OUTER,
    MEME_H - MEME_LABEL_H - MEME_OUTER / 2
  )

  // ── Load all images in parallel ───────────────────────────────────────────
  const placeholderFill = resolvedTheme.bg === '#1b1c1c' || resolvedTheme.bg === '#0d0d0d'
    ? '#111'
    : '#e5e5e5'

  const [memeImages, webcamImages] = await Promise.all([
    Promise.all(
      Array.from({ length: rowCount }, (_, i) =>
        loadMemeImage(memeFrames?.[i]?.src, placeholderFill)
      )
    ),
    Promise.all(
      Array.from({ length: rowCount }, (_, i) =>
        loadMemeImage(webcamPhotos?.[i], '#2a2a2a')
      )
    ),
  ])

  // ── Draw rows ─────────────────────────────────────────────────────────────
  const cellW = MEME_COL_W - MEME_OUTER

  for (let row = 0; row < rowCount; row++) {
    const y = MEME_OUTER + row * (MEME_ROW_H + MEME_DIVIDER)
    const leftX = MEME_OUTER
    const rowRightX = MEME_COL_W + MEME_DIVIDER

    // Left cell: meme reference
    ctx.save()
    ctx.beginPath()
    ctx.rect(leftX, y, cellW, MEME_ROW_H)
    ctx.clip()
    drawCellCover(ctx, memeImages[row], leftX, y, cellW, MEME_ROW_H)
    ctx.restore()

    // Right cell: webcam shot
    ctx.save()
    ctx.beginPath()
    ctx.rect(rowRightX, y, cellW, MEME_ROW_H)
    ctx.clip()
    drawCellCover(ctx, webcamImages[row], rowRightX, y, cellW, MEME_ROW_H)
    ctx.restore()

    // Vertical divider
    ctx.fillStyle = resolvedTheme.border
    ctx.fillRect(MEME_COL_W, y, MEME_DIVIDER, MEME_ROW_H)

    // Horizontal row separator (skip after last row)
    if (row < rowCount - 1) {
      ctx.fillRect(MEME_OUTER, y + MEME_ROW_H, MEME_W - MEME_OUTER * 2, MEME_DIVIDER)
    }
  }

  // ── Bottom label strip ────────────────────────────────────────────────────
  const labelY = MEME_H - MEME_LABEL_H

  ctx.fillStyle = resolvedTheme.border
  ctx.fillRect(0, labelY, MEME_W, MEME_LABEL_H)

  // Accent dot — center
  ctx.fillStyle = resolvedTheme.accent
  ctx.beginPath()
  ctx.arc(MEME_W / 2, labelY + MEME_LABEL_H / 2, 4, 0, Math.PI * 2)
  ctx.fill()

  // lumi. — centered, both halves
  ctx.fillStyle = resolvedTheme.bg
  ctx.font = '700 20px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('lumi.', MEME_W / 2, labelY + 38)

  return canvas.toDataURL('image/jpeg', 0.95)
}
