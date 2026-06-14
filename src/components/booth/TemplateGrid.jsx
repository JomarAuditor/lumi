import { useRef, useState } from 'react'

/**
 * TemplateGrid — Meme Mode Panel (Mix & Match Edition)
 *
 * User builds a custom lineup by picking ANY frame from ANY pack — any order.
 * Packs support 1–6 frames. The compositor adapts to however many slots are filled.
 *
 * All images served from /public/memes/ — no external dependencies.
 */

// ─── Data ────────────────────────────────────────────────────────────────────

export const MEME_PACKS = [
  // ── Monkey Biz — 4 frames ──────────────────────────────────────────────
  {
    id: 'monkey',
    label: 'Monkey Biz',
    description: '4 iconic Gibraltar monkey reaction shots.',
    maxSlots: 4,
    frames: [
      { id: 'monkey-1', src: '/memes/monkey/monkey 1.jpg' },
      { id: 'monkey-2', src: '/memes/monkey/monkey 2.jpg' },
      { id: 'monkey-3', src: '/memes/monkey/monkey 3.jpg' },
      { id: 'monkey-4', src: '/memes/monkey/monkey 4.jpg' },
    ],
  },
  // ── 2 Monkeys — 3 frames (monkey 5 + 2monkey 1 + 2monkey 2) ──────────
  {
    id: '2monkey',
    label: '2 Monkeys',
    description: 'The duo monkey reaction — 3 frames of pure chaos.',
    maxSlots: 3,
    frames: [
      { id: '2monkey-0', src: '/memes/monkey/monkey 5.jpg'  },
      { id: '2monkey-1', src: '/memes/monkey/2monkey 1.jpg' },
      { id: '2monkey-2', src: '/memes/monkey/2monkey 2.jpg' },
    ],
  },
  // ── Spongebob & Patrick — 4 frames ────────────────────────────────────
  {
    id: 'spongebob',
    label: 'Spongebob & Patrick',
    description: 'Recreate iconic Spongebob moments with your bestie.',
    maxSlots: 4,
    frames: [
      { id: 'sb-1', src: '/memes/spongebob/spongebob 1.jpg' },
      { id: 'sb-2', src: '/memes/spongebob/spongebob 2.jpg' },
      { id: 'sb-3', src: '/memes/spongebob/spongebob 3.jpg' },
      { id: 'sb-4', src: '/memes/spongebob/spongebob 4.jpg' },
    ],
  },
  // ── Shrek — 1 frame spotlight ─────────────────────────────────────────
  {
    id: 'shrek',
    label: 'Shrek',
    description: "It's all ogre now. 1 legendary frame.",
    maxSlots: 1,
    frames: [
      { id: 'shrek-1', src: '/memes/shrek/shrek.jpg' },
    ],
  },
  // ── Random Vibes — 3 frames ───────────────────────────────────────────
  {
    id: 'random',
    label: 'Random Vibes',
    description: 'Chill dog, super wow — 3 random internet legends.',
    maxSlots: 3,
    frames: [
      { id: 'rv-1', src: '/memes/random memes/chill .jpg'    },
      { id: 'rv-2', src: '/memes/random memes/dog 1.jpg'     },
      { id: 'rv-3', src: '/memes/random memes/superwow .jpg' },
    ],
  },
]

// Flat lookup: frame id → frame object (with packLabel attached)
export const ALL_MEME_FRAMES = MEME_PACKS.flatMap((pack) =>
  pack.frames.map((f) => ({ ...f, packId: pack.id, packLabel: pack.label }))
)

// Max number of slots user can pick (capped at 6 for a reasonable composite height)
const HARD_MAX = 6

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolve an array of slot IDs (+ customFrames for 'custom-N' ids) into
 * frame objects with { src, pose, packLabel }.
 * Used in Studio.jsx before calling compositeMemePrint.
 */
