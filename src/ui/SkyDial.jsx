/**
 * SkyDial — the Living Sky's control. The first feature Malek invented.
 *
 * Collapsed: a small glass pill (phase glyph + current phase name).
 * Expanded: a glass panel floating UPWARD with Auto + the five phases.
 *
 * All brainpower lives in the Step-3 system it plugs into:
 *   setStoredPreference() — stores the choice, repaints <html data-sky>,
 *                           broadcasts 'dreamscape:sky-change'.
 *   useSkyPhase()         — live phase, re-renders this component instantly.
 *
 * Accessibility: real <button>s (Tab, Enter, Space are native);
 * aria-expanded tells screen readers the pill opens a panel;
 * aria-pressed marks the active choice; Escape closes (below).
 */
import { useEffect, useState } from 'react'
import {
  PHASES,
  useSkyPhase,
  setStoredPreference,
  getStoredPreference,
  isUrlOverrideActive,
} from '../hooks/useSkyPhase.js'

/* Storybook glyph + label per phase. Emojis stay aria-hidden: decorative. */
const PHASE_META = PHASES.map((id) => ({
  dawn: { id, label: 'Dawn', glyph: '🌅' },
  morning: { id, label: 'Morning', glyph: '🌼' },
  afternoon: { id, label: 'Afternoon', glyph: '☀️' },
  sunset: { id, label: 'Sunset', glyph: '🌆' },
  night: { id, label: 'Night', glyph: '🌙' },
}[id]))

export default function SkyDial() {
  const [open, setOpen] = useState(false)
  /* A ?sky= URL preview is load-time state: it shows honestly on the dial
     and disappears the moment a choice is made (the param is then evicted). */
  const [urlPreview, setUrlPreview] = useState(() => isUrlOverrideActive())
  const current = useSkyPhase()
  const isAuto = getStoredPreference() === 'auto'

  /* Escape closes the dial — kindness to keyboard users. */
  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function choose(id) {
    setStoredPreference(id)
    setUrlPreview(false)    /* our click lifted the URL preview */
    setOpen(false)          /* a completed action closes its box */
  }

  const meta = PHASE_META.find((p) => p.id === current) ?? PHASE_META[0]

  return (
    <div className="sky-dial">
      <button
        type="button"
        className="sky-dial__toggle"
        aria-expanded={open}
        aria-controls="sky-dial-panel"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className="sky-dial__glyph" aria-hidden="true">{meta.glyph}</span>
        <span className="sky-dial__label">{meta.label}</span>
        {urlPreview && (
          <span className="sky-dial__preview" title="URL ?sky= preview active — picking a phase lifts it">
            preview
          </span>
        )}
      </button>

      {open && (
        <div id="sky-dial-panel" className="sky-dial__panel" role="group" aria-label="Choose sky phase">
          <button
            type="button"
            className={`sky-dial__btn${isAuto ? ' is-active' : ''}`}
            aria-pressed={isAuto}
            onClick={() => choose('auto')}
          >
            <span className="sky-dial__glyph" aria-hidden="true">✨</span> Auto
          </button>

          {PHASE_META.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`sky-dial__btn${p.id === current ? ' is-active' : ''}`}
              aria-pressed={p.id === current}
              onClick={() => choose(p.id)}
            >
              <span className="sky-dial__glyph" aria-hidden="true">{p.glyph}</span> {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
