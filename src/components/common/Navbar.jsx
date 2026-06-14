import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/studio',  label: 'Studio'  },
  { to: '/gallery', label: 'Gallery' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const { user, signOut }         = useAuth()
  const location                  = useLocation()
  const navigate                  = useNavigate()

  const isActive = (path) => location.pathname === path

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Subtle scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll while drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className={`h-[64px] w-full top-0 sticky z-50 bg-surface border-b-2 border-on-background
          flex items-center justify-between
          px-margin-mobile md:px-margin-desktop
          transition-shadow duration-200
          ${scrolled ? 'shadow-[0_4px_0px_0px_rgba(27,28,28,0.08)]' : ''}
        `}
      >
        {/* ── Brand ── */}
        <Link
          to="/"
          className="font-headline-xl text-[22px] md:text-[26px] leading-none tracking-tighter text-on-surface hover:text-primary transition-colors lowercase select-none"
          aria-label="lumi. home"
        >
          lumi.
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-xs" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-label-md text-label-md px-sm py-[6px] border-2 transition-all duration-150 ${
                isActive(link.to)
                  ? 'bg-primary-container text-on-primary-container border-on-background neo-pop-shadow'
                  : 'text-on-surface-variant border-transparent hover:border-on-background hover:bg-surface-container-high'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop actions ── */}
        <div className="hidden md:flex items-center gap-sm">
          <button
            onClick={() => navigate('/studio')}
            className="bg-primary-container text-on-primary-container border-2 border-on-background
              px-md py-[6px] font-label-md text-label-md
              neo-pop-shadow hover:shadow-[6px_6px_0px_0px_#1b1c1c] hover:-translate-x-[1px] hover:-translate-y-[1px]
              active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
              transition-all duration-150"
          >
            Start Capturing
          </button>

          {user ? (
            <div className="flex items-center gap-xs">
              <span className="font-technical-sm text-technical-sm text-on-surface-variant truncate max-w-[100px] hidden lg:block">
                {user.email?.split('@')[0]}
              </span>
              <button
                onClick={signOut}
                className="w-9 h-9 flex items-center justify-center border-2 border-transparent hover:border-on-background hover:bg-surface-container-high transition-all"
                title="Sign out"
                aria-label="Sign out"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="w-9 h-9 flex items-center justify-center border-2 border-transparent hover:border-on-background hover:bg-surface-container-high transition-all"
              title="Sign in"
              aria-label="Sign in"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">account_circle</span>
            </button>
          )}
        </div>

        {/* ── Mobile: auth icon + hamburger ── */}
        <div className="md:hidden flex items-center gap-xs">
          {user ? (
            <button
              onClick={signOut}
              className="w-9 h-9 flex items-center justify-center border-2 border-transparent hover:border-on-background hover:bg-surface-container-high transition-all"
              aria-label="Sign out"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">logout</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="w-9 h-9 flex items-center justify-center border-2 border-transparent hover:border-on-background hover:bg-surface-container-high transition-all"
              aria-label="Sign in"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">account_circle</span>
            </button>
          )}

          <button
            className="w-9 h-9 flex items-center justify-center border-2 border-transparent hover:border-on-background hover:bg-surface-container-high transition-all"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined text-on-surface text-[20px]">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* ── Mobile drawer backdrop ── */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-on-background/50 backdrop-blur-[2px]"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={`md:hidden fixed top-[64px] left-0 right-0 z-50 bg-surface border-b-2 border-on-background
          flex flex-col
          transition-all duration-200 ease-out
          ${menuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-2 opacity-0 pointer-events-none'}
        `}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <nav className="flex flex-col px-margin-mobile py-sm gap-[3px]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-sm px-sm py-sm border-2 font-label-md text-label-md transition-all ${
                isActive(link.to)
                  ? 'bg-primary-container text-on-primary-container border-on-background neo-pop-shadow'
                  : 'text-on-surface border-transparent hover:border-on-background hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {link.to === '/studio' ? 'photo_camera' : 'photo_library'}
              </span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-margin-mobile pb-md pt-xs border-t-2 border-on-background">
          <button
            onClick={() => { navigate('/studio'); setMenuOpen(false) }}
            className="w-full bg-primary-container text-on-primary-container border-2 border-on-background
              py-sm font-label-md text-label-md
              neo-pop-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
              transition-all flex items-center justify-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            Start Capturing
          </button>
        </div>
      </div>
    </>
  )
}