export function resolveSelectedFrames(selectedSlots, customFrames) {
  return (selectedSlots || []).map((id) => {
    if (!id) return { src: null, pose: '' }
    if (id.startsWith('custom-')) {
      const idx = parseInt(id.replace('custom-', ''), 10)
      return customFrames?.[idx] || { src: null, pose: '' }
    }
    return ALL_MEME_FRAMES.find((f) => f.id === id) || { src: null, pose: '' }
  })
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TemplateGrid({
  useMeme,
  onToggleMeme,
  selectedSlots,        // string[] — ordered array of chosen frame IDs
  onSlotsChange,        // (string[]) => void
  customFrames,         // { src, pose }[] — user-uploaded reference images
  onCustomFramesChange, // (frames) => void
  activeMemeFrame,      // number | null — which slot is being shot right now
  onStartShooting,      // () => void — called when lineup is ready and user hits Start
}) {
  const fileInputRef = useRef(null)
  const [expandedPack, setExpandedPack] = useState('monkey') // which accordion is open

  const slots = selectedSlots || []
  const isFull = slots.length >= HARD_MAX
  const isShooting = activeMemeFrame !== null

  // ── Slot helpers ──────────────────────────────────────────────────────────

  const findFrame = (id) => {
    if (!id) return null
    if (id.startsWith('custom-')) {
      const idx = parseInt(id.replace('custom-', ''), 10)
      return customFrames?.[idx]
        ? { ...customFrames[idx], id, packLabel: 'Custom' }
        : null
    }
    return ALL_MEME_FRAMES.find((f) => f.id === id) || null
  }

  const addSlot = (frameId) => {
    if (isFull) return
    onSlotsChange([...slots, frameId])
  }

  const removeSlot = (slotIndex) => {
    const next = [...slots]
    next.splice(slotIndex, 1)
    onSlotsChange(next)
  }

  const clearAll = () => onSlotsChange([])

  // ── Custom upload ─────────────────────────────────────────────────────────

  const handleCustomUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, HARD_MAX)
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (ev) =>
            resolve({ src: ev.target.result, pose: 'Match this pose' })
          reader.readAsDataURL(file)
        })
    )
    Promise.all(readers).then((frames) => {
      onCustomFramesChange(frames)
      onSlotsChange(frames.map((_, i) => `custom-${i}`))
    })
  }

  // ── Active frame info (for pose guide during shooting) ────────────────────
  const activeFrame =
    isShooting && activeMemeFrame < slots.length
      ? findFrame(slots[activeMemeFrame])
      : null

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-sm">

      {/* ── Toggle row ── */}
      <div className="flex items-center justify-between px-sm py-sm border-2 border-on-background neo-pop-shadow bg-surface">
        <div>
          <p className="font-label-md text-label-md text-on-background">Meme Mode</p>
          <p className="font-technical-sm text-technical-sm text-on-surface-variant mt-[2px]">
            Left: meme ref — Right: your take
          </p>
        </div>
        <button
          onClick={onToggleMeme}
          className={`relative w-12 h-6 border-2 border-on-background transition-colors duration-200 flex-shrink-0 ${
            useMeme ? 'bg-primary-container' : 'bg-surface-container'
          }`}
          aria-label="Toggle meme mode"
        >
          <span
            className={`absolute top-[2px] w-4 h-4 bg-on-background transition-transform duration-200 ${
              useMeme ? 'translate-x-[22px]' : 'translate-x-[2px]'
            }`}
          />
        </button>
      </div>

      {/* ── Main panel — only when meme mode on ── */}
      {useMeme && (
        <div className="flex flex-col gap-sm">

          {/* ── 4-slot lineup ── */}
          <div>
            <div className="flex items-center justify-between mb-xs px-[2px]">
              <p className="font-technical-sm text-technical-sm text-on-surface-variant uppercase tracking-widest">
                Your lineup — {slots.length} frame{slots.length !== 1 ? 's' : ''} selected
              </p>
              {slots.length > 0 && !isShooting && (
                <button
                  onClick={clearAll}
                  className="font-technical-sm text-technical-sm text-on-surface-variant hover:text-primary underline underline-offset-2 transition-colors"
                >
                  clear all
                </button>
              )}
            </div>

            {/* Slot boxes — dynamic count up to HARD_MAX */}
            <div className="grid grid-cols-4 gap-[3px]">
              {Array.from({ length: Math.max(slots.length + (isFull ? 0 : 1), 1) }).slice(0, HARD_MAX).map((_, slotIdx) => {
                const frameId = slots[slotIdx]
                const frame = findFrame(frameId)
                const isActivelyShooting = activeMemeFrame === slotIdx
                const isAlreadyShot = isShooting && slotIdx < activeMemeFrame

                return (
                  <div
                    key={slotIdx}
                    className={`aspect-square border-2 relative overflow-hidden ${
                      isActivelyShooting
                        ? 'border-secondary-fixed'
                        : isAlreadyShot
                        ? 'border-on-background/20'
                        : frame
                        ? 'border-on-background'
                        : 'border-outline-variant border-dashed'
                    }`}
                  >
                    {frame ? (
                      <>
                        <img
                          src={frame.src}
                          alt={frame.pose}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />

                        {/* Done overlay — green check */}
                        {isAlreadyShot && (
                          <div className="absolute inset-0 bg-on-background/50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary-fixed text-[22px]">
                              check_circle
                            </span>
                          </div>
                        )}

                        {/* Active shooting pulse */}
                        {isActivelyShooting && (
                          <div className="absolute inset-0 bg-secondary-fixed/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary-fixed text-[20px] animate-pulse2">
                              photo_camera
                            </span>
                          </div>
                        )}

                        {/* Slot number — top left */}
                        <span className="absolute top-0 left-0 font-technical-sm text-[9px] bg-on-background text-surface px-[4px] py-[2px] leading-none">
                          {slotIdx + 1}
                        </span>

                        {/* Remove button — top right, hidden during shooting */}
                        {!isShooting && (
                          <button
                            onClick={() => removeSlot(slotIdx)}
                            className="absolute top-0 right-0 w-[18px] h-[18px] bg-on-background flex items-center justify-center hover:bg-error transition-colors"
                            aria-label={`Remove slot ${slotIdx + 1}`}
                          >
                            <span className="material-symbols-outlined text-surface text-[11px]">
                              close
                            </span>
                          </button>
                        )}
                      </>
                    ) : (
                      /* Empty slot */
                      <div className="w-full h-full flex flex-col items-center justify-center gap-[2px]">
                        <span className="font-technical-sm text-technical-sm text-on-surface-variant/40">
                          {slotIdx + 1}
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant/20 text-[14px]">
                          add
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pose guide — shows while actively shooting */}
            {activeFrame && (
              <div className="mt-xs border-2 border-secondary-fixed p-xs animate-fadeIn">
                <div className="flex items-center gap-xs mb-[4px]">
                  <div className="w-[6px] h-[6px] bg-secondary-fixed animate-pulse2 flex-shrink-0" />
                  <p className="font-technical-sm text-technical-sm text-secondary-fixed uppercase tracking-widest">
                    Shot {activeMemeFrame + 1} of {slots.length} — match this pose
                  </p>
                </div>
              </div>
            )}

            {/* Start Shooting CTA — at least 1 slot filled, not yet shooting */}
            {slots.length > 0 && !isShooting && (
              <button
                onClick={onStartShooting}
                className="mt-xs w-full border-2 border-on-background bg-primary-container text-on-primary-container font-label-md text-label-md py-sm neo-pop-shadow hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_#1b1c1c] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
              >
                <span className="flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  Start Shooting — {slots.length} shot{slots.length !== 1 ? 's' : ''}
                </span>
              </button>
            )}

            {/* Helper text — empty state */}
            {slots.length === 0 && !isShooting && (
              <p className="font-technical-sm text-technical-sm text-on-surface-variant text-center mt-xs">
                Tap any frame below to build your lineup
              </p>
            )}

            {/* Helper text — at limit */}
            {isFull && !isShooting && (
              <p className="font-technical-sm text-technical-sm text-on-surface-variant text-center mt-[2px]">
                Max {HARD_MAX} frames — remove one to swap
              </p>
            )}
          </div>

          {/* ── Frame browser — hidden during shooting ── */}
          {!isShooting && (
            <div className="flex flex-col gap-xs">
              <p className="font-technical-sm text-technical-sm text-on-surface-variant uppercase tracking-widest px-[2px]">
                Browse frames
              </p>

              {/* Pack accordions */}
              {MEME_PACKS.map((pack) => {
                const isOpen = expandedPack === pack.id
                return (
                  <div key={pack.id} className="border-2 border-on-background overflow-hidden">
                    {/* Accordion header */}
                    <button
                      onClick={() => setExpandedPack(isOpen ? null : pack.id)}
                      className="w-full flex items-center justify-between px-sm py-xs bg-surface hover:bg-surface-container-high transition-colors"
                    >
                      <p className="font-label-md text-label-md text-on-background">
                        {pack.label}
                      </p>
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                        {isOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {/* 4 frame thumbnails */}
                    {isOpen && (
                      <div className="grid grid-cols-4 gap-[3px] p-xs border-t-2 border-on-background/10 bg-surface-container-low">
                        {pack.frames.map((frame) => {
                          const slotIndex = slots.indexOf(frame.id)
                          const isInSlot = slotIndex !== -1
                          const isDisabled = isFull && !isInSlot

                          return (
                            <button
                              key={frame.id}
                              onClick={() => {
                                if (isInSlot) {
                                  removeSlot(slotIndex)
                                } else if (!isFull) {
                                  addSlot(frame.id)
                                }
                              }}
                              disabled={isDisabled}
                              title={frame.pose}
                              className={`aspect-square border-2 relative overflow-hidden transition-all duration-100 group ${
                                isInSlot
                                  ? 'border-primary-container neo-pop-shadow'
                                  : isDisabled
                                  ? 'border-outline-variant opacity-30 cursor-not-allowed'
                                  : 'border-on-background hover:-translate-x-[1px] hover:-translate-y-[1px] hover:neo-pop-shadow cursor-pointer'
                              }`}
                            >
                              <img
                                src={frame.src}
                                alt={frame.pose}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.parentNode.classList.add(
                                    'bg-surface-container-highest'
                                  )
                                }}
                              />

                              {/* In-slot badge: shows which slot number this frame is in */}
                              {isInSlot && (
                                <div className="absolute inset-0 bg-primary-container/70 flex items-center justify-center">
                                  <span className="font-technical-sm text-[11px] font-bold bg-on-primary-container text-primary-container w-5 h-5 flex items-center justify-center leading-none">
                                    {slotIndex + 1}
                                  </span>
                                </div>
                              )}

                              {/* Hover add hint */}
                              {!isInSlot && !isDisabled && (
                                <div className="absolute inset-0 bg-on-background/0 group-hover:bg-on-background/20 transition-colors flex items-center justify-center">
                                  <span className="material-symbols-outlined text-surface opacity-0 group-hover:opacity-100 text-[20px] transition-opacity">
                                    add
                                  </span>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Upload custom images */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-outline-variant py-sm flex flex-col items-center gap-[4px] hover:bg-surface-container-high hover:border-on-background transition-all"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
                  upload
                </span>
                <p className="font-label-md text-label-md text-on-surface-variant">
                  Upload your own (up to {HARD_MAX} photos)
                </p>
                <p className="font-technical-sm text-technical-sm text-on-surface-variant/50">
                  Replaces all current slots
                </p>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleCustomUpload}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Off state ── */}
      {!useMeme && (
        <p className="font-technical-sm text-technical-sm text-on-surface-variant text-center py-sm border-2 border-dashed border-outline-variant">
          Enable to build a meme lineup and shoot
        </p>
      )}
    </div>
  )
}
