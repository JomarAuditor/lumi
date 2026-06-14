/**
 * PrintCard
 * Mobile-first gallery card.
 * On desktop: hover reveals overlay with actions.
 * On mobile: actions are always visible in the bottom bar (no hover state on touch).
 */
export default function PrintCard({ print, onDownload, onDelete, deleting = false }) {
  const date = print.created_at
    ? new Date(print.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  const imgSrc = print.public_url || print.dataUrl

  return (
    <div
      className={`masonry-card relative group bg-surface border-2 border-on-background mb-[12px]
        transition-all duration-200
        ${deleting
          ? 'opacity-40 pointer-events-none'
          : 'md:hover:shadow-[6px_6px_0px_0px_#1b1c1c] md:hover:-translate-x-[2px] md:hover:-translate-y-[2px]'
        }
      `}
    >
      {/* Image */}
      <div className="relative overflow-hidden border-b-2 border-on-background">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`Print from ${date}`}
            className="w-full object-cover block"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="w-full aspect-[1/2] bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30">
              image_not_supported
            </span>
          </div>
        )}

        {/* Desktop hover overlay */}
        <div className="hidden md:flex absolute inset-0 bg-on-background/0 group-hover:bg-on-background/80
          transition-all duration-200 flex-col justify-end p-sm">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 mb-xs">
            <p className="font-technical-sm text-[11px] text-surface/70 uppercase tracking-widest">{date}</p>
            {print.template && (
              <p className="font-technical-sm text-[11px] text-surface/50 uppercase tracking-widest mt-[2px]">
                {print.template.replace(/-/g, ' ')}{print.color ? ` · ${print.color}` : ''}
              </p>
            )}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-xs">
            <button
              onClick={() => onDownload?.(print)}
              className="flex-1 bg-surface text-on-surface border-2 border-on-background py-xs
                font-label-md text-label-md neo-pop-shadow active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                transition-all flex items-center justify-center gap-[4px]"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              Save
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete?.(print)}
                className="bg-error text-on-error border-2 border-on-background px-xs py-xs
                  neo-pop-shadow active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                  transition-all flex items-center justify-center"
                aria-label="Delete print"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Deleting overlay */}
        {deleting && (
          <div className="absolute inset-0 bg-on-background/60 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-surface animate-spin">autorenew</span>
          </div>
        )}
      </div>

      {/* Bottom bar — always visible, contains actions on mobile */}
      <div className="px-xs py-2 flex items-center justify-between gap-xs">
        <div className="min-w-0 flex-1">
          <span className="font-technical-sm text-[10px] text-on-surface-variant uppercase tracking-widest truncate block">
            {date}
          </span>
          {print.color && (
            <span className="font-technical-sm text-[10px] text-on-surface-variant/60 uppercase tracking-widest block truncate">
              {print.color}
            </span>
          )}
        </div>

        {/* Mobile action buttons — always visible on small screens */}
        <div className="flex gap-1 md:hidden flex-shrink-0">
          <button
            onClick={() => onDownload?.(print)}
            className="w-9 h-9 flex items-center justify-center border-2 border-on-background bg-surface
              active:bg-surface-container transition-colors"
            aria-label="Download print"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete?.(print)}
              className="w-9 h-9 flex items-center justify-center border-2 border-on-background bg-surface
                active:bg-error active:text-on-error transition-colors"
              aria-label="Delete print"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
