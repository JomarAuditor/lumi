import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '../hooks/useCamera'
import { useSupabaseStorage } from '../hooks/useSupabaseStorage'
import { useAuth } from '../context/AuthContext'
import CameraCanvas from '../components/booth/CameraCanvas'
import FilterList from '../components/booth/FilterList'
import FrameSelector from '../components/booth/FrameSelector'
import ColorPicker from '../components/booth/ColorPicker'
import TemplateGrid, { resolveSelectedFrames } from '../components/booth/TemplateGrid'
import Button from '../components/common/Button'
import { LAYOUTS, compositeDualStrip, compositeMemePrint, COLOR_THEMES, FILTERS } from '../utils/imageProcessor'

const PANEL_TABS = ['Layout', 'Filter', 'Strip Color', 'Meme']

// ── Client-side rate limiter ──────────────────────────────────────────────────
// Prevents rapid-fire captures and upload abuse entirely in the browser.
// MAX_CAPTURES captures allowed per WINDOW_MS window.
const MAX_CAPTURES   = 20
const WINDOW_MS      = 60_000 // 1 minute
const captureLog     = [] // module-level timestamp log (survives re-renders)

function isRateLimited() {
  const now    = Date.now()
  const cutoff = now - WINDOW_MS
  // Remove entries older than the window
  while (captureLog.length && captureLog[0] < cutoff) captureLog.shift()
  if (captureLog.length >= MAX_CAPTURES) return true
  captureLog.push(now)
  return false
}

// Work IQ vibe detection rules — maps calendar subject keywords to studio themes
const WORK_IQ_VIBES = [
  {
    keywords: ['meeting', 'review', 'client', 'project', 'sprint', 'standup', '1:1'],
    color: 'black',
    filter: 'noir',
    label: 'FOCUS MODE',
    message: 'Work IQ detected a focused session. Studio shifted to Midnight Noir.',
    icon: 'work',
    accent: '#ff5c00',
  },
  {
    keywords: ['design', 'creative', 'launch', 'brainstorm', 'workshop', 'ideation'],
    color: 'blush',
    filter: 'vivid',
    label: 'CREATIVE FLOW',
    message: 'Creative energy detected. LUMI shifted to Blush Studio.',
    icon: 'palette',
    accent: '#E88FA0',
  },
  {
    keywords: ['study', 'exam', 'learn', 'training', 'course', 'class'],
    color: 'lavender',
    filter: 'fade',
    label: 'STUDY SESSION',
    message: 'Study session active. Calm Lavender mode engaged.',
    icon: 'school',
    accent: '#9B7FD4',
  },
  {
    keywords: ['lunch', 'break', 'coffee', 'social', 'party', 'happy hour'],
    color: 'cream',
    filter: 'goldenHour',
    label: 'SOCIAL VIBE',
    message: 'Relaxed vibes detected. Warm Cream mode activated.',
    icon: 'local_cafe',
    accent: '#8B6914',
  },
  {
    keywords: ['deploy', 'release', 'ship', 'production', 'go live'],
    color: 'sage',
    filter: 'vivid',
    label: 'SHIP IT MODE',
    message: 'Deployment energy! Forest Green — go go go.',
    icon: 'rocket_launch',
    accent: '#4CAF72',
  },
]

