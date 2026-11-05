/* ============================================================================
   DREAMSCAPE — THE ONE CLOCK (dreamClock)
   ----------------------------------------------------------------------------
   WHY A STORE (and not a useState inside one component): the same "hour"
   must now drive EVERYTHING — choreography, sky colors, fog, lights,
   dial readout. Three different components need to read it; React state
   in one of them can't give that. So the clock is a tiny module: one
   source of truth, an announcement event, and a hook to subscribe.

   THE TWO MODES:
     'auto'   — the hour IS the visitor's real local time. Ticks along
                automatically (checked every minute; the clock store
                itself re-checks each 15 s so phase changes land within
                seconds).
     'manual' — the hour is whatever the visitor chose (slider, or a
                ?t=HH:MM URL start). It can sit still, or PLAY: when
                playing, the hour advances by `speed` sky-seconds per
                real second, wrapping 24 → 0 (00:00) — midnight is just
                the next tick, and the day never ends.

   SPEEDS — "×60" means one real second = one sky-MINUTE (full day in
   24 min); "×300" = one real second = five sky-minutes (full day in
   4.8 min).

   ANNOUNCEMENT: every change fires 'dreamscape:time-change'. The dial,
   the sky-phase hook and the 3D canvas all listen — so moving the time
   to 09:00 repaints the WHOLE world to Morning at once.

   ?t=HH:MM still works exactly as before: it seeds MANUAL mode (frozen
   at that hour) — the time-travel test lever, unchanged in spirit.
   ============================================================================ */

import { useEffect, useState } from 'react'

const EVENT_TIME_CHANGE = 'dreamscape:time-change'

/* The clock state lives here, above React — one copy for everything. */
const clock = {
  mode: 'auto',        /* 'auto' | 'manual' */
  hour: new Date().getHours() + new Date().getMinutes() / 60,
  playing: false,
  speed: 1,            /* sky-seconds per real second */
}

const listeners = new Set()

function announce() {
  for (const listener of listeners) listener(clock)
  window.dispatchEvent(new CustomEvent(EVENT_TIME_CHANGE, { detail: { ...clock } }))
}

/* Seed from the URL once at load: ?t=HH:MM (or ?t=HH) → manual, frozen. */
export function initDreamClockFromUrl() {
  const raw = new URLSearchParams(window.location.search).get('t')
  if (raw) {
    const m = raw.match(/^(\d{1,2}):?(\d{2})?$/)
    if (m) {
      clock.mode = 'manual'
      clock.playing = false
      clock.hour = Math.min(+m[1], 23) + (m[2] ? Math.min(+m[2], 59) : 0) / 60
    }
  }
}

/* THE TICKER — a single rhythm for the whole world.
   Auto mode re-reads the real time regularly (the 60 s photography of
   the old sky is now a 15 s pulse; phase flips never lag past seconds).
   Manual+playing advances the simulated hour; anything faster than
   ×1 needs a quick pulse or time would jump in visible steps. */
const timer = setInterval(() => {
  if (clock.mode === 'auto') {
    const d = new Date()
    const hour = d.getHours() + d.getMinutes() / 60
    /* Announce only when the minute actually turned — auto need not
       wake the world four times a second. */
    if (hour !== clock.hour) {
      clock.hour = hour
      announce()
    }
  } else if (clock.playing) {
    /* advance: realMs→hours = ms/3600000, times the speed multiplier */
    clock.hour = (clock.hour + (250 * clock.speed) / 3_600_000) % 24
    announce()
  }
}, 250)

/* ----- The controls (the dial calls these) -------------------------------- */

/** Visitor picked an exact time → manual mode. */
export function setManualHour(hour) {
  clock.mode = 'manual'
  clock.hour = ((hour % 24) + 24) % 24
  announce()
}

/** Back to the living real world. */
export function backToAuto() {
  clock.mode = 'auto'
  clock.playing = false
  const d = new Date()
  clock.hour = d.getHours() + d.getMinutes() / 60
  announce()
}

/** Play/pause the simulated day. */
export function setPlaying(playing) {
  clock.playing = !!playing
  announce()
}

/** ×1 / ×60 / ×300 — sky-seconds per real second. */
export function setSpeed(speed) {
  clock.speed = speed
  announce()
}

/* ----- React access ------------------------------------------------------- */

/** Subscribe from anywhere (a component or a plain function). Returns
    the unsubscribing function. */
export function subscribeDreamClock(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Plain read — for code outside React (rare). */
export function getDreamClockHour() {
  return clock.hour
}

/** The React hook: re-renders whenever the hour/mode/anything changes.
    This is what WorldCanvas uses to choreograph, and the dial's Time
    section uses to show the current state. */
export function useDreamClock() {
  const [snapshot, setSnapshot] = useState(() => ({ ...clock }))
  useEffect(() => subscribeDreamClock((c) => setSnapshot({ ...c })), [])
  return snapshot
}

/** Format an hour decimal as 24 h clock text (23.5 → "23:30"). */
export function formatClockHour(hour) {
  const h = ((hour % 24) + 24) % 24
  const hh = String(Math.floor(h)).padStart(2, '0')
  const mm = String(Math.round((h - Math.floor(h)) * 60)).padStart(2, '0')
  return `${hh}:${mm}`
}
