/* ============================================================================
   DREAMSCAPE — THE SKY CHOREOGRAPHY v4 (continuous 24-hour timelines)
   ----------------------------------------------------------------------------
   VERSION NOTES:
     • v1 — real astronomy (astronomy-engine). removed by approved decision:
       art direction wins over ephemeris for a portfolio.
     • v3 — object-centric but SPARSE: ~6 keyframes/object, night froze for
       ~8 h (identical plateau rows), invisible objects parked instead of
       traveling, and the clock lived here (split-brain with the dial).
     • v4 (this file) — THE CONTINUOUS DAY: each object owns a DENSE,
       FULL-CYCLE timeline. The whole 24 hours is covered (including the
       hours an object spends invisible), so:
         – every object is ALWAYS in motion (even at opacity 0),
         – it RE-APPEARS exactly where its hidden journey parked it,
         – midnight is just another glide (the wrap bracket is designed
           on purpose; nothing jumps at 23:59→00:00).
     • the CLOCK moved to hooks/dreamClock.js — one shared time source
       for choreography AND sky colors. This file is pure choreography.

   THE TIMELINES (independent, per object):
     hour     — the exact decimal hour this row is TRUE (6.5 = 06:30)
     x, y, z  — position in world units (west +x / east −x, y up, z = the
                storybook sky plane). Below-horizon rows (y < −2) are the
                "backstage": an object can cross the world in private,
                invisible, and step on stage exactly where planned.
     opacity  — 0 invisible … 1 fully present
     scale    — visual size multiplier of the whole body
     glow     — halo strength (1 = the usual melt; rows may tune it)
     (stars: alpha only — a sheet-level brightness)

   INTERPOLATION — per-segment SMOOTHSTEP, chosen deliberately:
     it only ever blends its two neighbor rows, so a value can NEVER
     overshoot past a neighbor → no backward drifting sun, no jumping.
     Catmull-Rom was considered and REJECTED for exactly that overshoot
     risk (dense rows + plateau homogeneity would make the curve bend
     sideways between points). Smoothstep's "hold-and-flow" reads as
     dreamy gliding, and with dense rows it feels continuous everywhere,
     including every phase boundary and midnight.

   MAPPING RULES (kept from v3, verified visually):
     • a body's opacity reaches 0 only while it is OFF-STAGE (below the
       horizon or beyond the frame edge) — invisible never blinks at you,
     • the Sun's and Moon's visible paths never overlap (the moon rises
       in the east ONLY while the sun is already diving in the west),
     • night night plateau: stars hold 1.0 from 22:30 to 02:00; the two
       bodies keep quietly gliding — alive but calm.

   ?t=HH:MM — the test lever (dreamClock): seeds Manual mode. Combine
   freely with the dial's ?sky= artistic override (?sky= sunset & t=7 =
   sunset colors, dawn choreography).
   ============================================================================ */

import {
  useDreamClock,
} from '../hooks/dreamClock.js'
import { useEffect, useState } from 'react'

/* How deep the "storybook sky" sits (named, not scattered). */
const SKY_DEPTH = -46

/* ---------------------------------------------------------------------------
   THE SUN'S FULL DAY — 13 rows.
   Below-horizon hours are real rows: the sun keeps sliding WEST after
   sundown, and while invisible (23:48–02:30) crosses under the world to
   the EAST side, so it re-emerges there at dawn with zero jumps. */
