/**
 * SkyDial — the Living Sky's control. The first feature Malek invented.
 *
 * THE TWO-SECTION CLASSIC (clock-refined):
 *   ⏱ TIME OF DAY — the world's master clock:
 *       • ✨ Follow real time (Auto): the hour is the visitor's local
 *         real time; everything (colors + choreography) follows it.
 *       • the slider / play / speed: Manual simulated time. Dragging
 *         picks an exact 24h-format hour; ▶ plays the whole day to
 *         watch; ×1 ×60 ×300 speed it up (a full day in 5 min).
 *   🎨 ARTISTIC MOOD (v4.2) — a complete-look PREVIEW, clearly a show
 *       that must never touch the clock:
 *       • Follow clock: the natural state — colors + celestial both
 *         ride whatever the Time of day says.
 *       • one of five phases: renders that mood's CANONICAL atmosphere
 *         — its pure palette AND its celestial composition (from the
 *         mood's representative hour's keyframes, celestial.js), so the
 *         preview is the whole scene, not colors alone. The stored/
 *         simulated time is untouched underneath; releasing the mood
 *         (Follow clock / follow real time) restores the clock hour's
 *         exact environment.
 *
 * All brainpower lives in the systems it plugs into:
 *   dreamClock.js (one shared hour + controls; broadcasts
 *                  'dreamscape:time-change')
 *   useSkyPhase.js (exact gates; watches the clock + applies <html data-sky>)
 *   celestial.js MOOD_PREVIEW_HOURS (each mood's canonical composition)
 *
 * Accessibility: real <button>s, aria-pressed marks active choices,
 * aria-expanded tells screen readers the pill opens, Escape closes.
 */
import { useEffect, useState } from 'react'
import {
  PHASES,
  useSkyPhase,
  setStoredPreference,
  getStoredPreference,
  isUrlOverrideActive,
} from '../hooks/useSkyPhase.js'
import {
  useDreamClock,
  setManualHour,
  backToAuto,
  setPlaying,
  setSpeed,
  formatClockHour,
} from '../hooks/dreamClock.js'

/* Storybook glyph + label per phase. Emojis stay aria-hidden: decorative. */
const PHASE_META = PHASES.map((id) => ({
  dawn: { id, label: 'Dawn', glyph: '🌅' },
  morning: { id, label: 'Morning', glyph: '🌼' },
  afternoon: { id, label: 'Afternoon', glyph: '☀️' },
  sunset: { id, label: 'Sunset', glyph: '🌆' },
  night: { id, label: 'Night', glyph: '🌙' },
}[id]))

/* Playback speeds — "×60" = one real second is one sky-minute. */
const SPEEDS = [
  { value: 1, label: '×1' },      /* real-time marathon        */
  { value: 60, label: '×60' },    /* a day in 24 minutes       */
  { value: 300, label: '×300' },  /* a day in under 5 minutes  */
]

/* The slider's resolution: 5-minute steps (48 in a day) — precise for
   testing boundaries, coarse enough to stay friendly. */
const SLIDER_STEP = 1 / 12
const snapToStep = (hour) => Math.round(hour / SLIDER_STEP) * SLIDER_STEP

export default function SkyDial() {
  const [open, setOpen] = useState(false)
  /* A ?sky= URL preview is load-time state: it shows honestly on the dial
     and disappears the moment a choice is made (the param is then evicted). */
  const [urlPreview, setUrlPreview] = useState(() => isUrlOverrideActive())
  const current = useSkyPhase()
  const theme = getStoredPreference()   /* 'auto' = follow the clock */
  const clock = useDreamClock()
  const isClockAuto = clock.mode === 'auto'

  /* Escape closes the dial — kindness to keyboard users. */
  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function chooseTheme(id) {
    setStoredPreference(id)
    setUrlPreview(false)    /* our click lifted the URL preview */
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
          <span className="sky-dial__preview" title="URL ?sky= preview active — picking a theme lifts it">
            preview
          </span>
        )}
      </button>

      {open && (
        <div id="sky-dial-panel" className="sky-dial__panel" role="group" aria-label="Sky controls">

          {/* ⏱ TIME OF DAY — the one clock that owns the world */}
          <div className="sky-dial__section" role="group" aria-label="Time of day">
            <span className="sky-dial__section-label">Time of day</span>

            <button
              type="button"
              className={`sky-dial__btn${isClockAuto ? ' is-active' : ''}`}
              aria-pressed={isClockAuto}
              onClick={() => backToAuto()}
            >
              <span className="sky-dial__glyph" aria-hidden="true">✨</span> Follow real time
            </button>

            {/* The 24 h time readout + play/pause — manual controls only
                matter when the clock is simulated. */}
            <div className="sky-dial__time-row">
              <span className="sky-dial__time" aria-atomic="true">
                {formatClockHour(clock.hour)}
              </span>
              <button
                type="button"
                className={`sky-dial__btn sky-dial__btn--small${isClockAuto ? '' : ' is-static'}`}
                aria-label={clock.playing ? 'Pause the simulated day' : 'Play the simulated day'}
                aria-pressed={clock.playing}
                disabled={isClockAuto}
                onClick={() => setPlaying(!clock.playing)}
              >
                {clock.playing ? '⏸' : '▶'}
              </button>
              {SPEEDS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className="sky-dial__btn sky-dial__btn--small"
                  aria-pressed={!isClockAuto && clock.speed === s.value}
                  disabled={isClockAuto}
                  onClick={() => { setManualHour(clock.hour); setSpeed(s.value); setPlaying(true) }}
                  title={`Speed ×${s.value} — one real second = ${s.value === 1 ? 'one' : s.value + ' sky seconds'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <input
              type="range"
              className="sky-dial__slider"
              min={0}
              max={24 - SLIDER_STEP}
              step={SLIDER_STEP}
              value={snapToStep(clock.hour)}
              aria-label="Simulated hour of day, 24-hour clock"
              onChange={(e) => setManualHour(parseFloat(e.target.value))}
            />
          </div>

          {/* 🎨 ARTISTIC MOOD — a complete-look preview; the clock keeps
              its course underneath and is never touched by a pick. */}
          <div className="sky-dial__section" role="group" aria-label="Artistic sky mood (optional look preview)">
            <span className="sky-dial__section-label">
              Artistic mood <em>(optional — a full look preview; time keeps its course)</em>
            </span>

            <div className="sky-dial__chips">
              <button
                type="button"
                className={`sky-dial__btn${theme === 'auto' ? ' is-active' : ''}`}
                aria-pressed={theme === 'auto'}
                onClick={() => chooseTheme('auto')}
                title="The mood follows the Time of day"
              >
                <span className="sky-dial__glyph" aria-hidden="true">✨</span> Follow clock
              </button>

              {PHASE_META.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`sky-dial__btn${theme === p.id ? ' is-active' : ''}`}
                  aria-pressed={theme === p.id}
                  onClick={() => chooseTheme(p.id)}
                >
                  <span className="sky-dial__glyph" aria-hidden="true">{p.glyph}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
