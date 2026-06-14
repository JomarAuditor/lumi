import { useEffect, useRef } from 'react'
import { FILTERS } from '../../utils/imageProcessor'

export default function CameraCanvas({ videoRef, isReady, countdown, filter = 'none', facingMode }) {
  const filterDef = FILTERS[filter] || FILTERS.none

  return (
    <div className="relative w-full aspect-[3/4] md:aspect-[4/3] bg-on-background border-2 border-on-background overflow-hidden">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{
          filter: filterDef.css,
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* Not ready overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-on-background gap-md">
          <span className="material-symbols-outlined text-[64px] text-surface-container-highest animate-pulse2">
            photo_camera
          </span>
          <p className="font-technical-sm text-technical-sm text-surface-container-highest uppercase tracking-widest">
            Initializing camera...
          </p>
        </div>
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-on-background/40">
          <div className="relative flex items-center justify-center">
            {/* Ring */}
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#FAF8F5" strokeWidth="4" opacity="0.2" />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#ff5c00"
                strokeWidth="4"
                strokeLinecap="square"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * (countdown / 3))}
                className="transition-all duration-1000 linear"
              />
            </svg>
            <span className="absolute font-headline-xl text-[64px] text-surface font-bold leading-none">
              {countdown}
            </span>
          </div>
        </div>
      )}

      {/* Flash effect on capture */}
      {countdown === 0 && (
        <div className="absolute inset-0 bg-white animate-pulse2 pointer-events-none" />
      )}

      {/* Corner brackets — viewfinder aesthetic */}
      {isReady && (
        <>
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary-container opacity-80" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary-container opacity-80" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-primary-container opacity-80" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-primary-container opacity-80" />
          {/* Filter label */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-on-background/80 px-sm py-[3px] flex items-center gap-xs backdrop-blur-sm">
            <span className="leading-none text-sm select-none" aria-hidden="true">{filterDef.icon}</span>
            <span className="font-technical-sm text-technical-sm text-surface-container-highest uppercase tracking-widest">
              {filterDef.label}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
