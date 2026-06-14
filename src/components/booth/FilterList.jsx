import { FILTERS } from '../../utils/imageProcessor'

const FILTER_LIST = Object.entries(FILTERS)

// Tag badge colors
const TAG_STYLES = {
  trending: 'bg-secondary-fixed text-on-secondary-fixed',
  warm:     'bg-[#fff7ed] text-[#7c2d12] border border-[#ea580c]/40',
  bold:     'bg-primary-container text-on-primary-container',
}

export default function FilterList({ selected, onChange }) {
  return (
    <div className="w-full">
      <p className="font-technical-sm text-technical-sm text-on-surface-variant uppercase tracking-widest mb-xs">
        Filter Style
        <span className="ml-xs text-[10px] text-on-surface-variant/50 normal-case tracking-normal">
          ({FILTER_LIST.length} filters)
        </span>
      </p>
      <div className="flex flex-row md:flex-col gap-xs overflow-x-auto md:overflow-x-visible pb-xs md:pb-0">
        {FILTER_LIST.map(([key, def]) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex-shrink-0 flex flex-row md:flex-col items-center md:items-start gap-sm md:gap-[2px] px-sm py-sm border-2 transition-all duration-150 min-h-[52px] group ${
                isSelected
                  ? 'bg-primary-container text-on-primary-container border-on-background neo-pop-shadow'
                  : 'bg-surface text-on-surface border-on-background hover:bg-surface-container-high hover:shadow-[2px_2px_0px_0px_#1b1c1c]'
              }`}
            >
              {/* Icon + label row */}
              <div className="flex items-center gap-xs flex-shrink-0">
                <span className="text-base leading-none select-none" aria-hidden="true">
                  {def.icon}
                </span>
                <span className="font-label-md text-label-md whitespace-nowrap">{def.label}</span>
                {def.tag && (
                  <span className={`hidden md:inline font-technical-sm text-[9px] px-[5px] py-[1px] uppercase tracking-wide leading-none ${TAG_STYLES[def.tag] || ''}`}>
                    {def.tag}
                  </span>
                )}
              </div>
              {/* Description — only visible on desktop */}
              <span className="hidden md:block font-technical-sm text-[10px] opacity-60 leading-tight text-on-surface-variant">
                {def.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
