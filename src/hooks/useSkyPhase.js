/* ============================================================================
   DREAMSCAPE — THE LIVING SKY (clock & choice reader)
   ----------------------------------------------------------------------------
   THE PRIORITY LADDER (who decides the current phase):
     1. URL ?sky=sunset          — a LOAD-TIME PREVIEW for testing/demos.
                                   It never blocks the dial forever: any
                                   choice made in SkyDial evicts the param.
     2. localStorage "dreamscape-sky"  — a visitor's manual choice, "auto" default
     3. new Date().getHours()    — the living automatic world.
   No timezone code is needed: Date always returns the VISITOR's local
   hour, wherever on Earth their device lives.
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
        it from the address bar (replaceState = no reload, no history spam).
        After this, applySkyPhase falls through to the stored choice. */
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
