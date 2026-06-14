import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'

const FEATURES = [
  {
    icon: 'photo_camera',
    title: 'Live Camera Studio',
    desc: 'WebRTC booth with real-time filters, 3-second countdown, and front/back flip.',
  },
  {
    icon: 'grid_view',
    title: 'Dual & Solo Strips',
    desc: 'Classic 3-pose and extended 4-pose — dual side-by-side or single strip, ready to share.',
  },
  {
    icon: 'palette',
    title: '8 Strip Colors',
    desc: 'Classic White, Warm Cream, Midnight, Dusty Rose, Sky Blue, Sage, Blush, Lavender.',
  },
  {
    icon: 'auto_awesome',
    title: 'Meme Mode',
    desc: 'Pick frames from any meme pack, build your lineup, shoot side-by-side comparisons.',
  },
  {
    icon: 'cloud_upload',
    title: 'Cloud Gallery',
    desc: 'Prints auto-upload to your personal gallery. Access from any device.',
  },
  {
    icon: 'bolt',
    title: 'Work IQ Sync',
    desc: 'Microsoft Graph API reads your calendar and shifts the studio theme to your work mood.',
    highlight: true,
  },
]

const TESTIMONIALS = [
  {
    name: 'Mika R.',
    handle: '@mikashots',
    text: "lumi. is literally the most fun I've had with a photo app. The meme mode is unhinged in the best way.",
    initial: 'M',
  },
  {
    name: 'Jed C.',
    handle: '@jedcreates',
    text: 'The Midnight theme with noir filter? My whole feed is lumi. prints now.',
    initial: 'J',
  },
  {
    name: 'Anya P.',
    handle: '@anyaframes',
    text: 'Used this at my birthday party. Everyone was obsessed. The strip layouts are so clean.',
    initial: 'A',
  },
]

const WORK_IQ_VIBES = [
  { icon: 'work',          label: 'Meeting / Review',  result: 'Midnight + Noir',  color: '#F0ECE8' },
  { icon: 'palette',       label: 'Design / Creative', result: 'Blush + Vivid',    color: '#E88FA0' },
  { icon: 'school',        label: 'Study / Training',  result: 'Lavender + Fade',  color: '#9B7FD4' },
  { icon: 'rocket_launch', label: 'Deploy / Ship',     result: 'Sage + Vivid',     color: '#7BBD95' },
]

const STRIP_COLORS = [
  { bg: '#FFFFFF', label: 'White' },
  { bg: '#FAF6EF', label: 'Cream' },
  { bg: '#0A1628', label: 'Midnight' },
  { bg: '#FFE4EC', label: 'Dusty Rose' },
  { bg: '#E8F4FD', label: 'Sky Blue' },
  { bg: '#EDF7EF', label: 'Sage' },
  { bg: '#FFF0F6', label: 'Blush' },
  { bg: '#F4EFFE', label: 'Lavender' },
]

