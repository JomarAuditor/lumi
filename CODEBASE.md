# LUMI Studio Pop — Full Codebase Reference

> A complete, file-by-file breakdown of the entire project.
> Written for AI assistants (Claude, Copilot, etc.) to understand the full context before making any change.
> Last updated: June 14, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [File Tree](#3-file-tree)
4. [Environment Variables](#4-environment-variables)
5. [Entry Points](#5-entry-points)
6. [Design System](#6-design-system)
7. [Routing](#7-routing)
8. [Screens (Pages)](#8-screens-pages)
9. [Components — Booth](#9-components--booth)
10. [Components — Common](#10-components--common)
11. [Components — Gallery](#11-components--gallery)
12. [Hooks](#12-hooks)
13. [Context](#13-context)
14. [Lib](#14-lib)
15. [Utils — imageProcessor](#15-utils--imageprocessorjs)
16. [Config Files](#16-config-files)
17. [Data Models (Supabase)](#17-data-models-supabase)
18. [Microsoft Work IQ Integration](#18-microsoft-work-iq-integration)
19. [Key Patterns & Conventions](#19-key-patterns--conventions)
20. [Known Gaps & TODOs](#20-known-gaps--todos)

---

## 1. Project Overview

**LUMI Studio Pop** is a browser-native digital photobooth built for the **Agents League Hackathon 2026 — Creative Apps track**.

Core value proposition: capture photos in the browser, apply filters, composite them into print-quality layouts via HTML5 Canvas, and auto-save to a personal cloud gallery. The standout feature is **Work IQ Mood Sync** — the studio reads the user's Microsoft 365 calendar via the Graph API and morphs the visual theme (color palette + filter) to match their current work context.

**What it is NOT:**
- Not a native app (pure browser/WebRTC)
- Not an AI image generator (photos come from your webcam)
- Not a social platform (personal gallery only)

---

## 2. Tech Stack

| Concern | Tool | Version |
|---|---|---|
| Framework | React | 18.2.0 |
| Build | Vite | 5.0.8 |
| Styling | Tailwind CSS | 3.4.0 |
| Backend / Auth / Storage | Supabase | 2.39.0 |
| Camera | WebRTC `getUserMedia` | Browser API |
| Image processing | HTML5 Canvas API | Browser API |
| Intelligence layer | Microsoft Work IQ via Microsoft Graph API | `/me/events` |
| Routing | React Router DOM | 6.21.0 |
| Icons | Google Material Symbols Outlined | CDN (index.html) |
| Fonts | Space Grotesk, Plus Jakarta Sans, JetBrains Mono | Google Fonts CDN |

**No testing framework. No TypeScript. No state management library (pure React state + context).**

---

## 3. File Tree

```
photobooth/
├── .env.example                     # Template — copy to .env.local
├── .env.local                       # Real secrets — gitignored
├── .gitignore
├── index.html                       # Root HTML, loads fonts + Material Icons from CDN
├── package.json                     # name: lumi-studio-pop, v1.0.0
├── postcss.config.js                # Autoprefixer
├── tailwind.config.js               # Full design system — colors, fonts, spacing, animations
├── vite.config.js                   # Port 3000, auto-open
├── public/
│   └── templates/                   # (empty) — reserved for future print templates
└── src/
    ├── main.jsx                     # ReactDOM.createRoot → BrowserRouter → App
    ├── App.jsx                      # AuthProvider + Routes
    ├── index.css                    # Tailwind directives + global utilities (neo-pop, dot-grid, etc.)
    ├── assets/
    │   ├── designs/                 # (empty) — reserved
    │   ├── frames/                  # (empty) — reserved
    │   └── memes/                   # (empty) — meme images would go here
    ├── components/
    │   ├── booth/
    │   │   ├── CameraCanvas.jsx     # Live video feed with filter + countdown overlay
    │   │   ├── ColorPicker.jsx      # Color theme selector (8 themes)
    │   │   ├── FilterList.jsx       # Filter selector (11 filters)
    │   │   ├── FrameSelector.jsx    # Print layout selector (all except meme-split)
    │   │   └── TemplateGrid.jsx     # Meme template picker + meme mode toggle
    │   ├── common/
    │   │   ├── Button.jsx           # Reusable Neo-Pop button (5 variants, 5 sizes)
    │   │   ├── Footer.jsx           # Static footer with nav links
    │   │   └── Navbar.jsx           # Sticky header with auth state, mobile drawer
    │   └── gallery/
    │       └── PrintCard.jsx        # Individual print card with hover overlay
    ├── context/
    │   └── AuthContext.jsx          # Supabase session state + Google OAuth helpers
    ├── hooks/
    │   ├── useCamera.js             # WebRTC stream management + countdown capture
    │   └── useSupabaseStorage.js    # Upload, fetch, delete prints from Supabase
    ├── lib/
    │   └── supabaseClient.js        # Supabase client singleton
    ├── screens/
    │   ├── Landing.jsx              # Marketing homepage
    │   ├── Studio.jsx               # Main photobooth UI (Work IQ lives here)
    │   ├── Gallery.jsx              # Personal print gallery
    │   ├── Processing.jsx           # Animated processing screen (standalone route)
    │   └── AuthModal.jsx            # Google sign-in page
    └── utils/
        └── imageProcessor.js        # FILTERS, LAYOUTS, COLOR_THEMES, compositePrint, compositeMemePrint
```

---

## 4. Environment Variables

File: `.env.local` (gitignored). Template: `.env.example`.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_WORK_IQ_TOKEN=your_graph_explorer_access_token_here
```

- `VITE_SUPABASE_URL` — Required for auth + storage. Graceful fallback to placeholder if missing (console warn only).
- `VITE_SUPABASE_ANON_KEY` — Required for auth + storage. Same fallback behavior.
- `VITE_WORK_IQ_TOKEN` — **Optional.** If absent, Studio runs in **Demo Mode**: simulates a Work IQ sync with mock calendar events. No Microsoft 365 account needed for the demo.

All vars are prefixed `VITE_` — Vite only exposes vars with this prefix to the browser bundle.

---

## 5. Entry Points

### `index.html`
- Root HTML shell. Loads from CDN:
  - Google Fonts: Space Grotesk, Plus Jakarta Sans, JetBrains Mono
  - Material Symbols Outlined (icon font)
- Mounts to `<div id="root">`

### `src/main.jsx`
```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

### `src/App.jsx`
Wraps everything in `<AuthProvider>`. Renders `<Navbar>` + `<main>` with routes + `<Footer>`.

---

## 6. Design System

Defined entirely in `tailwind.config.js` + `src/index.css`.

### Color Palette (Material Design 3 inspired, Neo-Pop execution)
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#a73a00` | Dark orange — borders, accents |
| `primary-container` | `#ff5c00` | Bright orange — buttons, active states, highlights |
| `on-primary-container` | `#521800` | Dark brown — text on orange |
| `on-background` | `#1b1c1c` | Near-black — all borders (Neo-Pop) |
| `background` | `#fbf9f9` | Off-white — page background |
| `surface` | `#fbf9f9` | Card backgrounds |
| `secondary-fixed` | `#62ff96` | Bright green — Work IQ badge, accent |
| `on-secondary-fixed` | `#00210b` | Dark green — text on green |

### Typography
| Token | Font | Size/Weight | Usage |
|---|---|---|---|
| `font-headline-xl` | Space Grotesk | 48px/700 | Page titles |
| `font-headline-lg` | Space Grotesk | 32px/700 | Section headings |
| `font-body-lg` | Plus Jakarta Sans | 18px/500 | Body copy |
| `font-body-md` | Plus Jakarta Sans | 16px/500 | Secondary copy |
| `font-label-md` | Plus Jakarta Sans | 14px/600 | Button labels, UI labels |
| `font-technical-sm` | JetBrains Mono | 13px/500 | Metadata, tags, IQ panel |

### Spacing Scale
`xs=8px` `sm=16px` `md=24px` `gutter=24px` `lg=40px` `xl=64px`

### Neo-Pop Shadow System
Hard offset shadows — no blur, no spread. Defined as Tailwind utilities in `index.css`:
```css
.neo-pop-shadow     { box-shadow: 4px 4px 0px 0px #1b1c1c; }
.neo-pop-shadow-lg  { box-shadow: 8px 8px 0px 0px #1b1c1c; }
```
Interactive pattern: hover = shadow grows + element shifts -1px/-1px. Active = shadow collapses + element shifts +4px/+4px.

### Animations
| Name | Description |
|---|---|
| `animate-fadeIn` | Fade + slide up 16px, 0.5s |
| `animate-pulse2` | Opacity pulse 0.4–1.0, 2s |
| `animate-scanline` | Full-screen vertical scan line |
| `animate-float` | Gentle Y float + rotate for hero strips |
| `animate-float2` | Variation of float with different timing |

### Dot Grid Background
```css
.dot-grid {
  background-image: radial-gradient(#1b1c1c 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.04; /* used on hero and auth screens */
}
```

---

## 7. Routing

Defined in `App.jsx` using React Router v6.

| Path | Component | Description |
|---|---|---|
| `/` | `Landing` | Marketing homepage |
| `/studio` | `Studio` | Main photobooth (requires camera) |
| `/processing` | `Processing` | Animated processing screen |
| `/gallery` | `Gallery` | Personal print gallery |
| `/auth` | `AuthModal` | Google sign-in page |

No protected routes — Studio and Gallery are accessible as guest. Gallery shows a "sign in" prompt if unauthenticated.

---

## 8. Screens (Pages)

---

### `src/screens/Landing.jsx`

Marketing homepage. No props. No state beyond `useNavigate`.

**Sections (top to bottom):**
1. **Hero** — Headline, CTA buttons, floating photo strip mockups, scrolling ticker
2. **Features** — 6 feature cards grid (Work IQ card highlighted with ring)
3. **Layout Showcase** — 6 print layout previews as clickable cards
4. **Meme Mode Callout** — Dark background section with emoji grid
5. **Testimonials** — 3 fake quote cards
6. **Microsoft Work IQ Section** — Dark section explaining vibe mapping with live mockup
7. **CTA Banner** — Orange background, "ready to capture?" + open studio button

**Key constants:**
```js
STRIP_COLORS_A = ['#ff5c00', '#1b1c1c', '#FAF8F5']  // hero strip A
STRIP_COLORS_B = ['#a855f7', '#ec4899', '#22c55e', '#ff5c00']  // hero strip B
FEATURES = [...]   // 6 feature objects { icon, title, desc, highlight? }
TESTIMONIALS = [...] // 3 fake testimonials
```

---

### `src/screens/Studio.jsx`

The main photobooth UI. Most complex screen in the app.

**Layout:** 3-column on desktop, stacked on mobile.
- LEFT: Settings sidebar (tabs: Layout / Filter / Color / Meme)
- CENTER: Camera feed + shutter controls + progress bar
- RIGHT: Captured thumbnails + final print preview + Work IQ panel

**State:**
```js
activeTab          // 'Layout' | 'Filter' | 'Color' | 'Meme'
selectedLayout     // key from LAYOUTS, default: 'strip-2x3'
selectedFilter     // key from FILTERS, default: 'none'
selectedColor      // key from COLOR_THEMES, default: 'white'
useMeme            // boolean — meme mode toggle
selectedMeme       // key from MEME_TEMPLATES, default: 'monkey'
capturedPhotos     // string[] — array of base64 data URLs
isCompositing      // boolean — canvas compositing in progress
finalPrint         // string | null — composited output data URL
cameraStarted      // boolean — prevents double startCamera on mount
sidebarOpen        // boolean — mobile sidebar drawer
isLoadingVibe      // boolean — Work IQ fetch in progress
workIqMessage      // string — status message shown in IQ panel
workIqStatus       // 'idle' | 'loading' | 'success' | 'error' | 'demo'
workIqVibe         // object | null — active vibe rule from WORK_IQ_VIBES
workIqEvents       // array — calendar events fetched from Graph API
showIqPanel        // boolean — IQ panel expanded/collapsed
```

**Key flows:**

1. **Capture flow:**
   - User presses shutter → `handleCapture` → `captureWithCountdown(3s)` → frame pushed to `capturedPhotos`
   - When `capturedPhotos.length === requiredPhotos`, `handleComposite` fires automatically via `useEffect`
   - `handleComposite` calls `compositePrint` or `compositeMemePrint` from imageProcessor → sets `finalPrint`

2. **Save flow:**
   - `handleSaveAndDownload` → downloads JPEG + uploads to Supabase via `uploadPrint`

3. **Work IQ flow:**
   - `handleWorkIqVibeCheck` → checks for `VITE_WORK_IQ_TOKEN`
   - **With token:** fetches `https://graph.microsoft.com/v1.0/me/events?$top=5` → parses event subjects → `resolveVibe` → `applyVibe`
   - **Without token (Demo Mode):** simulates the full sequence with mock events + fake delay → same `applyVibe` call
   - `applyVibe(vibe)` → sets `selectedColor` + `selectedFilter` + vibe display state

**WORK_IQ_VIBES constant** (defined at top of Studio.jsx, not in imageProcessor):
```js
const WORK_IQ_VIBES = [
  { keywords: ['meeting','review','client','project','sprint','standup','1:1'], color: 'black', filter: 'noir', label: 'FOCUS MODE', ... },
  { keywords: ['design','creative','launch','brainstorm','workshop','ideation'], color: 'pink', filter: 'vivid', ... },
  { keywords: ['study','exam','learn','training','course','class'], color: 'violet', filter: 'fade', ... },
  { keywords: ['lunch','break','coffee','social','party','happy hour'], color: 'orange', filter: 'warm', ... },
  { keywords: ['deploy','release','ship','production','go live'], color: 'mint', filter: 'pop', ... },
]
```
Note: `'vivid'`, `'warm'`, `'noir'` are filter keys used here but **are NOT defined in `FILTERS`** in imageProcessor.js. `'vivid'` → maps to `clarendon`, `'warm'` → `nashville`, `'noir'` → `inkwell` would be the closest. This is a gap — the filter keys used in WORK_IQ_VIBES don't fully match the keys in the FILTERS object.

**Auto-composite useEffect:**
```js
useEffect(() => {
  if (capturedPhotos.length === requiredPhotos && !finalPrint) {
    handleComposite()
  }
}, [capturedPhotos.length, requiredPhotos])
```

---

### `src/screens/Gallery.jsx`

Personal print gallery. Requires auth to display prints (shows sign-in prompt otherwise).

**State:**
```js
prints       // Print[] from Supabase
loading      // boolean
sort         // 'Newest' | 'Oldest'
filterType   // 'All' | 'Strip' | 'Grid' | 'Meme'
viewMode     // 'masonry' | 'grid'
```

**Filter logic:**
```js
.filter(p => {
  if (filterType === 'Strip') return p.template?.includes('strip')
  if (filterType === 'Grid')  return p.template?.includes('grid')
  if (filterType === 'Meme')  return p.template?.includes('meme')
  return true
})
```

**View modes:** Masonry uses CSS `columns-1 md:columns-2 lg:columns-3`. Grid uses `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.

**Empty states:**
- Loading spinner
- Not signed in → lock icon + Sign In button
- Signed in but no prints → photo_library icon + Open Studio button
- Signed in with prints → renders `PrintCard` grid

---

### `src/screens/Processing.jsx`

Animated step-by-step processing screen. Can be used as a standalone route or triggered programmatically via `onComplete` prop.

**Steps array:**
```js
const STEPS = [
  { label: 'Scanning frames', icon: 'document_scanner' },
  { label: 'Applying filter', icon: 'auto_fix_high' },
  { label: 'Compositing layout', icon: 'layers' },
  { label: 'Uploading to cloud', icon: 'cloud_upload' },
  { label: 'Print ready', icon: 'check_circle' },
]
```
Each step advances every 700ms via `setTimeout`. On completion, calls `onComplete?.()`. Shows a progress bar + individual step rows.

**Note:** This screen is defined but **not used in the actual capture flow** in Studio.jsx. The compositing happens inline in Studio. Processing.jsx is currently a standalone decorative screen accessible at `/processing`.

---

### `src/screens/AuthModal.jsx`

Full-page sign-in screen (not a modal despite the name).

- Redirects to `/studio` if already authenticated (useEffect on `user`)
- Single "Continue with Google" button → calls `signInWithGoogle()` from AuthContext
- "Continue as Guest" button → navigate to `/studio`
- Google SVG icon hardcoded inline (not Material Icons)
- Microsoft logo in footer (decorative — Supabase is the auth provider, not Microsoft)

---

## 9. Components — Booth

---

### `src/components/booth/CameraCanvas.jsx`

**Props:**
```ts
videoRef: React.RefObject<HTMLVideoElement>
isReady: boolean
countdown: number | null
filter: string  // key from FILTERS, default 'none'
facingMode: 'user' | 'environment'
```

**What it renders:**
- `<video>` element with `filter: filterDef.css` CSS applied inline, mirrored via `scaleX(-1)` for front camera
- "Initializing camera..." overlay when `!isReady`
- Countdown ring SVG + large number overlay when `countdown !== null`
- White flash `animate-pulse2` overlay when `countdown === 0`
- Corner bracket decorators (viewfinder aesthetic) when `isReady`
- Filter name label at top center when `isReady`

**Note:** Imports `useEffect, useRef` from React but does not use them — unused import (known lint warning).

**The `<canvas>` for actual capture is NOT in this component.** It's a hidden `<canvas ref={canvasRef}>` in Studio.jsx. CameraCanvas only handles display.

---

### `src/components/booth/FilterList.jsx`

**Props:** `selected: string`, `onChange: (key: string) => void`

Renders all 11 filters from `FILTERS` (imported from imageProcessor). Each button shows the icon + label + description. Horizontal scroll on mobile, vertical list on desktop.

---

### `src/components/booth/FrameSelector.jsx`

**Props:** `selected: string`, `onChange: (key: string) => void`

Renders all LAYOUTS except `meme-split` (filtered out). Each button shows label + photoCount + description. Meme mode is handled separately by TemplateGrid.

---

### `src/components/booth/ColorPicker.jsx`

**Props:** `selected: string`, `onChange: (key: string) => void`

Renders all 8 COLOR_THEMES. Each button has a color swatch square, theme label, and accent dot. When selected, applies the theme's `bg` and `text` colors inline to the button itself.

---

### `src/components/booth/TemplateGrid.jsx`

**Props:**
```ts
selectedMeme: string
onSelectMeme: (id: string) => void
useMeme: boolean
onToggleMeme: () => void
```

Renders a custom toggle switch + a 2-column grid of meme template buttons (only visible when `useMeme` is true). Uses `MEME_TEMPLATES` from imageProcessor.

---

## 10. Components — Common

---

### `src/components/common/Button.jsx`

The primary reusable interactive element. All interactive surfaces should use this.

**Props:**
```ts
variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'  // default: 'primary'
size: 'sm' | 'md' | 'lg' | 'xl' | 'icon'                          // default: 'md'
onClick, disabled, className, type, icon, ...rest
```

**Variant behaviors:**
- `primary` — orange (`primary-container`) background, hard shadow, lifts on hover
- `secondary` — white surface, hard shadow, lifts on hover
- `ghost` — transparent, no border, fills on hover
- `danger` — red (`error`) background
- `accent` — green (`secondary-fixed`) background — used for Work IQ sync button

All variants have the Neo-Pop active press effect (translate +4px/+4px, shadow collapses).

---

### `src/components/common/Navbar.jsx`

Sticky header, `z-50`, 72px height, 2px bottom border with hard shadow.

**Desktop:** Brand link | Studio + Gallery nav links | "start capturing" CTA | auth state (user email truncated + logout OR login icon)

**Mobile:** Brand link | hamburger → full-width drawer with all links + auth. Drawer closes on backdrop click or link click.

**Active link detection:** `useLocation` — active links get `text-primary border-primary font-semibold`.

---

### `src/components/common/Footer.jsx`

Static footer. Brand link + Terms/Privacy/Support/Careers links (all `href="#"`) + copyright. No dynamic content.

---

## 11. Components — Gallery

---

### `src/components/gallery/PrintCard.jsx`

**Props:**
```ts
print: {
  id: string
  public_url: string | null
  dataUrl: string | null       // fallback for local-only prints
  created_at: string           // ISO timestamp
  template: string
  color: string
  filter: string
}
onDownload: (print) => void
onDelete: (print) => void
```

**Layout:** `masonry-card` class (CSS `break-inside: avoid`). Image with hover overlay showing metadata (date, time, layout, filter) + Download + Delete buttons.

Image uses both `filter: contrast(1.15) saturate(1.10)` CSS for punch in the gallery.

---

## 12. Hooks

---

### `src/hooks/useCamera.js`

Manages the WebRTC camera stream lifecycle.

**Returns:**
```ts
videoRef: RefObject<HTMLVideoElement>  // attach to <video> element
isReady: boolean
facingMode: 'user' | 'environment'
error: string | null
countdown: number | null
isCapturing: boolean
startCamera(facing?: string): Promise<void>
stopCamera(): void
flipCamera(): void
captureFrame(canvas: HTMLCanvasElement, filter?: string): string | null  // returns data URL
captureWithCountdown(canvas, seconds, filter): Promise<string | null>
```

**Internals:**
- `streamRef` holds the active `MediaStream`
- `startCamera` stops existing stream, calls `getUserMedia` with `{ video: { facingMode, width: 1280, height: 960, aspectRatio: 4/3 }, audio: false }`
- `captureFrame` mirrors front camera via canvas `translate + scaleX(-1)`, draws video frame, returns `toDataURL('image/jpeg', 0.92)`
- `captureWithCountdown` runs a `setInterval` every 1000ms, counts down, then calls `captureFrame`
- Cleanup: `useEffect` calls `stopCamera` on unmount

**Constraints:** Requests 1280×960 ideal. Actual resolution depends on device.

---

### `src/hooks/useSupabaseStorage.js`

Handles all Supabase storage + database operations for prints.

**Returns:**
```ts
uploading: boolean
progress: number  // 0-100 (simulated: 30 → 70 → 100)
error: string | null
uploadPrint(dataUrl, userId, metadata): Promise<{ publicUrl, path } | null>
fetchUserPrints(userId): Promise<Print[]>
deletePrint(printId, storagePath): Promise<boolean>
```

**Upload flow:**
1. Convert data URL to Blob (`dataUrlToBlob`)
2. Upload to Supabase Storage bucket `photobooth-prints` at path `{userId}/{timestamp}.jpg`
3. Get public URL from storage
4. Insert record to `prints` table with metadata

**Metadata saved per print:**
```ts
{
  user_id, storage_path, public_url,
  template, layout, color, filter, created_at
}
```

**Note:** Progress is simulated at fixed checkpoints (30%, 70%, 100%), not real upload progress.

---

## 13. Context

---

### `src/context/AuthContext.jsx`

Provides auth state app-wide via React Context.

**Context value:**
```ts
{
  user: User | null        // Supabase user object
  session: Session | null  // full session
  loading: boolean         // true during initial session check
  signInWithGoogle(): Promise<void>  // OAuth redirect to Google
  signOut(): Promise<void>
}
```

**Behavior:**
- On mount: `supabase.auth.getSession()` to hydrate initial state
- Subscribes to `supabase.auth.onAuthStateChange` for all future changes
- `signInWithGoogle` uses `signInWithOAuth({ provider: 'google', redirectTo: origin + '/studio' })`
- Cleanup: unsubscribes on unmount

**Usage pattern:**
```jsx
import { useAuth } from '../context/AuthContext'
const { user, signInWithGoogle, signOut } = useAuth()
```
Throws if used outside `<AuthProvider>`.

---

## 14. Lib

---

### `src/lib/supabaseClient.js`

Singleton Supabase client. Reads from `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Falls back to placeholder strings (with console.warn) if vars are missing so the app doesn't crash on load.

```js
export const supabase = createClient(url, key)
```

Import this anywhere you need Supabase access.

---

## 15. Utils — `imageProcessor.js`

The core image processing engine. Pure functions — no React, no side effects.

---

### `FILTERS` object

11 filter definitions. Each has:
```ts
{
  label: string      // Display name
  css: string        // CSS filter string applied to <video> in CameraCanvas
  icon: string       // Emoji/symbol for UI
  description: string
}
```

| Key | Label | Effect |
|---|---|---|
| `none` | Original | No filter |
| `clarendon` | Clarendon | High contrast, saturated, cool-warm |
| `gingham` | Gingham | Soft warm nostalgic |
| `moon` | Moon | Full grayscale, high brightness |
| `clarendonWarm` | Reyes | Faded vintage, warm |
| `inkwell` | Inkwell | B&W editorial, high contrast |
| `valencia` | Valencia | Warm fade, sepia tones |
| `pop` | Pop | Maximum vibrancy |
| `brooklyn` | Brooklyn | Cool urban fade |
| `fade` | Faded | Soft matte, lifted shadows |
| `nashville` | Nashville | Warm pink vintage |

⚠️ **Gap:** WORK_IQ_VIBES in Studio.jsx references `'vivid'`, `'warm'`, `'noir'` as filter keys. These **do not exist** in FILTERS. `'vivid'` → should be `'clarendon'` or `'pop'`, `'warm'` → `'nashville'`, `'noir'` → `'inkwell'`. The filter falls back to `'none'` silently when a bad key is passed.

---

### `LAYOUTS` object

12 layout definitions. Slots are calculated dynamically via `Object.entries(LAYOUTS).forEach(...)` at module load time.

Each layout has:
```ts
{
  label: string
  description: string
  photoCount: number
  width: number      // canvas width in pixels
  height: number     // canvas height in pixels
  slotGap: number
  slots: Slot[]      // calculated on load: [{ x, y, w, h }]
  borderWidth: number
  labelArea: { x, y, w, h } | null
  labelLines: LabelLine[]
  centered: boolean
  isMeme?: boolean
}
```

| Key | Label | Photos | Canvas Size |
|---|---|---|---|
| `strip-2x3` | Classic Strip | 3 | 500×1500 |
| `strip-2x4` | Extended Strip | 4 | 500×2000 |
| `grid-2x2` | Grid Classic | 4 | 1200×900 |
| `featured-3` | Hero Feature | 3 | 1200×900 |
| `wide-1` | Full Frame | 1 | 1200×900 |
| `square-grid` | Square Grid | 4 | 1080×1080 |
| `portrait-strip` | Portrait Strip | 3 | 600×1600 |
| `meme-split` | Meme Split | 4 | 1200×1600 |

(FrameSelector also has 4 layout entries not fully listed in the README — confirm exact keys from the LAYOUTS object.)

---

### `COLOR_THEMES` object

8 themes. Each has:
```ts
{
  label: string
  bg: string       // background hex
  border: string   // border color hex
  text: string     // text color hex
  accent: string   // watermark / accent hex
  pattern: null | 'dots' | 'grid' | 'stars' | 'hearts' | 'lines' | 'circuit'
}
```

| Key | Label | BG | Pattern |
|---|---|---|---|
| `white` | Pure White | #FFFFFF | none |
| `cream` | Studio Cream | #FAF8F5 | dots |
| `black` | Midnight Black | #1b1c1c | grid |
| `violet` | Neon Violet | #1a0533 | stars |
| `pink` | Bubblegum Pink | #fff0f6 | hearts |
| `mint` | Mint Fresh | #f0fdf4 | dots |
| `orange` | Pop Orange | #fff7ed | lines |
| `spacebeans` | Space Beans | #0d0d0d | circuit |

---

### `compositePrint(photos, layoutKey, colorKey, filterKey, options)` → `Promise<string>`

Main canvas compositor. Returns base64 JPEG data URL at 95% quality.

**Pipeline:**
1. Create offscreen `<canvas>` at layout dimensions
2. Fill background with `theme.bg`
3. Draw background pattern (`drawPattern`)
4. Draw outer border frame + inner border line
5. For each slot: load photo as `Image`, clip to slot rect, `coverFit` (center-crop), draw, apply `applyCanvasFilter` if needed, draw slot border + inner highlight
6. Draw label lines (font: Space Grotesk for large, JetBrains Mono for small)
7. Draw `lumi.` watermark in bottom-right corner
8. Return `canvas.toDataURL('image/jpeg', 0.95)`

**`coverFit(imgW, imgH, boxW, boxH)`** — calculates `{ sx, sy, sw, sh }` for CSS `object-fit: cover` equivalent on canvas. Uses `Math.max(boxW/imgW, boxH/imgH)` scale.

**`applyCanvasFilter(ctx, filterKey, x, y, w, h)`** — only handles `'noir'` (grayscale pixel manipulation via `getImageData`). All other filters are CSS-only on the video element.

**`drawPattern(ctx, pattern, color, w, h)`** — draws subtle background patterns at `globalAlpha: 0.06`.

---

### `compositeMemePrint(photos, memeTemplateId, colorKey, options)` → `Promise<string>`

Thin wrapper — calls `compositePrint(photos, 'meme-split', colorKey, 'none', { memeTemplate: memeTemplateId })`.

⚠️ **Gap:** `memeTemplate` is passed in options but `compositePrint` does not read or render it. The meme image is never actually drawn on the canvas. Meme mode renders the meme-split layout with empty slots where the meme image would go.

---

### `MEME_TEMPLATES` array

```js
[
  { id: 'monkey', label: 'Monkey See', emoji: '🐒', description: '...' },
  { id: 'doge',   label: 'Doge Wow',   emoji: '🐕', description: '...' },
  { id: 'drake',  label: 'Drake Nod',  emoji: '👆', description: '...' },
  { id: 'distracted', label: 'Distracted BF', emoji: '👀', ... },
  { id: 'this-is-fine', label: 'This Is Fine', emoji: '🔥', ... },
  { id: 'galaxy-brain', label: 'Galaxy Brain', emoji: '🧠', ... },
]
```
Actual meme image files are not present in `src/assets/memes/`. The folder is empty.

---

## 16. Config Files

### `vite.config.js`
```js
{ plugins: [react()], server: { port: 3000, open: true } }
```

### `postcss.config.js`
Standard Tailwind + Autoprefixer setup.

### `tailwind.config.js`
Content paths: `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`. Full design system defined in `theme.extend`. No Tailwind plugins.

### `package.json`
- Name: `lumi-studio-pop`
- Scripts: `dev` / `build` / `preview` (standard Vite)
- No test runner defined

---

## 17. Data Models (Supabase)

### Storage Bucket: `photobooth-prints`
- Public bucket
- Path structure: `{userId}/{timestamp}.jpg`
- Anonymous users upload to `anon/{timestamp}.jpg`

### Table: `prints`
```sql
id          uuid (PK, auto)
user_id     uuid (nullable — null for guest uploads)
storage_path text           -- e.g. "abc123/1718000000000.jpg"
public_url  text            -- Supabase public CDN URL
template    text            -- layout key e.g. 'strip-2x3'
layout      text            -- same as template (redundant field)
color       text            -- color theme key e.g. 'cream'
filter      text            -- filter key e.g. 'pop'
created_at  timestamptz
```

RLS policies are NOT defined in this codebase — assumed to be configured in the Supabase dashboard. The app expects users can read/write their own rows.

---

## 18. Microsoft Work IQ Integration

All Work IQ logic lives in `src/screens/Studio.jsx`.

### Architecture

```
User clicks "Sync Work IQ Mood"
    ↓
handleWorkIqVibeCheck()
    ↓
Check VITE_WORK_IQ_TOKEN
    ├── No token → Demo Mode (mock events, fake delay)
    └── Token present → fetch Microsoft Graph API
            ↓
            GET https://graph.microsoft.com/v1.0/me/events
              ?$top=5&$select=subject,start&$orderby=start/dateTime desc
            Authorization: Bearer {token}
            ↓
            Parse response.value[].subject
            ↓
            resolveVibe(subjects.join(' ').toLowerCase())
            ↓
            applyVibe(vibe)
                ↓
                setSelectedColor(vibe.color)
                setSelectedFilter(vibe.filter)
                setWorkIqVibe(vibe)
                setFinalPrint(null)  // forces re-composite
```

### WORK_IQ_VIBES table

| Label | Keywords | Color Key | Filter Key | Accent |
|---|---|---|---|---|
| FOCUS MODE | meeting, review, client, project, sprint, standup, 1:1 | `black` | `noir` | #ff5c00 |
| CREATIVE FLOW | design, creative, launch, brainstorm, workshop, ideation | `pink` | `vivid` | #f472b6 |
| STUDY SESSION | study, exam, learn, training, course, class | `violet` | `fade` | #a855f7 |
| SOCIAL VIBE | lunch, break, coffee, social, party, happy hour | `orange` | `warm` | #ff5c00 |
| SHIP IT MODE | deploy, release, ship, production, go live | `mint` | `pop` | #22c55e |

### Demo Mode

Triggers when `VITE_WORK_IQ_TOKEN` is missing. Simulates:
1. 900ms delay "Connecting to Microsoft Graph..."
2. 700ms delay "Reading calendar context..."
3. Injects mock events: `['Design Review — Q3 Creative Sprint', 'Brainstorm Session: Launch Campaign']`
4. Resolves to CREATIVE FLOW vibe → pink + vivid

### Known Issues
- Filter keys `'noir'`, `'vivid'`, `'warm'` in WORK_IQ_VIBES don't match any keys in the `FILTERS` object in imageProcessor.js. The filter silently falls back to `'none'` when applied via CameraCanvas/FilterList.
- Token is a short-lived Graph Explorer token — expires in ~1 hour. No refresh logic.
- Token is stored in `.env.local` (client-side) — acceptable for a demo, not for production.

---

## 19. Key Patterns & Conventions

### Component naming
- PascalCase files and exports for all components and screens
- camelCase for hooks (`useCamera`, `useSupabaseStorage`)
- Screens are in `/screens`, reusable UI in `/components`

### State management
- No Redux, no Zustand. Pure `useState` + `useCallback` + `useEffect`
- Global state only for auth (React Context)
- All studio state is local to Studio.jsx

### Tailwind conventions
- All spacing uses custom tokens (`px-sm`, `py-xs`, `gap-md`) — never raw pixel values
- All typography uses semantic tokens (`font-technical-sm text-technical-sm`, etc.)
- Color tokens everywhere — never hex literals in className strings
- Responsive: `md:` prefix for 768px+ breakpoint (primary breakpoint), `lg:` for 1024px+

### Image handling
- Camera frames: captured as `image/jpeg` at 0.92 quality from canvas
- Final prints: `image/jpeg` at 0.95 quality
- All images use `object-cover` / `coverFit` for consistent framing

### Error handling pattern
```js
try {
  // operation
} catch (err) {
  console.error('[lumi] Context: ', err)
  // set error state or fall back gracefully
}
```
The `[lumi]` prefix on all console logs makes filtering easy.

### Null safety for Supabase
If env vars are missing, supabase client uses placeholder strings. The client won't crash on init but API calls will fail. The app handles this gracefully at the feature level (gallery shows empty state, upload silently fails).

---

## 20. Known Gaps & TODOs

| # | Gap | Location | Impact |
|---|---|---|---|
| 1 | Filter keys in WORK_IQ_VIBES (`'noir'`, `'vivid'`, `'warm'`) don't match FILTERS object keys | Studio.jsx / imageProcessor.js | Work IQ vibe doesn't actually change the filter in CameraCanvas |
| 2 | Meme images not implemented — `src/assets/memes/` is empty | imageProcessor.js `compositeMemePrint` | Meme mode composites layout but no meme image is drawn |
| 3 | `compositeMemePrint` passes `memeTemplate` in options but `compositePrint` never reads it | imageProcessor.js | Same as above |
| 4 | `Processing.jsx` is not used in the actual Studio capture flow | Processing.jsx | Dead route — `/processing` is accessible but nothing navigates there |
| 5 | Unused imports in CameraCanvas.jsx (`useEffect`, `useRef`) | CameraCanvas.jsx | Lint warning only |
| 6 | Gallery `DEMO_PRINTS` constant defined but never rendered | Gallery.jsx | Dead code |
| 7 | `featured-3` layout — slot calculation uses legacy grid code, not the centered strip logic | imageProcessor.js | May not layout correctly for 3-photo featured layout |
| 8 | Work IQ token is short-lived (~1hr) with no refresh | Studio.jsx | Token expires silently, error shown in IQ panel |
| 9 | RLS policies for Supabase `prints` table not defined in codebase | useSupabaseStorage.js | Assumed to be set in Supabase dashboard |
| 10 | No shareable print URL / public print page | — | Prints can only be downloaded, not shared via link |
| 11 | `applyCanvasFilter` only handles `'noir'` — all other filters are CSS-only on video | imageProcessor.js | Final JPEG composites don't have filters baked in (except noir) |
| 12 | `layout` and `template` fields in prints table are identical | useSupabaseStorage.js | Redundant DB column |

---

*End of CODEBASE.md — This document reflects 100% of the current source files.*
