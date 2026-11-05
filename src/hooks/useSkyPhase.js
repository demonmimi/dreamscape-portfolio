/* ============================================================================
   DREAMSCAPE — THE LIVING SKY (phase gates & the two-axis state machine)
   ----------------------------------------------------------------------------
   THE EXACT TIME GATES (Founder-approved):
     Dawn        05:00–06:00
     Morning     06:00–12:00
     Afternoon   12:00–17:00
     Sunset      17:00–21:00
     Night       21:00–05:00   (wraps midnight; 00:00 is inside Night)

   THE UNASSIGNED HOUR — 04:00–05:00 (a documented decision):
     No sixth phase exists. The hour here is treated as the TWILIGHT
     BRIDGE inside Night's label: no repaint happens in it. Its smooth
     Night→Dawn feeling is delivered by the choreography (stars easing
     down, the moon ghosting to the upper-right, the sun kissing the
     eastern horizon at exactly 05:00) and the palette crossfade at the
     05:00 boundary (~2 s). The sky never wears a sixth look.

   THE PRIORITY LADDER (who decides the current PHASE/theme):
     1. URL ?sky=sunset          — a LOAD-TIME PREVIEW (an explicit,
                                   optional artistic override).
     2. localStorage "dreamscape-sky" — a visitor's theme override,
                                   "auto" default = follow the clock.
     3. THE SHARED CLOCK (dreamClock.js) — Auto = real local time;
        Manual = the simulated hour (dial slider / play / ?t=).
     The clock owns the WORLD (choreography + colors). A theme override
     changes ONLY the mood/color — it can never move the Sun/Moon/stars,
     which remain loyal to the clock hour, always.

   Announcements: this hook stamps <html data-sky> and listens to BOTH
   'dreamscape:sky-change' (a theme pick) and 'dreamscape:time-change'
   (the clock moved) — so dragging the dial's time slider repaints the
   entire world to the chosen hour's colors instantly.
   ============================================================================ */

import { useEffect, useState } from 'react';
import { getDreamClockHour, subscribeDreamClock } from './dreamClock.js';
import { environmentAt, getSkyPhaseAt as envPhaseAt, PHASES as ENV_PHASES } from '../world/skyEnvironment.js';

/* Re-export so every existing consumer of the gates keeps its import path:
   the ONE phase-gate truth lives in skyEnvironment.js next to the ramps. */
export const getSkyPhaseAt = envPhaseAt;

const STORAGE_KEY = 'dreamscape-sky';
const URL_OVERRIDE = 'sky';
const EVENT_SKY_CHANGED = 'dreamscape:sky-change';

export const PHASES = ENV_PHASES;

/** The manual override a visitor saved. Returns a phase name or 'auto'. */
export function getStoredPreference() {
  return localStorage.getItem(STORAGE_KEY) || 'auto';
}

/** Is a ?sky= URL preview currently active? (Load-time state; SkyDial may lift it.) */
export function isUrlOverrideActive() {
  return PHASES.includes(
    new URLSearchParams(window.location.search).get(URL_OVERRIDE)
  );
}

/** The Sky-Dial calls this: remember choice, lift any URL preview, paint, announce. */
export function setStoredPreference(phase) {
  const next = phase === 'auto' || PHASES.includes(phase) ? phase : 'auto';

  /* 1. Remember the visitor's will. */
  localStorage.setItem(STORAGE_KEY, next);

  /* 2. An act through the dial outranks the URL preview forever — so remove
        it from the address bar (replaceState = no reload, no history spam). */
  if (isUrlOverrideActive()) {
    const params = new URLSearchParams(window.location.search);
    params.delete(URL_OVERRIDE);
    const rest = params.toString();
    window.history.replaceState(
      null,
      '',
      rest ? `${window.location.pathname}?${rest}` : window.location.pathname
    );
  }

  /* 3. Repaint <html data-sky> and announce the change instantly. */
  applySkyPhase();
  window.dispatchEvent(new CustomEvent(EVENT_SKY_CHANGED, { detail: next }));
}

/** Convenience for tests: the phase of the clock's current hour. */
export function getSkyPhase() {
  return getSkyPhaseAt(getDreamClockHour());
}

/** An artistic override truly active right now (URL preview or stored
    phase choice) — otherwise null. The dial's mood axis, once. */
export function getActiveOverride() {
  const urlPhase = new URLSearchParams(window.location.search).get(URL_OVERRIDE);
  if (PHASES.includes(urlPhase)) return urlPhase;
  const stored = getStoredPreference();
  return PHASES.includes(stored) ? stored : null;
}

/** Resolve, honor the priority ladder, paint the attribute, return phase.

    SINCE v4.1 (one synchronized world) this is ALSO the live-color
    stamper — it runs on every clock announcement (Auto minute-ticks,
    slider drags, playback), so the DOM colors glide with the hour:
      • follow-clock  → writes the blended palette as INLINE tokens
        --sky-top/mid/low (inline style beats the tokens' attribute rules
        by CSS priority — no !important involved) and stamps
        <html data-sky-live="on"> so .sky--live owns the screen;
      • override      → removes the inline tokens (the Constitution's
        attribute swaps take back over) and stamps data-sky-live="off",
        letting the classic five-layer crossfade show the crisp choice. */
export function applySkyPhase() {
  const root = document.documentElement;
  const override = getActiveOverride();

  if (override) {
    /* The visitor's (or URL's) artistic will — crisp classic palette. */
    root.dataset.sky = override;
    root.dataset.skyLive = 'off';
    root.style.removeProperty('--sky-top');
    root.style.removeProperty('--sky-mid');
    root.style.removeProperty('--sky-low');
    return override;
  }

  /* Follow the clock: one blended 24-hour palette, stamped inline so the
     active slots glide instead of stepping. (getSkyPhaseAt still decides
     the LABEL — the pill and the stack stay honest at the exact gates.) */
  const env = environmentAt(getDreamClockHour());
  root.style.setProperty('--sky-top', env.top);
  root.style.setProperty('--sky-mid', env.mid);
  root.style.setProperty('--sky-low', env.low);
  root.dataset.skyLive = 'on';
  root.dataset.sky = getSkyPhase();
  return root.dataset.sky;
}

/**
 * React hook — live phase with instant reflection of BOTH inputs:
 *   • the clock (every announcement: Auto minute-ticks, or Manual at
 *     slider/play speed) — the world repainted to the hour's colors;
 *   • a theme pick (dial/URL) — announced instantly via the dial event.
 */
export function useSkyPhase() {
  const [phase, setPhase] = useState(
    () => document.documentElement.dataset.sky || getSkyPhase()
  );

  useEffect(() => {
    const follow = () => setPhase(applySkyPhase());
    const offClock = subscribeDreamClock(follow);
    window.addEventListener(EVENT_SKY_CHANGED, follow);
    return () => {
      offClock();
      window.removeEventListener(EVENT_SKY_CHANGED, follow);
    };
  }, []);

  return phase;
}