export const SUN_KEYFRAMES = [
  { hour: 2.5,  x: -26,   y: -6,   z: SKY_DEPTH, opacity: 0,    scale: 1,    glow: 0    }, /* asleep east-below, beginning to glide */
  { hour: 5.0,  x: -27,   y: -2.2, z: SKY_DEPTH, opacity: 0.18, scale: 1,    glow: 1.1  }, /* kisses the eastern horizon            */
  { hour: 5.5,  x: -27,   y: 0.6,  z: SKY_DEPTH, opacity: 0.5,  scale: 1,    glow: 1.15 }, /* rising, fully in view                 */
  { hour: 7.0,  x: -24,   y: 5.4,  z: SKY_DEPTH, opacity: 0.9,  scale: 1,    glow: 1.05 }, /* morning climb begins                  */
  { hour: 9.5,  x: -15,   y: 9.6,  z: SKY_DEPTH, opacity: 1,    scale: 1,    glow: 1    }, /* high-morning                          */
  { hour: 12.0, x: 0,     y: 12.2, z: SKY_DEPTH, opacity: 1,    scale: 1.05, glow: 0.9  }, /* NOON CROWN — highest, centered        */
  { hour: 14.5, x: 8,     y: 11.2, z: SKY_DEPTH, opacity: 1,    scale: 1.04, glow: 0.95 }, /* leaning west, gently              */
  { hour: 16.5, x: 17,    y: 8,    z: SKY_DEPTH, opacity: 1,    scale: 1,    glow: 1.05 }, /* the long descent                   */
  { hour: 18.0, x: 22,    y: 5.8,  z: SKY_DEPTH, opacity: 0.95, scale: 1,    glow: 1.15 }, /* evening glow builds                */
  { hour: 19.3, x: 26,    y: 3.0,  z: SKY_DEPTH, opacity: 0.85, scale: 1,    glow: 1.25 }, /* ember west                         */
  { hour: 20.3, x: 27.5,  y: 0.4,  z: SKY_DEPTH, opacity: 0.5,  scale: 1,    glow: 1.1  }, /* half-buried in the horizon         */
  { hour: 21.2, x: 28,    y: -3.5, z: SKY_DEPTH, opacity: 0,    scale: 1,    glow: 0    }, /* gone — still sliding west          */
  { hour: 23.8, x: 28,    y: -6,   z: SKY_DEPTH, opacity: 0,    scale: 1,    glow: 0    }, /* deep sleep (wrap partner of 02:30) */
]

/* ---------------------------------------------------------------------------
   THE MOON'S FULL DAY — 15 rows, its OWN journey:
   fades in the upper-right through dawn; slips below the western edge
   (still moving, invisible) around noon; crosses under the world to the
   east; rises subtle through the evening; centers and glows at night;
   keeps drifting gently right ALL night (alive, unhurried). */
export const MOON_KEYFRAMES = [
  { hour: 2.0,  x: 15,    y: 9.9,  z: SKY_DEPTH, opacity: 0.92, scale: 4.2, glow: 1    }, /* late night, drifting right      */
  { hour: 4.0,  x: 19,    y: 10.3, z: SKY_DEPTH, opacity: 0.6,  scale: 4,   glow: 0.85 }, /* pre-dawn fade begins            */
  { hour: 5.0,  x: 21.5,  y: 10.5, z: SKY_DEPTH, opacity: 0.35, scale: 3.8, glow: 0.7  }, /* twilight ghost                  */
  { hour: 6.0,  x: 23.5,  y: 10.6, z: SKY_DEPTH, opacity: 0.18, scale: 3.7, glow: 0.6  }, /*                                 */
  { hour: 6.5,  x: 24,    y: 10.6, z: SKY_DEPTH, opacity: 0.14, scale: 3.6, glow: 0.6  }, /* dawn's faded upper-right moon   */
  { hour: 8.5,  x: 25.5,  y: 7.5,  z: SKY_DEPTH, opacity: 0.05, scale: 3.3, glow: 0.45 }, /* a whisper sinking west          */
  { hour: 10.0, x: 26.5,  y: 2.5,  z: SKY_DEPTH, opacity: 0,    scale: 3.2, glow: 0.4  }, /* slides below the western edge   */
  { hour: 13.0, x: 28,    y: -5,   z: SKY_DEPTH, opacity: 0,    scale: 3,   glow: 0.3  }, /* asleep below west               */
  { hour: 15.0, x: -27,   y: -5,   z: SKY_DEPTH, opacity: 0,    scale: 3,   glow: 0.3  }, /* crossed east (in private!)      */
  { hour: 16.5, x: -26.5, y: -0.5, z: SKY_DEPTH, opacity: 0.15, scale: 3.6, glow: 0.6  }, /* a first sliver...               */
  { hour: 18.0, x: -24.5, y: 4.4,  z: SKY_DEPTH, opacity: 0.38, scale: 3.9, glow: 0.8  }, /* sunset: eases in from the east  */
  { hour: 19.0, x: -20,   y: 6.8,  z: SKY_DEPTH, opacity: 0.55, scale: 4.05, glow: 0.9 }, /*                                 */
  { hour: 20.5, x: -8,    y: 8.9,  z: SKY_DEPTH, opacity: 0.9,  scale: 4.2, glow: 1    }, /* homeward glide                  */
  { hour: 21.5, x: 1,     y: 9.5,  z: SKY_DEPTH, opacity: 1,    scale: 4.2, glow: 1    }, /* NIGHT — centered, full glow     */
  { hour: 23.5, x: 8,     y: 9.6,  z: SKY_DEPTH, opacity: 1,    scale: 4.2, glow: 1    }, /* drifting right through the night*/
]

/* ---------------------------------------------------------------------------
   THE STARS' FULL NIGHT-TO-DAY — an independent brightness curve.
   Fades in through the evening, full sheet through deep night, eases out
   across the whole dawn hour — never a sudden appearance/disappearance. */
