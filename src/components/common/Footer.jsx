import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { label: 'Studio',  to: '/studio'  },
  { label: 'Gallery', to: '/gallery' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-on-background border-t-2 border-on-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-lg
        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-lg">

        {/* Brand */}
        <div className="flex flex-col gap-xs">
          <Link to="/"
            className="font-headline-xl text-[26px] sm:text-[28px] leading-none tracking-tighter text-surface lowercase hover:text-primary-container transition-colors">
            lumi.
          </Link>
          <p className="font-technical-sm text-technical-sm text-inverse-on-surface/50 uppercase tracking-widest">
            Browser-native photobooth
          </p>
        </div>

        {/* Links — larger tap targets on mobile */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-md sm:gap-y-xs" aria-label="Footer navigation">
          {FOOTER_LINKS.map((item) => (
            <Link key={item.label} to={item.to}
              className="font-body-md text-body-md text-inverse-on-surface/60 hover:text-surface transition-colors min-h-[44px] flex items-center">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Microsoft badge */}
        <div className="flex items-center gap-xs opacity-50">
          <svg width="14" height="14" viewBox="0 0 23 23" fill="none" aria-label="Microsoft">
            <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
            <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
            <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
            <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
          </svg>
          <span className="font-technical-sm text-technical-sm text-inverse-on-surface/50 uppercase tracking-widest">
            Work IQ
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-surface/10 px-4 sm:px-6 md:px-8 py-3 sm:py-sm">
        <p className="font-technical-sm text-technical-sm text-inverse-on-surface/30 text-center uppercase tracking-widest text-[11px]">
          © {year} lumi. studio — all rights reserved
        </p>
      </div>
    </footer>
  )
}
