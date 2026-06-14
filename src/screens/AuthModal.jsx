import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'

export default function AuthModal() {
  const { user, signInWithGoogle, loading, authError, isAuthAvailable } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) navigate('/studio')
  }, [user, loading, navigate])

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-background px-margin-mobile py-xl relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-[0.04] pointer-events-none" />
      <div className="absolute left-[10%] top-0 bottom-0 w-[2px] bg-primary-container/20" />
      <div className="absolute right-[10%] top-0 bottom-0 w-[2px] bg-primary-container/20" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-surface border-2 border-on-background neo-pop-shadow-lg p-lg md:p-xl flex flex-col gap-lg animate-fadeIn">

          {/* Brand header */}
          <div className="text-center border-b-2 border-on-background pb-lg">
            <h1 className="font-headline-xl text-headline-lg text-on-surface lowercase tracking-tighter">
              welcome to <span className="text-primary">lumi</span>.
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
              Sign in to save your prints to the cloud and access them from anywhere.
            </p>
          </div>

          {/* Auth error */}
          {authError && (
            <div className="flex items-center gap-xs border-2 border-error bg-error-container p-sm">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="font-technical-sm text-technical-sm text-on-error-container flex-1">{authError}</p>
            </div>
          )}

          {/* Not configured notice */}
          {!isAuthAvailable && (
            <div className="flex items-start gap-xs border-2 border-outline-variant bg-surface-container p-sm">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] flex-shrink-0 mt-[2px]">info</span>
              <p className="font-technical-sm text-[12px] text-on-surface-variant leading-relaxed">
                Cloud sign-in is not set up yet. You can still use the full studio — photos download directly to your device.
              </p>
            </div>
          )}

          {/* Google Sign In — only when Supabase is configured */}
          {isAuthAvailable && (
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-md border-2 border-on-background bg-surface py-md px-lg
                neo-pop-shadow hover:shadow-[6px_6px_0px_0px_#1b1c1c] hover:-translate-x-[1px] hover:-translate-y-[1px]
                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-label-md text-label-md text-on-surface text-lg">
                {loading ? 'Connecting...' : 'Continue with Google'}
              </span>
            </button>
          )}

          {isAuthAvailable && (
            <div className="flex items-center gap-sm">
              <div className="flex-1 border-t-2 border-on-background" />
              <span className="font-technical-sm text-technical-sm text-on-surface-variant uppercase px-sm">or</span>
              <div className="flex-1 border-t-2 border-on-background" />
            </div>
          )}

          {/* Studio / Guest button */}
          <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/studio')}>
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            {isAuthAvailable ? 'Continue as Guest' : 'Go to Studio'}
          </Button>

          <p className="font-technical-sm text-technical-sm text-on-surface-variant text-center leading-relaxed">
            {isAuthAvailable
              ? 'Guest sessions save prints locally. Sign in to access your gallery from any device.'
              : 'Photos download directly to your device. No account needed.'}
          </p>
        </div>

        {/* Back link */}
        <div className="mt-lg text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