/* Three photo-strip cards used in hero + CTA */
/*
  StripStack — three fanned photo strips.

  variant="hero"  → absolute-positioned, bottom-anchored inside a
                    fixed-height shell (hero section, flush to ticker)
  variant="float" → inline flex row with negative margins to create the
                    fan overlap. No absolute positioning needed — sits
                    naturally in any flex parent and centres perfectly.
*/
function StripStack({ size = 'md', variant = 'float' }) {
  const isMd = size === 'md'

  /* Strip widths: [left, center, right] */
  const sw = isMd
    ? { left: 64, center: 76, right: 64 }
    : { left: 84, center: 100, right: 84 }

  /* Photo cell height = 75% of strip width */
  const cellPct = '75%'

  const strips = [
    { colors: ['#0A1628', '#1C1A1E', '#FAF6EF', '#FAF6EF'], rotate: -9, pos: 'left'   },
    { colors: ['#FFFFFF', '#FAF6EF', '#1C1A1E', '#FAF6EF'], rotate:  1, pos: 'center' },
    { colors: ['#FFF0F6', '#F4EFFE', '#EDF7EF', '#FAF6EF'], rotate:  8, pos: 'right'  },
  ]

  const widths = [sw.left, sw.center, sw.right]

  /* ── FLOAT variant: plain inline flex, fan via rotate + overlap ── */
  if (variant === 'float') {
    const overlap = isMd ? -16 : -20   // px — negative margin to overlap strips
    return (
      <div className="flex items-center" style={{ gap: overlap }}>
        {strips.map((s, i) => (
          <div
            key={i}
            className="photo-strip-frame flex flex-col flex-shrink-0"
            style={{
              width: widths[i],
              transform: `rotate(${s.rotate}deg)`,
              zIndex: i === 1 ? 3 : i === 0 ? 1 : 2,
            }}
          >
            {s.colors.map((c, j) => (
              <div
                key={j}
                className="w-full border border-on-background/20"
                style={{ backgroundColor: c, paddingBottom: cellPct }}
              />
            ))}
            <div className="py-1 text-center border-t-2 border-on-background">
              <span className="font-technical-sm text-[7px] text-on-surface-variant uppercase tracking-widest">
                lumi.
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ── HERO variant: absolute bottom-anchored in fixed shell ── */
  const shellH = isMd ? 230 : 300
  const shellW = isMd ? 200 : 260

  return (
    <div className="relative flex-shrink-0" style={{ width: shellW, height: shellH }}>
      {strips.map((s, i) => {
        const posStyle =
          s.pos === 'center'
            ? { left: '50%', transform: `translateX(-50%) rotate(${s.rotate}deg)`, zIndex: i === 1 ? 3 : 2 }
            : {
                ...(s.pos === 'left' ? { left: 0 } : { right: 0 }),
                transform: `rotate(${s.rotate}deg)`,
                zIndex: i === 0 ? 1 : 2,
              }
        return (
          <div
            key={i}
            className="photo-strip-frame absolute bottom-0 flex flex-col"
            style={{ width: widths[i], ...posStyle }}
          >
            {s.colors.map((c, j) => (
              <div
                key={j}
                className="w-full border border-on-background/20"
                style={{ backgroundColor: c, paddingBottom: cellPct }}
              />
            ))}
            <div className="py-1 text-center border-t-2 border-on-background">
              <span className="font-technical-sm text-[7px] text-on-surface-variant uppercase tracking-widest">
                lumi.
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="w-full overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-[0.045] pointer-events-none" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 pb-0">
          {/*
            Single row on desktop: copy left, strips right, both vertically centered.
            On mobile: copy on top, strips below it centered — no hiding.
          */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-6">

            {/* ── Copy column ── */}
            <div className="flex flex-col gap-4 pb-0 md:max-w-[540px]">
              {/* Badge */}
              <div className="hero-enter hero-enter-delay-1 inline-flex items-center gap-2 border-2 border-on-background bg-secondary-fixed px-3 py-1.5 neo-pop-shadow w-fit">
                <span className="material-symbols-outlined text-[13px] text-on-secondary-fixed">auto_awesome</span>
                <span className="font-technical-sm text-[11px] text-on-secondary-fixed uppercase tracking-widest">
                  Meme Mode — now live
                </span>
              </div>

              {/* Headline */}
              <h1
                className="hero-enter hero-enter-delay-2 font-headline-xl leading-[0.86] tracking-tighter text-on-surface uppercase"
                style={{ fontSize: 'clamp(52px, 9vw, 108px)' }}
              >
                lumi<br />
                <span className="text-primary-container">studio.</span>
              </h1>

              <p className="hero-enter hero-enter-delay-3 font-body-md text-[15px] text-on-surface-variant max-w-[400px] leading-relaxed">
                The browser-native photobooth. Capture, filter, and composite
                print-quality photos — no app, no setup.
              </p>

              {/* CTAs */}
              <div className="hero-enter hero-enter-delay-3 flex flex-col sm:flex-row gap-3 mt-1">
                <Button size="lg" onClick={() => navigate('/studio')} className="w-full sm:w-auto">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  Start Capturing
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/gallery')} className="w-full sm:w-auto">
                  View Gallery
                </Button>
              </div>

              {/* Stats */}
              <div className="hero-enter hero-enter-delay-4 flex gap-8 pt-4 border-t-2 border-on-background mt-2 mb-8 md:mb-10">
                {[['4', 'layouts'], ['8', 'colors'], ['5', 'meme packs']].map(([num, label]) => (
                  <div key={label} className="flex flex-col">
                    <span className="font-headline-xl text-[30px] leading-none tracking-tighter text-primary-container">
                      {num}
                    </span>
                    <span className="font-technical-sm text-[11px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Strip stack — float, centered in flex row on all screens ── */}
            <div className="hero-enter hero-enter-delay-4 flex justify-center md:justify-end flex-shrink-0 pb-8 md:pb-10">
              <div className="md:hidden">
                <StripStack size="md" variant="float" />
              </div>
              <div className="hidden md:block">
                <StripStack size="lg" variant="float" />
              </div>
            </div>

          </div>
        </div>

        {/* Ticker */}
        <div className="border-t-2 border-on-background bg-primary-container overflow-hidden h-9 flex items-center relative z-10">
          <div className="flex gap-12 animate-[ticker_22s_linear_infinite] whitespace-nowrap">
            {Array(8).fill(['CAPTURE', 'FILTER', 'PRINT', 'SHARE', 'MEME MODE', 'WORK IQ SYNC', 'LUMI STUDIO']).flat().map((t, i) => (
              <span key={i} className="font-technical-sm text-[11px] text-on-primary-container uppercase tracking-widest flex-shrink-0">
                {t} <span className="opacity-60">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ────────────────────────────────────────────── */}
      <section className="w-full border-b-2 border-on-background bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3.5">
            {[
              { icon: 'devices',    text: 'Works on every browser' },
              { icon: 'bolt',       text: 'No app download' },
              { icon: 'lock',       text: 'Photos stay private' },
              { icon: 'cloud_sync', text: 'Auto cloud backup' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-primary">{item.icon}</span>
                <span className="font-technical-sm text-[12px] text-on-surface-variant uppercase tracking-wide">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="w-full border-t-2 border-on-background bg-surface-container-low py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 md:mb-8">
            <div>
              <span className="font-technical-sm text-[11px] text-primary uppercase tracking-widest">What's inside</span>
              <h2
                className="font-headline-xl text-on-surface lowercase tracking-tighter mt-1"
                style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}
              >
                everything you need.
              </h2>
            </div>
            <Button variant="secondary" size="lg" onClick={() => navigate('/studio')} className="hidden sm:inline-flex w-auto flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              Open Studio
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`bg-surface border-2 border-on-background p-4 neo-pop-shadow
                  hover:shadow-[6px_6px_0px_0px_#1b1c1c] hover:-translate-x-[2px] hover:-translate-y-[2px]
                  transition-all duration-150 ${
                  f.highlight ? 'ring-2 ring-secondary-fixed ring-offset-2 ring-offset-surface-container-low' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 border-2 border-on-background flex items-center justify-center flex-shrink-0 ${
                    f.highlight ? 'bg-secondary-fixed' : 'bg-primary-container'
                  }`}>
                    <span className={`material-symbols-outlined text-[18px] ${
                      f.highlight ? 'text-on-secondary-fixed' : 'text-on-primary-container'
                    }`}>{f.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-headline-lg text-[15px] text-on-surface leading-tight">{f.title}</h3>
                      {f.highlight && (
                        <span className="flex-shrink-0 font-technical-sm text-[9px] bg-secondary-fixed text-on-secondary-fixed px-1.5 py-0.5 uppercase tracking-widest">
                          New
                        </span>
                      )}
                    </div>
                    <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLOR SHOWCASE ───────────────────────────────────────────────── */}
      <section className="w-full border-t-2 border-on-background bg-background py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="font-technical-sm text-[11px] text-primary uppercase tracking-widest">Strip colors</span>
              <h2
                className="font-headline-xl text-on-surface lowercase tracking-tighter mt-1 mb-3"
                style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}
              >
                8 moods, your pick.
              </h2>
              <p className="font-body-md text-[14px] text-on-surface-variant mb-5 leading-relaxed">
                Classic White to Midnight black — choose the strip background that fits your vibe before you shoot.
              </p>
              <Button size="lg" onClick={() => navigate('/studio')} className="w-full sm:w-auto">
                <span className="material-symbols-outlined text-[18px]">palette</span>
                Pick a Color
              </Button>
            </div>

            {/* Color swatches grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {STRIP_COLORS.map(({ bg, label }) => (
                <button
                  key={label}
                  onClick={() => navigate('/studio')}
                  className="group flex flex-col gap-1.5"
                  title={label}
                >
                  <div
                    className="w-full border-2 border-on-background neo-pop-shadow group-hover:shadow-[6px_6px_0px_0px_#1b1c1c] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] transition-all duration-150"
                    style={{ backgroundColor: bg, paddingBottom: '140%' }}
                  />
                  <span className="font-technical-sm text-[10px] text-on-surface-variant uppercase tracking-wider text-center leading-tight">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LAYOUT SHOWCASE ──────────────────────────────────────────────── */}
      <section className="w-full border-t-2 border-on-background py-10 md:py-14 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="font-technical-sm text-[11px] text-primary uppercase tracking-widest">Print layouts</span>
              <h2
                className="font-headline-xl text-on-surface lowercase tracking-tighter mt-1 mb-3"
                style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}
              >
                the classic duo.
              </h2>
              <p className="font-body-md text-[14px] text-on-surface-variant mb-5 leading-relaxed">
                Every dual-strip print outputs two identical copies on one sheet — tear and share. Classic 3-pose or extended 4-pose. Or go solo for a single centered strip.
              </p>
              <Button size="lg" onClick={() => navigate('/studio')} className="w-full sm:w-auto">
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                Start Shooting
              </Button>
            </div>

            {/* Layout mockups — scrollable on tiny screens, flex on sm+ */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:justify-start md:justify-center">
              {[
                { poses: 3, label: 'Classic Duo',  sub: '3 poses',  solo: false },
                { poses: 4, label: 'Extended Duo', sub: '4 poses',  solo: false },
                { poses: 3, label: 'Solo Strip',   sub: 'centered', solo: true  },
              ].map(({ poses, label, sub, solo }) => (
                <button
                  key={label}
                  onClick={() => navigate('/studio')}
                  className="flex-shrink-0 border-2 border-on-background bg-surface p-1.5 neo-pop-shadow
                    hover:shadow-[5px_5px_0px_0px_#1b1c1c] hover:-translate-x-[1px] hover:-translate-y-[1px]
                    active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                    transition-all flex flex-col gap-1"
                >
                  {solo ? (
                    <div className="flex justify-center px-2">
                      <div className="flex flex-col gap-[3px]">
                        {Array(poses).fill(0).map((_, j) => (
                          <div key={j} className="w-10 sm:w-12 h-8 sm:h-9 bg-surface-container-highest border border-outline-variant" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-[3px]">
                      {[0, 1].map((col) => (
                        <div key={col} className="flex flex-col gap-[3px]">
                          {Array(poses).fill(0).map((_, j) => (
                            <div key={j} className="w-10 sm:w-11 h-8 sm:h-9 bg-surface-container-highest border border-outline-variant" />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-on-background/20 pt-1 text-center">
                    <p className="font-technical-sm text-[9px] text-on-surface uppercase tracking-widest leading-none">{label}</p>
                    <p className="font-technical-sm text-[8px] text-on-surface-variant uppercase mt-0.5">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MEME MODE ────────────────────────────────────────────────────── */}
      <section className="w-full border-t-2 border-on-background bg-on-background py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="flex flex-col gap-4">
              <span className="font-technical-sm text-[11px] text-secondary-fixed uppercase tracking-widest">New feature</span>
              <h2
                className="font-headline-xl text-surface lowercase tracking-tighter"
                style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}
              >
                meme mode.<br />
                <span className="text-primary-container">seriously.</span>
              </h2>
              <p className="font-body-md text-[14px] text-inverse-on-surface leading-relaxed">
                Pick frames from any pack — or mix across packs — build your lineup, and shoot side-by-side.
              </p>

              {/* Pack list 2-col */}
              <div className="grid grid-cols-2 gap-[3px]">
                {['Monkey Biz', '2 Monkeys', 'Spongebob', 'Shrek', 'Random Vibes', 'Your Own'].map((pack) => (
                  <div key={pack} className="flex items-center gap-2 border border-surface/20 px-3 py-2 bg-surface/5">
                    <span className="material-symbols-outlined text-[12px] text-secondary-fixed">check</span>
                    <span className="font-technical-sm text-[11px] text-inverse-on-surface/80 uppercase tracking-wide">
                      {pack}
                    </span>
                  </div>
                ))}
              </div>

              <Button size="lg" onClick={() => navigate('/studio')} className="w-full sm:w-auto mt-1">
                Try Meme Mode
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </Button>
            </div>

            {/* Meme output mockup */}
            <div className="border-2 border-surface/20 overflow-hidden neo-pop-shadow-lg">
              <div className="bg-surface/10 px-3 py-2 border-b border-surface/20 flex items-center justify-between">
                <span className="font-technical-sm text-[11px] text-inverse-on-surface/60 uppercase tracking-widest">
                  Output preview
                </span>
                <span className="font-technical-sm text-[9px] bg-primary-container text-on-primary-container px-2 py-0.5 uppercase">
                  1200 × auto
                </span>
              </div>
              {[1, 2, 3].map((n) => (
                <div key={n} className="grid grid-cols-2 border-b border-surface/20 last:border-b-0">
                  <div className="aspect-video bg-surface/10 border-r border-surface/20 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-inverse-on-surface/20 text-[20px]">image</span>
                      <span className="font-technical-sm text-[8px] text-inverse-on-surface/30 uppercase">ref {n}</span>
                    </div>
                  </div>
                  <div className="aspect-video bg-surface/5 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-inverse-on-surface/20 text-[20px]">photo_camera</span>
                      <span className="font-technical-sm text-[8px] text-inverse-on-surface/30 uppercase">shot {n}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-surface/10 px-3 py-2 flex items-center justify-between border-t border-surface/20">
                <span className="font-technical-sm text-[10px] text-inverse-on-surface/50 uppercase tracking-widest">Monkey Biz</span>
                <span className="font-technical-sm text-[11px] text-primary-container font-bold tracking-tighter">lumi.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="w-full border-t-2 border-on-background bg-background py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6 md:mb-8">
            <span className="font-technical-sm text-[11px] text-primary uppercase tracking-widest">From the community</span>
            <h2
              className="font-headline-xl text-on-surface lowercase tracking-tighter mt-1"
              style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}
            >
              people love it.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-surface border-2 border-on-background p-4 neo-pop-shadow flex flex-col gap-4">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array(5).fill(0).map((_, s) => (
                    <span key={s} className="material-symbols-outlined icon-fill text-[14px] text-primary-container">star</span>
                  ))}
                </div>
                <p className="font-body-md text-[14px] text-on-surface flex-1 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2 border-t-2 border-on-background pt-3">
                  <div className="w-8 h-8 bg-primary-container border-2 border-on-background flex items-center justify-center flex-shrink-0">
                    <span className="font-headline-lg text-[14px] text-on-primary-container font-bold">{t.initial}</span>
                  </div>
                  <div>
                    <p className="font-label-md text-[13px] text-on-surface font-semibold">{t.name}</p>
                    <p className="font-technical-sm text-[11px] text-on-surface-variant">{t.handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORK IQ ──────────────────────────────────────────────────────── */}
      <section className="w-full border-t-2 border-on-background bg-on-background py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 23 23" fill="none" aria-label="Microsoft">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                  <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                  <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                </svg>
                <span className="font-technical-sm text-[11px] text-secondary-fixed uppercase tracking-widest">
                  Microsoft Work IQ
                </span>
              </div>
              <h2
                className="font-headline-xl text-surface lowercase tracking-tighter"
                style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}
              >
                your studio.<br />
                <span className="text-secondary-fixed">context-aware.</span>
              </h2>
              <p className="font-body-md text-[14px] text-inverse-on-surface leading-relaxed">
                LUMI reads your Microsoft 365 calendar via the Graph API and shifts the studio theme to match your current work context — automatically.
              </p>

              <div className="flex flex-col gap-[3px]">
                {WORK_IQ_VIBES.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 border border-surface/15 bg-surface/5 min-w-0">
                    <span className="material-symbols-outlined text-[14px] flex-shrink-0" style={{ color: v.color }}>{v.icon}</span>
                    <span className="font-technical-sm text-[10px] text-inverse-on-surface/60 uppercase flex-shrink-0 w-[100px] truncate">
                      {v.label}
                    </span>
                    <span className="text-inverse-on-surface/30 flex-shrink-0 text-[10px]">→</span>
                    <span className="font-technical-sm text-[10px] uppercase truncate" style={{ color: v.color }}>
                      {v.result}
                    </span>
                  </div>
                ))}
              </div>

              <Button size="lg" onClick={() => navigate('/studio')} className="w-full sm:w-auto mt-1">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Try Work IQ Sync
              </Button>
            </div>

            {/* IQ Panel mockup */}
            <div className="bg-surface border-2 border-surface/20 neo-pop-shadow flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between border-b border-on-background/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary-fixed animate-pulse2 rounded-full" />
                  <span className="font-technical-sm text-[11px] text-on-surface-variant uppercase tracking-widest">Work IQ</span>
                  <span className="font-technical-sm text-[9px] bg-secondary-fixed text-on-secondary-fixed px-1.5 py-0.5 uppercase">Live</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">bolt</span>
              </div>
              {['Design Review — Q3 Creative Sprint', 'Brainstorm: Launch Campaign'].map((ev, i) => (
                <div key={i} className="flex items-start gap-2 px-2 py-1.5 bg-surface-container border border-outline-variant">
                  <span className="material-symbols-outlined text-[12px] text-primary mt-[2px] flex-shrink-0">event</span>
                  <p className="font-technical-sm text-[11px] text-on-surface">{ev}</p>
                </div>
              ))}
              <div className="border-2 border-on-background p-3 neo-pop-shadow" style={{ backgroundColor: '#fff0f6' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-[18px]" style={{ color: '#831843' }}>palette</span>
                  <span className="font-technical-sm text-[10px] border px-1.5 py-0.5 uppercase tracking-widest" style={{ borderColor: '#ec4899', color: '#831843' }}>
                    Creative Flow
                  </span>
                </div>
                <div className="flex gap-3">
                  <div>
                    <p className="font-technical-sm text-[10px] text-on-surface-variant uppercase">Theme</p>
                    <p className="font-label-md text-[13px] text-on-surface font-semibold">Blush</p>
                  </div>
                  <div>
                    <p className="font-technical-sm text-[10px] text-on-surface-variant uppercase">Filter</p>
                    <p className="font-label-md text-[13px] text-on-surface font-semibold">Vivid</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-outline-variant pt-2">
                <svg width="12" height="12" viewBox="0 0 23 23" fill="none" aria-label="Microsoft">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                  <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                  <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                </svg>
                <span className="font-technical-sm text-[10px] text-on-surface-variant uppercase tracking-widest">
                  Microsoft Work IQ · Graph API
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="w-full border-t-2 border-on-background bg-primary-container overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">

            {/* Text + buttons */}
            <div className="flex flex-col gap-4 md:max-w-[440px]">
              <h2
                className="font-headline-xl text-on-primary-container lowercase tracking-tighter"
                style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
              >
                ready to<br />capture?
              </h2>
              <p className="font-body-md text-[14px] text-on-primary-container/80 leading-relaxed">
                No setup. No downloads. Open and shoot.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  size="xl"
                  onClick={() => navigate('/studio')}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  <span className="material-symbols-outlined">photo_camera</span>
                  Open Studio
                </Button>
                <Button
                  variant="ghost"
                  size="xl"
                  onClick={() => navigate('/gallery')}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  View Gallery
                </Button>
              </div>
            </div>

            {/* Strip stack — float variant, sits naturally centered in flex row */}
            <div className="flex-shrink-0 self-center">
              <div className="md:hidden">
                <StripStack size="md" variant="float" />
              </div>
              <div className="hidden md:block">
                <StripStack size="lg" variant="float" />
              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