export default function Studio() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { videoRef, isReady, facingMode, error, countdown, isCapturing, startCamera, stopCamera, flipCamera, captureWithCountdown } = useCamera()
  const { uploading, progress, error: uploadError, uploadPrint } = useSupabaseStorage()

  const canvasRef = useRef(null)

  // Studio state
  const [activeTab,        setActiveTab]        = useState('Layout')
  const [selectedLayout,   setSelectedLayout]   = useState('dual-strip-3')
  const [selectedFilter,   setSelectedFilter]   = useState('none')
  const [selectedColor,    setSelectedColor]    = useState('white')
  const [useMeme,          setUseMeme]          = useState(false)
  const [selectedSlots,    setSelectedSlots]    = useState([])
  const [customMemeFrames, setCustomMemeFrames] = useState([])
  const [activeMemeFrame,  setActiveMemeFrame]  = useState(null)
  const [capturedPhotos,   setCapturedPhotos]   = useState([])
  const [isCompositing,    setIsCompositing]    = useState(false)
  const [finalPrint,       setFinalPrint]       = useState(null)
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [compositeError,   setCompositeError]   = useState(null)
  const [rateLimitMsg,     setRateLimitMsg]     = useState(null)
  const [isLoadingVibe,    setIsLoadingVibe]    = useState(false)
  const [workIqMessage,    setWorkIqMessage]    = useState('Tap to sync your Microsoft calendar mood with your studio theme.')
  const [workIqStatus,     setWorkIqStatus]     = useState('idle')
  const [workIqVibe,       setWorkIqVibe]       = useState(null)
  const [workIqEvents,     setWorkIqEvents]     = useState([])
  const [showIqPanel,      setShowIqPanel]      = useState(false)

  const layout = LAYOUTS[selectedLayout]
  const requiredPhotos = useMeme
    ? Math.max(selectedSlots.length, 1)
    : (layout?.photoCount || 3)
  const canCapture = capturedPhotos.length < requiredPhotos && !isCapturing && isReady

  // Start camera on mount — ref-stable start/stop avoids stale closure issues
  const startedRef = useRef(false)
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true
      startCamera()
    }
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCapture = useCallback(async () => {
    if (!canvasRef.current || !canCapture) return

    // Client-side rate limit — max 20 captures per minute
    if (isRateLimited()) {
      setRateLimitMsg('Slow down — too many captures. Wait a moment.')
      setTimeout(() => setRateLimitMsg(null), 3000)
      return
    }

    const dataUrl = await captureWithCountdown(canvasRef.current, 3, selectedFilter)
    if (dataUrl) {
      setCapturedPhotos((prev) => {
        const next = [...prev, dataUrl]
        if (useMeme) {
          setActiveMemeFrame(next.length < requiredPhotos ? next.length : null)
        }
        return next
      })
    }
  }, [canCapture, captureWithCountdown, selectedFilter, useMeme, requiredPhotos])

  const handleRemovePhoto = (index) => {
    setCapturedPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (useMeme) {
        setActiveMemeFrame(updated.length < requiredPhotos ? updated.length : null)
      }
      setFinalPrint(null)
      return updated
    })
  }

  const handleComposite = useCallback(async () => {
    if (capturedPhotos.length === 0) return
    setIsCompositing(true)
    setCompositeError(null)
    try {
      let result
      if (useMeme) {
        const memeFrames = resolveSelectedFrames(selectedSlots, customMemeFrames)
        const theme = COLOR_THEMES[selectedColor]
        const packNames =
          [...new Set(memeFrames.map((f) => f.packLabel).filter(Boolean))].join(' + ') ||
          'Meme Mix'
        result = await compositeMemePrint(
          capturedPhotos,
          memeFrames,
          selectedColor,
          theme,
          packNames
        )
      } else {
        result = await compositeDualStrip(
          capturedPhotos,
          selectedLayout,
          selectedColor,
          selectedFilter,
          {}
        )
      }
      setFinalPrint(result)
    } catch (err) {
      console.error('[lumi] Composite error:', err)
      setCompositeError('Something went wrong compositing your print. Try again.')
    }
    setIsCompositing(false)
  }, [capturedPhotos, selectedLayout, selectedColor, selectedFilter, useMeme, selectedSlots, customMemeFrames])

  const handleSaveAndDownload = useCallback(async () => {
    if (!finalPrint) return

    // Proper download — append/remove anchor so it works across all browsers
    const a = document.createElement('a')
    a.href = finalPrint
    a.download = `lumi-print-${Date.now()}.jpg`
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Upload to Supabase — show error if it fails
    if (user) {
      const result = await uploadPrint(finalPrint, user.id, {
        template: selectedLayout,
        layout:   selectedLayout,
        color:    selectedColor,
        filter:   selectedFilter,
      })
      if (!result) {
        // uploadError state in the hook will surface the message in the UI
        console.warn('[lumi] Upload failed — print was downloaded but not saved to gallery.')
      }
    }
  }, [finalPrint, user, uploadPrint, selectedLayout, selectedColor, selectedFilter])

  const handleReset = () => {
    setCapturedPhotos([])
    setFinalPrint(null)
    // If meme mode is active and lineup is ready, go back to frame 0
    setActiveMemeFrame(useMeme && selectedSlots.length > 0 ? 0 : null)
  }

  // Called by TemplateGrid's "Start Shooting" button
  const handleStartShooting = () => {
    setCapturedPhotos([])
    setFinalPrint(null)
    setActiveMemeFrame(0)
  }

  // Resolve a vibe from calendar subjects, returns a vibe rule or null
  const resolveVibe = (subjects) => {
    for (const vibe of WORK_IQ_VIBES) {
      if (vibe.keywords.some(kw => subjects.includes(kw))) return vibe
    }
    return null
  }

  // Apply a vibe rule to the studio
  const applyVibe = (vibe) => {
    if (vibe) {
      setSelectedColor(vibe.color)
      setSelectedFilter(vibe.filter)
      setWorkIqVibe(vibe)
      setWorkIqMessage(vibe.message)
    } else {
      setSelectedColor('cream')
      setSelectedFilter('none')
      setWorkIqVibe(null)
      setWorkIqMessage('Calendar is clear — Studio Cream mode, clean and ready.')
    }
    setFinalPrint(null)
  }

  const handleWorkIqVibeCheck = async () => {
    const token = import.meta.env.VITE_WORK_IQ_TOKEN
    setShowIqPanel(true)

    if (!token) {
      // Demo mode: simulate a Work IQ sync with a mock calendar for judges with no token
      setIsLoadingVibe(true)
      setWorkIqStatus('loading')
      setWorkIqMessage('Connecting to Microsoft Graph...')
      setWorkIqEvents([])

      await new Promise(r => setTimeout(r, 900))
      setWorkIqMessage('Reading calendar context...')
      await new Promise(r => setTimeout(r, 700))

      const demoEvents = [
        { subject: 'Design Review — Q3 Creative Sprint' },
        { subject: 'Brainstorm Session: Launch Campaign' },
      ]
      setWorkIqEvents(demoEvents)

      const subjects = demoEvents.map(e => e.subject.toLowerCase()).join(' ')
      const vibe = resolveVibe(subjects)
      applyVibe(vibe)

      setWorkIqStatus('demo')
      setIsLoadingVibe(false)
      return
    }

    setIsLoadingVibe(true)
    setWorkIqStatus('loading')
    setWorkIqMessage('Connecting to Microsoft Graph API...')
    setWorkIqEvents([])

    try {
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me/events?$top=5&$select=subject,start&$orderby=start/dateTime%20desc',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const events = Array.isArray(data.value) ? data.value : []
      setWorkIqEvents(events)

      const subjects = events.map(e => e.subject?.toLowerCase() || '').join(' ')

      const vibe = resolveVibe(subjects)
      applyVibe(vibe)
      setWorkIqStatus('success')
    } catch (err) {
      console.error('[lumi] Work IQ Fetch Error:', err)
      setWorkIqStatus('error')
      setWorkIqMessage(`Work IQ sync failed: ${err.message}. Check your token.`)
      setWorkIqVibe(null)
    } finally {
      setIsLoadingVibe(false)
    }
  }

  // Auto-composite when enough photos captured.
  // Use a ref to hold the latest handleComposite so the effect dep array stays stable.
  const handleCompositeRef = useRef(handleComposite)
  useEffect(() => { handleCompositeRef.current = handleComposite }, [handleComposite])

  useEffect(() => {
    if (capturedPhotos.length === requiredPhotos && !finalPrint) {
      handleCompositeRef.current()
    }
  }, [capturedPhotos.length, requiredPhotos, finalPrint])

  return (
    <div className="w-full min-h-[calc(100vh-72px)] bg-background">
      {/* ── Rate limit warning ── */}
      {rateLimitMsg && (
        <div className="bg-error text-on-error px-margin-mobile py-xs flex items-center gap-xs">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          <span className="font-technical-sm text-technical-sm">{rateLimitMsg}</span>
        </div>
      )}

      {/* ── Composite error banner ── */}
      {compositeError && (
        <div className="bg-error-container text-on-error-container px-margin-mobile py-xs flex items-center justify-between gap-xs border-b-2 border-error">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px] text-error">error</span>
            <span className="font-technical-sm text-technical-sm">{compositeError}</span>
          </div>
          <button onClick={() => setCompositeError(null)} className="material-symbols-outlined text-[16px]">close</button>
        </div>
      )}

      {/* ── Upload error banner ── */}
      {uploadError && (
        <div className="bg-error-container text-on-error-container px-margin-mobile py-xs flex items-center gap-xs border-b-2 border-error">
          <span className="material-symbols-outlined text-[16px] text-error">cloud_off</span>
          <span className="font-technical-sm text-technical-sm">{uploadError}</span>
        </div>
      )}

      {/* ── Mobile top bar ── */}
      <div className="md:hidden flex items-center justify-between px-margin-mobile py-xs border-b-2 border-on-background bg-surface">
        <span className="font-technical-sm text-technical-sm text-on-surface-variant uppercase">
          {capturedPhotos.length}/{requiredPhotos} captured
        </span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-xs border-2 border-on-background px-sm py-xs bg-surface hover:bg-surface-container-high transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span className="font-label-md text-label-md">Settings</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row h-full">

        {/* ── LEFT SIDEBAR (desktop) / Drawer (mobile) ── */}
        <aside className={`
          ${sidebarOpen ? 'flex' : 'hidden'} md:flex
          flex-col w-full md:w-[220px] lg:w-[260px] flex-shrink-0
          border-b-2 md:border-b-0 md:border-r-2 border-on-background
          bg-surface overflow-y-auto
          md:sticky md:top-[72px] md:h-[calc(100vh-72px)]
        `}>
          {/* Mobile drawer header with Done button */}
          <div className="md:hidden flex items-center justify-between px-sm py-xs border-b-2 border-on-background bg-surface-container">
            <span className="font-technical-sm text-technical-sm text-on-surface-variant uppercase tracking-widest">
              {activeTab}
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-xs border-2 border-on-background px-sm py-xs bg-primary-container text-on-primary-container font-label-md text-label-md"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Done
            </button>
          </div>
          {/* Tab switcher */}
          <div className="flex md:flex-col border-b-2 md:border-b-0 border-on-background overflow-x-auto md:overflow-x-visible">
            {PANEL_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-sm py-sm font-label-md text-label-md border-r-2 md:border-r-0 md:border-b-2 border-on-background transition-all ${
                  activeTab === tab
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="p-sm flex flex-col gap-md overflow-y-auto flex-1">
            {activeTab === 'Layout' && (
              <FrameSelector selected={selectedLayout} onChange={(k) => { setSelectedLayout(k); setFinalPrint(null) }} />
            )}
            {activeTab === 'Filter' && (
              <FilterList selected={selectedFilter} onChange={(k) => { setSelectedFilter(k); setFinalPrint(null) }} />
            )}
            {activeTab === 'Strip Color' && (
              <ColorPicker selected={selectedColor} onChange={(k) => { setSelectedColor(k); setFinalPrint(null) }} />
            )}
            {activeTab === 'Meme' && (
              <TemplateGrid
                useMeme={useMeme}
                onToggleMeme={() => {
                  const next = !useMeme
                  setUseMeme(next)
                  setCapturedPhotos([])
                  setFinalPrint(null)
                  setSelectedSlots([])
                  setActiveMemeFrame(null)
                }}
                selectedSlots={selectedSlots}
                onSlotsChange={(slots) => {
                  setSelectedSlots(slots)
                  // Reset shooting state when the lineup changes
                  setCapturedPhotos([])
                  setFinalPrint(null)
                  setActiveMemeFrame(null)
                }}
                customFrames={customMemeFrames}
                onCustomFramesChange={setCustomMemeFrames}
                activeMemeFrame={activeMemeFrame}
                onStartShooting={() => { handleStartShooting(); setSidebarOpen(false) }}
              />
            )}
          </div>
        </aside>

        {/* ── CENTER: Camera + Controls ── */}
        <div className="flex-1 flex flex-col items-center px-margin-mobile md:px-gutter py-md gap-md">
          {/* Meme Mode: reference image shown above camera while shooting */}
          {useMeme && activeMemeFrame !== null && (() => {
            const frames = resolveSelectedFrames(selectedSlots, customMemeFrames)
            const frame = frames[activeMemeFrame]
            if (!frame?.src) return null
            return (
              <div className="w-full max-w-[480px] border-2 border-on-background neo-pop-shadow overflow-hidden animate-fadeIn">
                {/* Header bar */}
                <div className="bg-on-background px-sm py-xs flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <div className="w-2 h-2 bg-secondary-fixed animate-pulse2 flex-shrink-0" />
                    <span className="font-technical-sm text-technical-sm text-surface uppercase tracking-widest">
                      Reference — Shot {activeMemeFrame + 1} of {frames.length}
                    </span>
                  </div>
                  <span className="font-technical-sm text-technical-sm text-surface/50 uppercase">
                    Match this pose
                  </span>
                </div>
                {/* Reference image */}
                <div className="aspect-video bg-on-background">
                  <img
                    src={frame.src}
                    alt={frame.pose}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentNode.style.backgroundColor = '#2a2a2a'
                    }}
                  />
                </div>
                {/* Pose hint */}
                <div className="bg-surface border-t-2 border-on-background px-sm py-xs">
                  <p className="font-label-md text-label-md text-on-surface">{frame.pose}</p>
                </div>
              </div>
            )
          })()}

          {/* Camera */}
          <div className="w-full max-w-[480px]">
            {error ? (
              <div className="w-full aspect-[3/4] md:aspect-[4/3] bg-error-container border-2 border-on-background flex flex-col items-center justify-center gap-md p-md">
                <span className="material-symbols-outlined text-[48px] text-error">videocam_off</span>
                <p className="font-body-md text-body-md text-on-surface text-center">{error}</p>
                <Button onClick={() => startCamera()} size="sm">Retry Camera</Button>
              </div>
            ) : (
              <CameraCanvas
                videoRef={videoRef}
                isReady={isReady}
                countdown={countdown}
                filter={selectedFilter}
                facingMode={facingMode}
              />
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera controls */}
          <div className="w-full max-w-[480px] flex items-center justify-between gap-sm">
            {/* Flip camera */}
            <Button
              variant="secondary"
              size="icon"
              onClick={flipCamera}
              disabled={!isReady}
              title="Flip camera"
            >
              <span className="material-symbols-outlined">flip_camera_ios</span>
            </Button>

            {/* Shutter */}
            <button
              onClick={handleCapture}
              disabled={!canCapture}
              className={`w-20 h-20 border-4 border-on-background flex items-center justify-center transition-all duration-150 ${
                canCapture
                  ? 'bg-primary-container neo-pop-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:shadow-[6px_6px_0px_0px_#1b1c1c]'
                  : 'bg-surface-container opacity-50 cursor-not-allowed'
              }`}
              aria-label="Capture photo"
            >
              <span className="material-symbols-outlined text-[32px] text-on-primary-container">
                {isCapturing ? 'timer' : 'photo_camera'}
              </span>
            </button>

            {/* Reset */}
            <Button
              variant="secondary"
              size="icon"
              onClick={handleReset}
              disabled={capturedPhotos.length === 0}
              title="Reset"
            >
              <span className="material-symbols-outlined">restart_alt</span>
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="w-full max-w-[480px] flex items-center gap-xs">
            {Array.from({ length: requiredPhotos }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 border-2 border-on-background transition-all ${
                  i < capturedPhotos.length ? 'bg-primary-container' : 'bg-surface-container'
                }`}
              />
            ))}
            <span className="font-technical-sm text-technical-sm text-on-surface-variant ml-xs whitespace-nowrap">
              {capturedPhotos.length}/{requiredPhotos}
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL: Captured photos + Preview ── */}
        <aside className="w-full md:w-[260px] lg:w-[300px] flex-shrink-0 border-t-2 md:border-t-0 md:border-l-2 border-on-background bg-surface flex flex-col">
          {/* Captured thumbnails */}
          <div className="p-sm border-b-2 border-on-background">
            <p className="font-technical-sm text-technical-sm text-on-surface-variant uppercase tracking-widest mb-xs">
              Captured ({capturedPhotos.length}/{requiredPhotos})
            </p>
            <div className="grid grid-cols-4 md:grid-cols-2 gap-xs">
              {Array.from({ length: requiredPhotos }).map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-square border-2 border-on-background bg-surface-container overflow-hidden"
                >
                  {capturedPhotos[i] ? (
                    <>
                      <img
                        src={capturedPhotos[i]}
                        alt={`Shot ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute top-0 right-0 bg-error text-on-error w-5 h-5 flex items-center justify-center border-l-2 border-b-2 border-on-background"
                      >
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-technical-sm text-technical-sm text-on-surface-variant">{i + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Final print preview */}
          <div className="flex-1 p-sm flex flex-col gap-sm overflow-y-auto">
            <p className="font-technical-sm text-technical-sm text-on-surface-variant uppercase tracking-widest">
              Preview
            </p>

            {isCompositing && (
              <div className="flex flex-col items-center justify-center gap-sm py-lg border-2 border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
                  autorenew
                </span>
                <span className="font-technical-sm text-technical-sm text-on-surface-variant uppercase">
                  Compositing...
                </span>
              </div>
            )}

            {finalPrint && !isCompositing && (
              <>
                <div className="border-2 border-on-background neo-pop-shadow overflow-hidden">
                  <img src={finalPrint} alt="Final print" className="w-full object-contain" />
                </div>

                <Button
                  size="md"
                  className="w-full"
                  onClick={handleSaveAndDownload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                      Saving... {progress}%
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Download Print
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={handleComposite}
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Re-composite
                </Button>

                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/gallery')}
                  >
                    View Gallery
                  </Button>
                )}
              </>
            )}

            {!finalPrint && !isCompositing && capturedPhotos.length > 0 && (
              <Button size="md" className="w-full" onClick={handleComposite}>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Generate Print
              </Button>
            )}

            {capturedPhotos.length === 0 && !isCompositing && (
              <div className="flex flex-col items-center justify-center gap-sm py-lg border-2 border-dashed border-outline-variant text-center">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
                  photo_library
                </span>
                <p className="font-technical-sm text-technical-sm text-on-surface-variant uppercase">
                  Capture {requiredPhotos} photos to generate your print
                </p>
              </div>
            )}

            {/* ── Work IQ Intelligence Panel ── */}
            <div className="mt-sm border-t-2 border-on-background pt-sm">
              {/* Header toggle */}
              <button
                onClick={() => setShowIqPanel(v => !v)}
                className="w-full flex items-center justify-between mb-xs group"
                aria-expanded={showIqPanel}
              >
                <div className="flex items-center gap-xs">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                    workIqStatus === 'success' || workIqStatus === 'demo' ? 'bg-secondary-fixed animate-pulse2' :
                    workIqStatus === 'error' ? 'bg-error' :
                    workIqStatus === 'loading' ? 'bg-primary-container animate-pulse2' :
                    'bg-outline'
                  }`} />
                  <span className="font-technical-sm text-technical-sm text-on-surface-variant uppercase tracking-widest">
                    Work IQ
                  </span>
                  {(workIqStatus === 'success' || workIqStatus === 'demo') && (
                    <span className="font-technical-sm text-[10px] bg-secondary-fixed text-on-secondary-fixed px-xs py-[1px] uppercase tracking-wide">
                      {workIqStatus === 'demo' ? 'DEMO' : 'LIVE'}
                    </span>
                  )}
                </div>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">
                  {showIqPanel ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Sync button always visible */}
              <Button
                size="sm"
                variant={workIqStatus === 'success' || workIqStatus === 'demo' ? 'accent' : 'primary'}
                className="w-full"
                onClick={handleWorkIqVibeCheck}
                disabled={isLoadingVibe}
              >
                {isLoadingVibe ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">autorenew</span>
                    Syncing...
                  </>
                ) : workIqStatus === 'success' || workIqStatus === 'demo' ? (
                  <>
                    <span className="material-symbols-outlined text-[14px]">sync</span>
                    Re-sync Work IQ
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    Sync Work IQ Mood
                  </>
                )}
              </Button>

              {/* Expandable detail panel */}
              {showIqPanel && (
                <div className="mt-xs flex flex-col gap-xs animate-fadeIn">

                  {/* Status message */}
                  <div className={`border-2 p-xs ${
                    workIqStatus === 'success' || workIqStatus === 'demo'
                      ? 'border-secondary-fixed bg-surface-container'
                      : workIqStatus === 'error'
                      ? 'border-error bg-surface-container'
                      : 'border-outline-variant bg-surface-container'
                  }`}>
                    <p className="font-technical-sm text-technical-sm text-on-surface leading-snug">
                      {workIqMessage}
                    </p>
                  </div>

                  {/* Active vibe card */}
                  {workIqVibe && (
                    <div
                      className="border-2 border-on-background p-sm neo-pop-shadow flex flex-col gap-xs"
                      style={{
                        backgroundColor: COLOR_THEMES[workIqVibe.color]?.bg,
                        color: COLOR_THEMES[workIqVibe.color]?.text,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[20px]">{workIqVibe.icon}</span>
                        <span
                          className="font-technical-sm text-[10px] border px-xs py-[1px] uppercase tracking-widest"
                          style={{
                            borderColor: COLOR_THEMES[workIqVibe.color]?.border,
                            color: COLOR_THEMES[workIqVibe.color]?.text,
                          }}
                        >
                          {workIqVibe.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <div className="flex-1">
                          <p className="font-technical-sm text-[10px] uppercase tracking-wide opacity-70">Theme</p>
                          <p className="font-label-md text-label-md">{COLOR_THEMES[workIqVibe.color]?.label}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-technical-sm text-[10px] uppercase tracking-wide opacity-70">Filter</p>
                          <p className="font-label-md text-label-md">{FILTERS[workIqVibe.filter]?.label}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Calendar events fetched */}
                  {workIqEvents.length > 0 && (
                    <div className="flex flex-col gap-[2px]">
                      <p className="font-technical-sm text-[10px] text-on-surface-variant uppercase tracking-widest">
                        {workIqStatus === 'demo' ? 'Demo Context' : 'Calendar Context'}
                      </p>
                      {workIqEvents.slice(0, 3).map((ev, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-xs px-xs py-[4px] bg-surface-container border border-outline-variant"
                        >
                          <span className="material-symbols-outlined text-[12px] text-primary mt-[2px] flex-shrink-0">
                            event
                          </span>
                          <p className="font-technical-sm text-[11px] text-on-surface leading-snug line-clamp-2">
                            {ev.subject}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Microsoft attribution badge */}
                  <div className="flex items-center gap-xs border-t border-outline-variant pt-xs">
                    <svg width="14" height="14" viewBox="0 0 23 23" fill="none" aria-label="Microsoft logo">
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
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
