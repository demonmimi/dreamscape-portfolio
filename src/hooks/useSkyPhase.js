/* ============================================================================
   DREAMSCAPE — THE LIVING SKY (clock & choice reader)
   ----------------------------------------------------------------------------
   THE PRIORITY LADDER (who decides the current phase):
     1. URL ?sky=sunset          — dev/demo overrides, never saved
     2. localStorage "dreamscape-sky"  — a visitor's manual choice, "auto" default
     3. new Date().getHours()    — the living automatic world.
   VISITOR's local hour, wherever on Earth their device lives.
   ============================================================================ */

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dreamscape-sky';
const URL_OVERRIDE = 'sky';
const EVENT_SKY_CHANGED = 'dreamscape:sky-change';

export const PHASES = ['dawn', 'morning', 'afternoon', 'sunset', 'night'];

/** The manual override a visitor saved. Returns a phase name or 'auto'. */
export function getStoredPreference() {
  return localStorage.getItem(STORAGE_KEY) || 'auto';
}

/** The future theme selector calls this: remember choice, repaint, announce. */
export function setStoredPreference(phase) {
  const next = phase === 'auto' || PHASES.includes(phase) ? phase : 'auto';
  localStorage.setItem(STORAGE_KEY, next);
  applySkyPhase();
  window.dispatchEvent(new CustomEvent(EVENT_SKY_CHANGED, { detail: next }));
}

/** Map an hour of the visitor's local day onto a phase. */
export function getSkyPhase(date = new Date()) {
  const h = date.getHours();

  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 20) return 'sunset';
  return 'night'; /* 20:00 – 04:59 — the long dream */
}

/** Resolve, honor the priority ladder, paint the attribute, return phase. */
export function applySkyPhase() {
  const urlPhase = new URLSearchParams(window.location.search).get(URL_OVERRIDE);

  const phase = PHASES.includes(urlPhase)
    ? urlPhase
    : (PHASES.includes(getStoredPreference()) ? getStoredPreference() : getSkyPhase());

  document.documentElement.dataset.sky = phase;
  return phase;
}

/**
 * React hook — live phase with auto-follow:
 * a visitor who keeps the site open across a phase boundary sees the sky
 * change by itself (checked every minute); a manual selection paints INSTANTLY
 * via the event, with no wait for the next tick.
 */
export function useSkyPhase() {
  const [phase, setPhase] = useState(() => document.documentElement.dataset.sky || getSkyPhase());

  useEffect(() => {
    const followClock = () => setPhase(applySkyPhase());
    const followChoice = () => setPhase(applySkyPhase());

    const timer = setInterval(followClock, 60_000);
    window.addEventListener(EVENT_SKY_CHANGED, followChoice);
    return () => {
      clearInterval(timer);
      window.removeEventListener(EVENT_SKY_CHANGED, followChoice);
    };
  }, []);

  return phase;
}
