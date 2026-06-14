import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSupabaseStorage } from '../hooks/useSupabaseStorage'
import PrintCard from '../components/gallery/PrintCard'
import Button from '../components/common/Button'

const SORT_OPTIONS  = ['Newest', 'Oldest']
const FILTER_OPTIONS = [
  { key: 'All',   label: 'All'   },
  { key: 'Strip', label: 'Strip' },
  { key: 'Grid',  label: 'Grid'  },
  { key: 'Meme',  label: 'Meme'  },
]

export default function Gallery() {
  const navigate                     = useNavigate()
  const { user }                     = useAuth()
  const { fetchUserPrints, deletePrint } = useSupabaseStorage()

  const [prints,      setPrints]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [fetchError,  setFetchError]  = useState(null)
  const [sort,        setSort]        = useState('Newest')
  const [filterType,  setFilterType]  = useState('All')
  const [viewMode,    setViewMode]    = useState('masonry')
  const [deleteId,    setDeleteId]    = useState(null) // track which is being deleted

  const loadPrints = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    if (user) {
      const { data, error } = await fetchUserPrints(user.id)
      if (error) setFetchError(error)
      setPrints(data)
    } else {
      setPrints([])
    }
    setLoading(false)
  }, [user, fetchUserPrints])

  useEffect(() => { loadPrints() }, [loadPrints])

  const handleDownload = (print) => {
    const url = print.public_url || print.dataUrl
    // Validate URL is HTTPS before triggering download
    if (!url || !url.startsWith('https://')) return
    const a = document.createElement('a')
    a.href = url
    a.download = `lumi-print-${print.id}.jpg`
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDelete = async (print) => {
    if (!window.confirm('Delete this print? This cannot be undone.')) return
    setDeleteId(print.id)
    const { success, error } = await deletePrint(print.id, print.storage_path)
    if (success) {
      setPrints((prev) => prev.filter((p) => p.id !== print.id))
    } else {
      alert(`Could not delete print: ${error}`)
    }
    setDeleteId(null)
  }

  const displayed = prints
    .filter((p) => {
      if (filterType === 'Strip') return p.template?.includes('strip')
      if (filterType === 'Grid')  return p.template?.includes('grid')
      if (filterType === 'Meme')  return p.template?.includes('meme')
      return true
    })
    .sort((a, b) => {
      const da = new Date(a.created_at), db = new Date(b.created_at)
      return sort === 'Newest' ? db - da : da - db
    })

  // ── Signed-out state ────────────────────────────────────────────────────
  if (!user && !loading) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] bg-background flex items-center justify-center px-margin-mobile">
        <div className="w-full max-w-[400px] flex flex-col items-center gap-lg text-center">
          <div className="w-16 h-16 border-2 border-on-background bg-surface-container flex items-center justify-center neo-pop-shadow">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant">lock</span>
          </div>
          <div>
            <h1 className="font-headline-xl text-headline-lg text-on-surface lowercase tracking-tighter">
              your gallery
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              Sign in to save prints to the cloud and access them from any device.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-sm w-full">
            <Button size="lg" className="flex-1" onClick={() => navigate('/auth')}>
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              Sign In
            </Button>
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => navigate('/studio')}>
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              Try Studio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-background">
      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg md:py-xl">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-lg">
          <div>
            {user && (
              <span className="font-technical-sm text-technical-sm text-primary uppercase tracking-widest">
                {user.email?.split('@')[0]}
              </span>
            )}
            <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-on-background lowercase tracking-tighter mt-[2px]">
              my prints
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              {loading
                ? 'Loading...'
                : `${prints.length} print${prints.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          <Button onClick={() => navigate('/studio')} size="md" className="flex-shrink-0 w-full sm:w-auto">
            <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
            New Print
          </Button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-xs mb-lg border-b-2 border-on-background pb-md">
          {/* Filter pills */}
          <div className="flex gap-[3px] flex-wrap">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-sm py-[6px] border-2 font-label-md text-label-md transition-all duration-150 ${
                  filterType === f.key
                    ? 'bg-primary-container text-on-primary-container border-on-background neo-pop-shadow'
                    : 'bg-surface text-on-surface-variant border-on-background hover:bg-surface-container-high'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex gap-xs ml-auto items-center">
            {/* Sort select */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none border-2 border-on-background bg-surface text-on-surface
                  font-label-md text-label-md pl-sm pr-lg py-[6px]
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
                  cursor-pointer"
                aria-label="Sort prints"
              >
                {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-xs top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* View toggle */}
            <button
              onClick={() => setViewMode((v) => (v === 'masonry' ? 'grid' : 'masonry'))}
              className="w-9 h-9 border-2 border-on-background bg-surface flex items-center justify-center hover:bg-surface-container-high transition-all"
              title={viewMode === 'masonry' ? 'Switch to grid' : 'Switch to masonry'}
              aria-label="Toggle view mode"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface">
                {viewMode === 'masonry' ? 'grid_view' : 'view_agenda'}
              </span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadPrints}
              className="w-9 h-9 border-2 border-on-background bg-surface flex items-center justify-center hover:bg-surface-container-high transition-all"
              title="Refresh gallery"
              aria-label="Refresh"
            >
              <span className={`material-symbols-outlined text-[18px] text-on-surface ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          </div>
        </div>

        {/* ── Fetch error ── */}
        {fetchError && !loading && (
          <div className="flex items-center gap-sm border-2 border-error bg-error-container p-sm mb-md">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            <p className="font-technical-sm text-technical-sm text-on-error-container flex-1">
              Could not load prints: {fetchError}
            </p>
            <button onClick={loadPrints} className="font-label-md text-label-md text-primary underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
            {Array(8).fill(0).map((_, i) => (
              <div
                key={i}
                className="border-2 border-on-background bg-surface-container animate-pulse2"
                style={{ aspectRatio: i % 3 === 0 ? '1/3' : i % 2 === 0 ? '1/1.5' : '1/1' }}
              />
            ))}
          </div>
        )}

        {/* ── Empty state — signed in, no prints ── */}
        {!loading && user && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xl gap-lg border-2 border-dashed border-outline-variant text-center px-margin-mobile">
            <div className="w-16 h-16 border-2 border-outline-variant bg-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">photo_library</span>
            </div>
            <div>
              <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface lowercase tracking-tighter">
                {filterType !== 'All' ? `no ${filterType.toLowerCase()} prints yet` : 'no prints yet'}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                {filterType !== 'All'
                  ? 'Try a different filter above.'
                  : 'Head to the studio and capture your first print.'}
              </p>
            </div>
            {filterType === 'All' && (
              <Button onClick={() => navigate('/studio')} size="lg">
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                Open Studio
              </Button>
            )}
            {filterType !== 'All' && (
              <Button variant="secondary" size="md" onClick={() => setFilterType('All')}>
                Show All
              </Button>
            )}
          </div>
        )}

        {/* ── Print grid ── */}
        {!loading && user && displayed.length > 0 && (
          viewMode === 'masonry' ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-[12px] pb-xl">
              {displayed.map((print) => (
                <PrintCard
                  key={print.id}
                  print={print}
                  deleting={deleteId === print.id}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px] pb-xl">
              {displayed.map((print) => (
                <PrintCard
                  key={print.id}
                  print={print}
                  deleting={deleteId === print.id}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        )}

        {/* ── Print count footer ── */}
        {!loading && displayed.length > 0 && (
          <p className="font-technical-sm text-technical-sm text-on-surface-variant text-center mt-md uppercase tracking-widest">
            {displayed.length} print{displayed.length !== 1 ? 's' : ''} shown
          </p>
        )}
      </div>
    </div>
  )
}
