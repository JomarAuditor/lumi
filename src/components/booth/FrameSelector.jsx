import { LAYOUTS } from '../../utils/imageProcessor'

// Only show user-facing layouts — meme-split is handled by the Meme tab
const LAYOUT_LIST = Object.entries(LAYOUTS).filter(([key]) => key !== 'meme-split')

// Visual strip preview: renders tiny rectangles representing photo slots
function StripPreview({ rows, width = 20 }) {
  const slotH = Math.floor(44 / rows)
  return (
    <div className="flex-shrink-0 flex flex-col gap-[3px]" style={{ width }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-current opacity-40 border border-current rounded-[1px]"
          style={{ height: `${slotH}px` }}
        />
      ))}
    </div>
  )
}

// Layout type badge
function LayoutBadge({ type }) {
  const styles = {
    duo: 'bg-primary-container/60 text-on-primary-container',
    solo: 'bg-secondary-fixed/20 text-on-surface-variant',
  }
  return (
    <span className={`font-technical-sm text-[9px] uppercase tracking-widest px-[5px] py-[2px] ${styles[type]}`}>
      {type === 'duo' ? 'Duo' : 'Solo'}
    </span>
  )
}

export default function FrameSelector({ selected, onChange }) {
  // Group layouts: dual first, then single
  const dualLayouts  = LAYOUT_LIST.filter(([k]) => k.startsWith('dual'))
  const singleLayouts = LAYOUT_LIST.filter(([k]) => k.startsWith('single'))

  const renderGroup = (label, list) => (
    <div className="flex flex-col gap-xs">
      {/* Group label */}
      <p className="font-technical-sm text-[10px] text-on-surface-variant/50 uppercase tracking-widest px-[2px]">
        {label}
      </p>
      {list.map(([key, def]) => {
        const isSelected = selected === key
        const isSingle   = def.isSingleStrip

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-sm px-sm py-sm border-2 transition-all duration-150 text-left ${
              isSelected
                ? 'bg-primary-container text-on-primary-container border-on-background neo-pop-shadow'
                : 'bg-surface text-on-surface border-on-background hover:bg-surface-container-high hover:shadow-[2px_2px_0px_0px_#1b1c1c]'
            }`}
          >
            {/* Strip thumbnail preview */}
            <div className="flex gap-[4px] flex-shrink-0 opacity-70">
              <StripPreview rows={def.photoCount} width={isSingle ? 28 : 18} />
              {!isSingle && <StripPreview rows={def.photoCount} width={18} />}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-[3px] min-w-0 flex-1">
              <div className="flex items-center gap-xs">
                <span className="font-label-md text-label-md leading-tight">{def.label}</span>
                <LayoutBadge type={isSingle ? 'solo' : 'duo'} />
              </div>
              <span className="font-technical-sm text-[10px] opacity-60 leading-tight truncate">
                {def.photoCount} pose{def.photoCount > 1 ? 's' : ''} · {isSingle ? 'single strip' : 'dual strip'} · branded footer
              </span>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <span className="material-symbols-outlined text-[16px] flex-shrink-0 opacity-80">
                check
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="w-full flex flex-col gap-sm">
      <p className="font-technical-sm text-technical-sm text-on-surface-variant uppercase tracking-widest">
        Print Layout
      </p>
      {renderGroup('Two strips (cut apart)', dualLayouts)}
      {renderGroup('One strip (keep whole)', singleLayouts)}
    </div>
  )
}