export const STARS_KEYFRAMES = [
  { hour: 2.0,  alpha: 1 },
  { hour: 4.0,  alpha: 0.85 },
  { hour: 5.0,  alpha: 0.5 },
  { hour: 6.0,  alpha: 0.28 },
  { hour: 6.5,  alpha: 0.22 },
  { hour: 8.0,  alpha: 0.05 },
  { hour: 9.5,  alpha: 0 },
  { hour: 15.0, alpha: 0 },
  { hour: 17.0, alpha: 0.08 },
  { hour: 18.5, alpha: 0.2 },
  { hour: 20.0, alpha: 0.45 },
  { hour: 21.0, alpha: 0.75 },
  { hour: 22.5, alpha: 1 },
]

/* ---------------------------------------------------------------------------
   THE INTERPOLATOR — generic, per list, per segment:
   finds the two rows bracketing `hour` (wrapping midnight by treating
   the wrap bracket as last-row → first-row+24h), blends with smoothstep,
   returns every numeric row property mixed. */
function sampleKeyframes(frames, hour) {
  const h = ((hour % 24) + 24) % 24
  const n = frames.length

  /* Which pair brackets h? (the last row's bracket wraps to the first) */
  let aIndex = n - 1
  for (let k = 0; k < n; k++) {
    if (h < frames[k].hour) {
      aIndex = k - 1
      break
    }
  }
  const a = frames[(aIndex + n) % n]
  const b = frames[(aIndex + 1) % n]

  /* Normalize across midnight: 23.9 sits between 23.8 and 2.5(+24). */
  const aH = a.hour > h ? a.hour - 24 : a.hour
  const bH = b.hour <= aH ? b.hour + 24 : b.hour
  let f = (h - aH) / (bH - aH || 1)
  f = f * f * (3 - 2 * f)   /* the smoothstep — held at rows, flowing between */

  const state = {}
  for (const key of Object.keys(a)) {
    if (key === 'hour') continue
    const va = a[key]
    const vb = b[key]
    if (typeof va === 'number' && typeof vb === 'number') {
      state[key] = va + (vb - va) * f
    } else {
      state[key] = va
    }
  }
  return state
}

/* THE WORLD STATE AT AN HOUR — three independent samples, assembled. */
export function celestialStateAt(hour) {
  return {
    sun: sampleKeyframes(SUN_KEYFRAMES, hour),
    moon: sampleKeyframes(MOON_KEYFRAMES, hour),
    stars: sampleKeyframes(STARS_KEYFRAMES, hour),
  }
}

/* ---------------------------------------------------------------------------
   THE MOOD PREVIEW HOURS (v4.2 — the Founder's complete-look previews):
   the Sky-Dial's five Artistic Mood buttons preview the WHOLE atmosphere
   (colors + Sun + Moon + stars), so each mood needs one hour whose
   choreography IS its canonical composition — chosen inside each phase's
   PURE PALETTE PLATEAU so the colors are that phase's exact look:

     dawn       5.3   sun kissing the eastern horizon, very faded moon
                    upper-right, faint stars
     morning    7.0   sun clearly visible, rising (left/east); moon α .05;
                    no stars
     afternoon 13.0   sun higher, near center; nothing else visible
     sunset    18.5   ember sun toward the western horizon, subtle
                    crescent east, stars (α .2) gradually returning
     night     22.0   sun fully gone, glowing crescent center-high, the
                    full sheet

   The CLOCK IS NEVER TOUCHED while a mood previews: choosing a sample
   hour for the renderer ≠ moving the clock. Releasing the mood simply
   re-points the sampler at the real (auto/manual/playing) hour, and the
   damped components glide the world back. */
export const MOOD_PREVIEW_HOURS = {
  dawn: 5.3,
  morning: 7.0,
  afternoon: 13.0,
  sunset: 18.5,
  night: 22.0,
}

/* React hook — the choreography rides the ONE clock. The component
   re-renders on every clock announcement; while the simulated sky plays
   fast, update rate follows the announcements themselves. */
export function useSkyClock() {
  return useDreamClock().hour
}

/* HELPERS FOR TESTS AND FUTURE DEBUGGING (tiny, harmless in prod). */
export { useDreamClock } from '../hooks/dreamClock.js'
export { initDreamClockFromUrl } from '../hooks/dreamClock.js'

/* TEMPORARY Stage-1 debug aid: while TRUE, Sun/Moon render at full
   strength with a thin magenta locator ring. Default FALSE. */
export const DEBUG_CELESTIAL = false
