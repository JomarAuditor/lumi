import { COLOR_THEMES } from '../../utils/imageProcessor'

// Mini strip preview — shows how the color looks as an actual strip
function StripSwatch({ theme, isSelected }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col gap-[3px] rounded-[2px] overflow-hidden"
      style={{
        width: 28,
        padding: 3,
        backgroundColor: theme.bg,
        border: `2px solid ${isSelected ? theme.accent : theme.border}`,
        boxShadow: isSelected ? `3px 3px 0px ${theme.border}` : 'none',
        transition: 'all 0.15s',
      }}
    >
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            height: 10,
            borderRadius: 1,
            backgroundColor: theme.border,
            opacity: isSelected ? 0.35 : 0.2,
          }}
        />
      ))}
    </div>
  )
}

// Group themes into light and dark
const LIGHT_KEYS = ['white', 'cream', 'rose', 'sky', 'sage', 'blush', 'lavender']
const DARK_KEYS  = ['black']

export default function ColorPicker({ selected, onChange }) {
  const lightThemes = Object.entries(COLOR_THEMES).filter(([k]) => LIGHT_KEYS.includes(k))
  const darkThemes  = Object.entries(COLOR_THEMES).filter(([k]) => DARK_KEYS.includes(k))

  const renderGroup = (label, list) => (
    <div className="flex flex-col gap-[6px]">
      <p className="font-technical-sm text-[9px] text-on-surface-variant/50 uppercase tracking-[0.12em] px-[2px]">
        {label}
      </p>
      {list.map(([key, theme]) => {
        const isSelected = selected === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={theme.label}
            aria-pressed={isSelected}
            className="w-full flex items-center gap-sm transition-all duration-150 rounded-[1px] outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            style={{
              padding: '10px 12px',
              backgroundColor: theme.bg,
              border: `2px solid ${isSelected ? theme.accent : theme.border + '55'}`,
              boxShadow: isSelected ? `4px 4px 0px ${theme.border}` : 'none',
              transform: isSelected ? 'translate(-1px, -1px)' : 'none',
            }}
          >
            {/* Mini strip thumbnail */}
            <StripSwatch theme={theme} isSelected={isSelected} />

            {/* Color name */}
            <span
              className="flex-1 text-left font-label-md text-label-md leading-none"
              style={{ color: theme.text }}
            >
              {theme.label}
            </span>

            {/* Accent pill */}
            <span
              className="flex-shrink-0 w-4 h-4 rounded-full border"
              style={{
                backgroundColor: theme.accent,
                borderColor: theme.border + '55',
                opacity: isSelected ? 1 : 0.5,
              }}
            />

            {/* Selected check */}
            {isSelected && (
              <span
                className="material-symbols-outlined text-[14px] flex-shrink-0 ml-[2px]"
                style={{ color: theme.text }}
              >
                check_small
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
        Strip Color
      </p>

      {renderGroup('Light & Pastel', lightThemes)}
      {renderGroup('Dark', darkThemes)}
    </div>
  )
}
