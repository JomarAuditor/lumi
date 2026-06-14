# LUMI Studio Pop

**A context-aware, Neo-Pop Minimalist digital photobooth powered by React 18, Microsoft Work IQ, and HTML5 Canvas.**

[![Status](https://img.shields.io/badge/status-submission_ready-brightgreen?style=flat-square)](https://github.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Microsoft Graph](https://img.shields.io/badge/Microsoft_Graph-Work_IQ-0078D4?style=flat-square&logo=microsoft)](https://learn.microsoft.com/en-us/graph/overview)
[![Track](https://img.shields.io/badge/Track-🎨_Creative_Apps-ff5c00?style=flat-square)](https://github.com)
[![Built with GitHub Copilot](https://img.shields.io/badge/Built_with-GitHub_Copilot-000?style=flat-square&logo=github)](https://github.com/features/copilot)

---

## Project Description

LUMI Studio Pop is a browser-native photobooth that captures, filters, and composites photos into 12 high-fidelity print layouts via the HTML5 Canvas API — turning a static selfie session into a polished, creative workflow. It solves the problem of one-size-fits-all photo apps by introducing **context-aware UI morphing**: the studio's visual theme — color palette, filter style, and ambient messaging — adapts in real time to the user's current work context via Microsoft Work IQ. The result is a photobooth that feels alive, responds to where you are in your day, and produces print-quality output in seconds.

---

## Microsoft IQ Integration: Work IQ

> **IQ Layer Used: Work IQ** — The intelligence layer behind Microsoft 365 Copilot.

LUMI Studio Pop integrates the **Microsoft Work IQ** intelligence layer via the **Microsoft Graph API** (`/me/events`) to achieve **context-aware UI morphing**. When a user triggers a Work IQ sync, the app:

1. **Reads recent calendar event subjects** from the Microsoft Graph `events` endpoint
2. **Classifies work context** using keyword pattern matching across five vibe categories
3. **Morphs the studio's visual theme** — border color, background pattern, filter, and status messaging — to match the detected context

### Vibe Mapping Logic

| Calendar Context | Keywords Detected | Studio Theme Applied |
|---|---|---|
| Focused Work | `meeting`, `review`, `client`, `sprint` | Midnight Black + Noir Filter |
| Creative Session | `design`, `creative`, `brainstorm`, `launch` | Bubblegum Pink + Vivid Filter |
| Study / Learning | `study`, `exam`, `training`, `course` | Neon Violet + Fade Filter |
| Social / Break | `lunch`, `coffee`, `social`, `party` | Pop Orange + Warm Filter |
| Deployment | `deploy`, `release`, `ship`, `go live` | Mint Fresh + Pop Filter |

This integration **reduces cognitive load** by eliminating manual theme configuration — the studio sets itself to the user's current energy. It demonstrates that creative applications can be driven by enterprise intelligence layers without sacrificing visual polish or user experience.

### Demo Mode (No Token Required)

If no `VITE_WORK_IQ_TOKEN` is set, LUMI enters **Demo Mode**: it simulates a real Work IQ sync with mock calendar events, animates the sync sequence, and applies a live vibe transformation — so the integration is fully demonstrable without Microsoft 365 credentials.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 (Neo-Pop design system) |
| Backend / Auth / Storage | Supabase |
| Intelligence Layer | Microsoft Work IQ via Microsoft Graph API |
| AI Development Tool | GitHub Copilot |
| Camera API | WebRTC (`getUserMedia`) |
| Image Processing | HTML5 Canvas API |

---

## AI-Assisted Development

LUMI Studio Pop was accelerated throughout development using **GitHub Copilot** in VS Code:

- **Frontend boilerplate**: Copilot generated the initial component scaffolding for the studio layout, sidebar tab system, and gallery masonry grid
- **Canvas pipeline**: The `compositePrint` function, slot clipping logic, and `coverFit` algorithm were drafted with Copilot and iterated for pixel-accurate output
- **Work IQ integration**: Copilot assisted with the Graph API fetch pattern, token header setup, and the keyword-to-vibe classification logic
- **Design system**: Copilot helped translate the Neo-Pop design tokens (thick borders, hard shadows, high-contrast palettes) into Tailwind utility class patterns

Using Copilot did not replace engineering judgment — it accelerated the mechanics so focus could stay on the creative and architectural decisions.

---

## Features

- **Live camera feed** with real-time CSS filter preview (8 filters), countdown timer, and front/back camera flip
- **12 print layouts** — photo strips, 2×2 grids, featured hero, single wide, and meme splits
- **8 color themes** — each with a unique background pattern (dots, grid, stars, hearts, circuit, lines)
- **Meme Mode** — 6 viral meme templates composited alongside user photos on canvas
- **Microsoft Work IQ sync** — Graph API calendar reading with animated vibe transformation
- **Supabase cloud gallery** — auto-upload on print, personal gallery with sort/filter, masonry layout
- **High-res JPEG download** — canvas output at 92% quality, ready to share or print
- **Guest mode** — full studio access without sign-in; sign in with Google to persist prints

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with:
  - Google OAuth enabled under **Authentication → Providers**
  - A storage bucket named `photobooth-prints` (set to public)
  - A `prints` table for image metadata

### Setup

```bash
git clone https://github.com/your-username/lumi-studio-pop.git
cd lumi-studio-pop
npm install
cp .env.example .env.local
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WORK_IQ_TOKEN=your_graph_api_token_here
```

> **Getting a Work IQ token:** Visit [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer), sign in with your Microsoft account, and copy the access token from the **Access Token** tab. Paste it as `VITE_WORK_IQ_TOKEN`.
>
> **No token?** LUMI runs in **Demo Mode** automatically — no setup required to see the Work IQ integration in action.

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

---

## Work IQ: How to Demo

1. Open the studio at `/studio`
2. In the right panel, scroll to **Work IQ**
3. Click **Sync Work IQ Mood**
4. Watch LUMI animate the sync, read calendar context, classify a vibe, and transform the studio theme live
5. The panel shows the detected calendar events, the active vibe label, and the Microsoft Graph attribution badge

No Microsoft 365 account needed for the demo — the built-in demo mode runs the full visual flow with realistic mock events.

---

## Project Structure

```
src/
├── components/
│   ├── booth/           # CameraCanvas, FilterList, ColorPicker, FrameSelector, TemplateGrid
│   ├── common/          # Button, Navbar, Footer
│   └── gallery/         # PrintCard
├── context/
│   └── AuthContext.jsx  # Supabase auth state
├── hooks/
│   ├── useCamera.js     # WebRTC camera management
│   └── useSupabaseStorage.js
├── lib/
│   └── supabaseClient.js
├── screens/
│   ├── Landing.jsx      # Marketing homepage with Work IQ section
│   ├── Studio.jsx       # Main photobooth UI with Work IQ panel
│   ├── Gallery.jsx      # Personal print gallery
│   ├── Processing.jsx   # Animated processing screen
│   └── AuthModal.jsx    # Google sign-in page
└── utils/
    └── imageProcessor.js  # Canvas compositor, 8 filters, 12 layouts, 8 color themes, 6 meme templates
```

---

## Judging Criteria Coverage

| Criterion | How LUMI addresses it |
|---|---|
| **Accuracy & Relevance (20%)** | Fully implements Microsoft Work IQ via Graph API; satisfies Creative Apps + Microsoft IQ requirements |
| **Reasoning & Multi-step Thinking (20%)** | Work IQ pipeline: fetch → parse → classify → morph; canvas pipeline: capture → filter → composite → upload |
| **Creativity & Originality (15%)** | Neo-Pop Minimalist design system; context-aware UI morphing applied to a photobooth is a genuinely novel concept |
| **User Experience & Presentation (15%)** | Clean three-panel studio layout, live filter preview, animated IQ panel, demo mode requires zero setup |
| **Reliability & Safety (20%)** | Graceful error handling on all API calls, demo fallback when token is absent, Supabase RLS-compatible data model, no secrets in client bundle |
| **Community Vote (10%)** | Demo mode lowers the barrier for anyone to try the Work IQ sync without a Microsoft account |

---

## License

MIT

---

<p align="center">
  Built for the <strong>Agents League Hackathon 2026</strong> · Creative Apps Track<br/>
  Powered by Microsoft Work IQ + GitHub Copilot
</p>
