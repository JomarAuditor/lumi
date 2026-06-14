<div align="center">

# 📸 lumi. studio

### *Your camera. Your context. Your print.*

**A context-aware, browser-native photobooth powered by React 18, HTML5 Canvas, and Microsoft Work IQ.**

<br/>

[![Track](https://img.shields.io/badge/🎨_Track-Creative_Apps-ff5c00?style=for-the-badge)](https://github.com/JomarAuditor/lumi)
[![IQ Layer](https://img.shields.io/badge/💡_IQ_Layer-Work_IQ-0078D4?style=for-the-badge&logo=microsoft)](https://learn.microsoft.com/en-us/graph/overview)
[![Built with GitHub Copilot](https://img.shields.io/badge/Built_with-GitHub_Copilot-000?style=for-the-badge&logo=github)](https://github.com/features/copilot)
[![Hackathon](https://img.shields.io/badge/Agents_League-2026-62ff96?style=for-the-badge)](https://github.com)

<br/>

[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=000)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat-square&logo=vite&logoColor=fff)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=fff)](https://supabase.com)
[![Microsoft Graph](https://img.shields.io/badge/Microsoft_Graph_API-0078D4?style=flat-square&logo=microsoft&logoColor=fff)](https://learn.microsoft.com/en-us/graph/overview)

</div>

---

## 🎯 The Idea in One Sentence

> **lumi. is a photobooth that reads your Microsoft 365 calendar and automatically sets the mood — theme, filter, and vibe — before you even pick up the camera.**

Most photo apps treat every moment the same. lumi. doesn't. Whether you're heading into a design sprint, wrapping up a client review, or deploying to production — your studio shifts with you. Open the browser, let Work IQ read your day, and shoot. No configuration. No friction. Just your aura, printed.

---

## ✨ What Makes It Special

| Without lumi. | With lumi. |
|---|---|
| Open photo app | Open browser — nothing to install |
| Manually pick a filter | Work IQ reads your calendar and picks the vibe |
| Export a flat JPEG | Composite a print-quality photo strip with layout + color theme |
| Lose your photos | Auto-upload to personal cloud gallery |
| Static, lifeless UI | Studio UI morphs in real time to match your work context |

---

## 🧠 Microsoft Work IQ Integration

> **IQ Layer used: Work IQ** — The intelligence layer behind Microsoft 365 Copilot.

This is the core intelligence feature of lumi. It's not a sidebar widget — it *is* the product experience.

### How it works

```
Microsoft Graph API (/me/events)
        │
        ▼
   Fetch 5 most recent calendar events
        │
        ▼
   Parse event subjects for keyword signals
        │
        ▼
   Classify into one of 5 "vibes"
        │
        ▼
   Morph studio: color theme + filter + status message
```

### Vibe Mapping Table

| Calendar Signal | Keywords | Theme Applied | Filter |
|---|---|---|---|
| 🧠 Focus Mode | `meeting` `review` `client` `sprint` `standup` | Midnight Black | Noir |
| 🎨 Creative Flow | `design` `creative` `brainstorm` `launch` `workshop` | Bubblegum Pink | Vivid |
| 📚 Study Mode | `study` `exam` `training` `course` `class` | Neon Violet | Fade |
| ☕ Social Break | `lunch` `coffee` `social` `party` `happy hour` | Pop Orange | Warm |
| 🚀 Ship Mode | `deploy` `release` `ship` `production` `go live` | Mint Fresh | Pop |

### Demo Mode — No Microsoft Account Needed

No `VITE_WORK_IQ_TOKEN`? No problem. lumi. enters **Demo Mode** automatically:

- Simulates a real Graph API sync with realistic mock calendar events
- Animates the full sync sequence with live status updates
- Applies a live vibe transformation — theme + filter — right before your eyes
- Shows the Microsoft Graph attribution panel so judges see the integration clearly

**The full Work IQ experience is demonstrable with zero setup.**

---

## 🚀 Live Demo

> **[▶ Open lumi. studio →](https://github.com/JomarAuditor/lumi)**

To try Work IQ with your real Microsoft 365 calendar:
1. Visit [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in → copy the **Access Token**
3. Paste it into `VITE_WORK_IQ_TOKEN` in `.env.local`
4. Open `/studio` → click **Sync Work IQ Mood**

---

## 🖼️ Features at a Glance

### 📸 Live Camera Studio
- WebRTC camera feed directly in the browser — no plugins, no installs
- Real-time CSS filter preview on the live video feed
- 3-second animated countdown timer before each capture
- Front/back camera flip with one tap

### 🖨️ 12 Print Layouts
Composited entirely via **HTML5 Canvas** — pixel-perfect, print-quality output.

| Layout | Format | Photos |
|---|---|---|
| Classic Strip | 2×3 vertical | 3 |
| Extended Strip | 2×4 vertical | 4 |
| Grid Classic | 2×2 landscape | 4 |
| Hero Feature | Large + 2 side | 3 |
| Full Frame | Single bleed | 1 |
| Square Grid | 1080×1080 | 4 |
| Portrait Strip | Tall vertical | 3 |
| Meme Split | Side-by-side | 4 |

### 🎨 8 Color Themes
Each theme includes a background color, border, accent, text color, and a procedurally drawn canvas pattern.

`Pure White` · `Studio Cream` · `Midnight Black` · `Neon Violet` · `Bubblegum Pink` · `Mint Fresh` · `Pop Orange` · `Space Beans`

### ✨ 11 Photo Filters
Applied live on the camera preview. Baked into the final composite via Canvas API.

`Original` · `Clarendon` · `Gingham` · `Moon` · `Reyes` · `Inkwell` · `Valencia` · `Pop` · `Brooklyn` · `Faded` · `Nashville`

### 🐒 Meme Mode
Pick a viral meme frame, build your lineup, and shoot a side-by-side comparison strip. Packs include Monkey Biz, Spongebob, Shrek, Random Vibes, and more.

### ☁️ Cloud Gallery
- Google OAuth sign-in via Supabase Auth
- Prints auto-upload to Supabase Storage on download
- Personal gallery with masonry and grid view modes
- Sort by newest/oldest, filter by layout type
- Delete prints from the cloud

---

## 🏗️ How the Canvas Pipeline Works

This is the technical heart of lumi. — a pure HTML5 Canvas image compositor with no third-party image libraries.

```
1. USER CAPTURES  → WebRTC video frame → hidden <canvas> → base64 JPEG
         │
2. LAYOUT SLOTS   → pixel-precise slot coordinates per layout definition
         │
3. COVER-FIT      → Math.max(scale) crop — photos always fill slots cleanly
         │
4. FILTERS        → CSS filters on live preview; Noir = pixel-level grayscale
                    via getImageData manipulation on canvas
         │
5. THEMES         → background color + procedural pattern (dots/grid/stars/
                    hearts/circuit/lines) drawn at globalAlpha: 0.06
         │
6. LABEL AREA     → Space Grotesk for event names, JetBrains Mono for metadata
         │
7. EXPORT         → canvas.toDataURL('image/jpeg', 0.95) → download + upload
```

Every composite is done **client-side** — no server processing, no image uploads mid-flow, no latency.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 | Component model fits the multi-panel studio layout |
| Build | Vite 5 | Fast HMR during development, optimized output |
| Styling | Tailwind CSS 3 | Custom Neo-Pop design system via `theme.extend` |
| Camera | WebRTC `getUserMedia` | Native browser API — no plugins required |
| Image Processing | HTML5 Canvas API | Full control over compositing, filters, and export |
| Intelligence Layer | Microsoft Graph API (Work IQ) | Calendar context → studio mood |
| Auth | Supabase Auth (Google OAuth) | Instant auth, no password management |
| Storage | Supabase Storage | Serverless cloud gallery with public CDN URLs |
| Routing | React Router v6 | Clean SPA navigation |
| Icons | Google Material Symbols | Consistent icon system |
| AI Dev Tool | GitHub Copilot | Accelerated the entire build (see below) |

---

## 🤖 Built with GitHub Copilot

GitHub Copilot was an active collaborator throughout this build — not just autocomplete.

### Where Copilot made a real difference

**Canvas compositor** — The `compositePrint` function handles 12 layouts, 8 color themes, background patterns, cover-fit cropping, label rendering, and watermark placement. Copilot drafted the initial slot-mapping architecture and the `coverFit` algorithm. I refined it for pixel accuracy.

**Work IQ pipeline** — The Graph API fetch pattern, token header setup, keyword-to-vibe classification logic, and the Demo Mode simulation sequence were all prototyped with Copilot and then hardened for edge cases (missing token, empty calendar, network errors).

**Design system translation** — The Neo-Pop design tokens (thick borders, hard shadows, high-contrast palettes, neo-brutalist spacing) needed to be expressed as Tailwind utility patterns. Copilot helped systematize what would have been tedious `tailwind.config.js` work.

**Component scaffolding** — Studio.jsx (the most complex screen) started as a Copilot-generated shell with the three-column layout and tab system. The real logic — capture flow, auto-composite, Work IQ state machine — was written and iterated by me.

Copilot didn't replace engineering judgment. It eliminated the boilerplate so focus could stay on the parts that actually matter: the canvas pipeline, the Work IQ integration, and the user experience.

---

## 📋 Judging Criteria Coverage

| Criterion | How lumi. addresses it |
|---|---|
| **Accuracy & Relevance (20%)** | Fully implements Microsoft Work IQ via Graph API `/me/events`. Satisfies Creative Apps track + Microsoft IQ requirement. Demo mode ensures the integration is always demonstrable. |
| **Reasoning & Multi-step Thinking (20%)** | Two distinct multi-step pipelines: (1) Work IQ: fetch → parse → classify → morph; (2) Canvas: capture → filter → composite → upload. Both are chained, stateful, and produce meaningful output at each step. |
| **Creativity & Originality (15%)** | A photobooth driven by enterprise calendar intelligence is a genuinely novel concept. The Neo-Pop Minimalist design system — hard borders, flat shadows, uppercase mono labels — gives it a distinctive visual identity that stands out from every other React project. |
| **User Experience & Presentation (15%)** | Three-panel studio layout, live filter preview, animated Work IQ sync sequence, demo mode with zero setup, mobile-responsive with a real hamburger drawer, and a full marketing landing page with scroll sections. |
| **Reliability & Safety (20%)** | Graceful error handling on all API calls. Demo fallback when token is absent. No secrets exposed in the client bundle (all `VITE_` vars are optional with safe fallbacks). Supabase RLS-compatible data model. Camera stream properly cleaned up on unmount. |
| **Community Vote (10%)** | Demo mode removes the #1 barrier — no one needs a Microsoft 365 account to try the Work IQ sync. The meme mode and colorful themes make it inherently shareable. |

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project with Google OAuth enabled and a `photobooth-prints` storage bucket

### Setup

```bash
# Clone
git clone https://github.com/JomarAuditor/lumi.git
cd lumi

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional — if absent, Work IQ runs in Demo Mode automatically
VITE_WORK_IQ_TOKEN=your_graph_api_access_token
```

**Getting a Work IQ token:**
1. Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in with your Microsoft account
3. Click **Access Token** tab → copy the token
4. Paste as `VITE_WORK_IQ_TOKEN` — that's it

### Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run preview  # preview production build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── booth/           # CameraCanvas, FilterList, ColorPicker,
│   │                    # FrameSelector, TemplateGrid
│   ├── common/          # Button, Navbar, Footer
│   └── gallery/         # PrintCard
├── context/
│   └── AuthContext.jsx  # Supabase auth state + Google OAuth
├── hooks/
│   ├── useCamera.js     # WebRTC stream management + countdown capture
│   └── useSupabaseStorage.js  # Upload, fetch, delete prints
├── lib/
│   └── supabaseClient.js
├── screens/
│   ├── Landing.jsx      # Marketing homepage with Work IQ section
│   ├── Studio.jsx       # Main photobooth — Work IQ panel lives here
│   ├── Gallery.jsx      # Personal print gallery (masonry + grid)
│   ├── Processing.jsx   # Animated processing screen
│   └── AuthModal.jsx    # Google sign-in page
└── utils/
    └── imageProcessor.js  # Canvas compositor · 11 filters · 12 layouts
                           # 8 color themes · 6 meme templates
```

---

## 🗺️ Roadmap

- [ ] Supabase `prints` table schema + RLS policies documentation
- [ ] Email/password auth fallback
- [ ] Share to social via Web Share API
- [ ] Custom event name input in studio
- [ ] Print-to-PDF for physical printing
- [ ] More meme template packs

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for the Agents League Hackathon 2026 · Creative Apps Track**

*Microsoft Work IQ · GitHub Copilot · HTML5 Canvas · WebRTC*

Made with ☕, too many filter tweaks, and a genuine belief that your camera should know what kind of day you're having.

**lumi. — your aura, printed.**

</div>
