/* ============================================================================
   DREAMSCAPE — THE SKY ENVIRONMENT (one shared, time-derived state)
   ----------------------------------------------------------------------------
   EVERYTHING ATMOSPHERIC, FROM ONE HOUR. The v4 clock already choreographs
   Sun/Moon/stars by their dense numeric timelines; this module gives the
   COLORS the same treatment, so the whole world is one synchronized day:

     • DOM sky gradient   (SkyLayers' live layer, via inline --sky-* slots)
     • fog color          (WorldCanvas)
     • ambient + key light (color & intensity)
     • HorizonGlow strength & color, the Sun's tint

   WHERE THE PALETTES COME FROM — the Constitution only:
     tokens.css stays the single palette source. This module READS the five
     phase token sets (--sky-<phase>-top/mid/low) once at startup through
     getComputedStyle. No hex values are copied here, ever. (The 3D lighting
     numbers below still carry token-derived comments, as phaseLighting.js
     always did — they are LIGHTING facts, not palette tokens.)

   BLENDING — the four approved attention zones:
     Ramp windows around the exact gates. Inside a window the two
     neighbouring palettes mix with smoothstep on the ramp fraction;
     outside a window a phase wears its pure palette. Tables:

       night→dawn      04:00–05:00   (the twilight bridge — 1 full hour)
       dawn→morning    05:40–06:20   (±20 min around the 06:00 gate)
       morning→afternoon 11:40–12:20
       afternoon→sunset  16:40–17:20
       sunset→night      20:40–21:20
       night plateau     21:20–04:00 (deep night; midnight inside it)

     So at 18:30 the sky IS sunset's full rose/orange/gold... (ramp done
     at 17:20), at 04:30 it is halfway Night→Dawn with no sixth palette,
     and 23:59→00:00 changes absolutely nothing — as intended.

   OVERRIDE CONTRACT (two-axis, unchanged): environmentAt(hour, phase)
   with an explicit phase returns that phase's PURE static environment —
   the artistic override keeps its crisp classic look and never blends.

   INVARIANTS GUARDED (the §1.1.b NaN lesson): every value leaving this
   module is a finite number or a well-formed hex string; unparseable
   tokens fall back to the phase table's own fog color rather than ever
   handing a NaN to a material or the DOM.
   ============================================================================ */

export const PHASES = ['dawn', 'morning', 'afternoon', 'sunset', 'night'];

/* Palettes are stored parsed ([r,g,b]); everything LEAVING this module
   must be a well-formed hex string (the guarded-NaN lesson, §1.1.b). */
function hexifyPalette(stops) {
  return {
    top: rgbToHex(stops.top ?? [0x80, 0x80, 0x80]),
    mid: rgbToHex(stops.mid ?? [0x80, 0x80, 0x80]),
    low: rgbToHex(stops.low ?? [0x80, 0x80, 0x80]),
  };
}

/* ---------------------------------------------------------------------------
   THE EXACT GATES (moved here so clock-honoring code and gate-honoring code
   share ONE truth list; useSkyPhase re-exports this for its consumers). */
export function getSkyPhaseAt(hour) {
  const h = ((hour % 24) + 24) % 24;

  if (h >= 5 && h < 6) return 'dawn';
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'sunset';
  return 'night'; /* 21:00 – 05:00, wrapping midnight; the 04–05 hour inside */
}

/* ---------------------------------------------------------------------------
   THE BLEND RAMP TABLE — { start, end, from, to } (see header table). */
const RAMPS = [
  { start: 4.0,                end: 5.0,                from: 'night',     to: 'dawn' },      /* the twilight bridge */
  { start: 5 + 40 / 60,        end: 6 + 20 / 60,        from: 'dawn',      to: 'morning' },
  { start: 11 + 40 / 60,       end: 12 + 20 / 60,       from: 'morning',   to: 'afternoon' },
  { start: 16 + 40 / 60,       end: 17 + 20 / 60,       from: 'afternoon', to: 'sunset' },
  { start: 20 + 40 / 60,       end: 21 + 20 / 60,       from: 'sunset',    to: 'night' },
];

/* ---------------------------------------------------------------------------
   THE 3D LIGHTING MOODS — unchanged values from phaseLighting.js (which is
   now a wrapper around this module; this is the single source). */
export const PALETTE_LIGHTING = {
  dawn: {
    fog: '#E8A0C8', ambient: 0.55, ambientColor: '#F2CF8D',
    keyIntensity: 1.15, keyColor: '#F5B87F',
    glowAlpha: 1, glowColor: '#F7CE8E', sunColor: '#F2A16B',
  },
  morning: {
    fog: '#C7E3F6', ambient: 0.7, ambientColor: '#FFFFFF',
    keyIntensity: 1.3, keyColor: '#FDF7EC',
    glowAlpha: 0.4, glowColor: '#FFE9C4', sunColor: '#FDF7EC',
  },
  afternoon: {
    fog: '#FABFBB', ambient: 0.75, ambientColor: '#FFF7E8',
    keyIntensity: 1.45, keyColor: '#F7E4B8',
    glowAlpha: 0.85, glowColor: '#FFD9A0', sunColor: '#FFE9A8',
  },
  sunset: {
    fog: '#B558A8', ambient: 0.4, ambientColor: '#E877A4',
    keyIntensity: 0.8, keyColor: '#F2C24E',
    glowAlpha: 0.9, glowColor: '#F2C24E', sunColor: '#E8845F',
  },
  night: {
    fog: '#45367B', ambient: 0.18, ambientColor: '#4A3B72',
    keyIntensity: 0.3, keyColor: '#8E7CC3',
    glowAlpha: 0.15, glowColor: '#9B86C9', sunColor: '#C9A06A',
  },
};

export function getPhaseLighting(phase) {
  return PALETTE_LIGHTING[phase] ?? PALETTE_LIGHTING.afternoon;
}

/* ---------------------------------------------------------------------------
   THE PALETTE TABLE — read ONCE from tokens.css (the Constitution). */
const PHASE_PALETTES = {};

function readSkyPalettes() {
  const root = getComputedStyle(document.documentElement);
  for (const phase of PHASES) {
    const stops = {};
    for (const stop of ['top', 'mid', 'low']) {
      const raw = (root.getPropertyValue(`--sky-${phase}-${stop}`) || '').trim();
      stops[stop] = parseHex(raw);
    }
    PHASE_PALETTES[phase] = stops;
  }
}

/* hex "#rrggbb" → [r, g, b]; null when unparseable (guarded, never NaN). */
function parseHex(raw) {
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return [
      parseInt(raw.slice(1, 3), 16),
      parseInt(raw.slice(3, 5), 16),
      parseInt(raw.slice(5, 7), 16),
    ];
  }
  return null;
}

/* mix two palettes' stops channel-wise; a null partner falls back to the
   other's value (a missing token never darkens the day silently). */
function mixStops(stopsA, stopsB, w) {
  const out = {};
  for (const stop of ['top', 'mid', 'low']) {
    const a = stopsA[stop];
    const b = stopsB[stop];
    const v = [0, 1, 2].map((i) => {
      const av = a ? a[i] : null;
      const bv = b ? b[i] : null;
      if (av == null && bv == null) return 0x80;
      if (av == null) return bv;
      if (bv == null) return av;
      return Math.round(av + (bv - av) * w);
    });
    out[stop] = rgbToHex(v);
  }
  return out;
}

function rgbToHex([r, g, b]) {
  const p = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${p(r)}${p(g)}${p(b)}`;
}

/* mix two LIGHTING entries: numbers lerp; colors mix in sRGB. */
function mixLighting(a, b, w) {
  return {
    fog: mixHexColor(a.fog, b.fog, w),
    ambient: a.ambient + (b.ambient - a.ambient) * w,
    ambientColor: mixHexColor(a.ambientColor, b.ambientColor, w),
    keyIntensity: a.keyIntensity + (b.keyIntensity - a.keyIntensity) * w,
    keyColor: mixHexColor(a.keyColor, b.keyColor, w),
    glowAlpha: a.glowAlpha + (b.glowAlpha - a.glowAlpha) * w,
    glowColor: mixHexColor(a.glowColor, b.glowColor, w),
    sunColor: mixHexColor(a.sunColor, b.sunColor, w),
  };
}

function mixHexColor(ra, rb, w) {
  const a = parseHex(ra);
  const b = parseHex(rb);
  if (!a && !b) return ra;
  if (!a) return rb;
  if (!b) return ra;
  return rgbToHex(a.map((v, i) => Math.round(v + (b[i] - v) * w)));
}

/* ---------------------------------------------------------------------------
   THE SHARED STATE — one hour in, the whole atmosphere out. */
export function environmentAt(hour, overridePhase = null) {
  if (!PHASES.includes(overridePhase ?? '')) overridePhase = null;
  if (!Object.keys(PHASE_PALETTES).length) readSkyPalettes();

  /* An explicit artistic override = that phase's pure palette + lighting.
     (v4.2: the matching celestial COMPOSITION comes from celestial.js's
     MOOD_PREVIEW_HOURS — WorldCanvas samples it there. Colors here,
     choreography there; both mood-owned, clock untouched.) */
  if (overridePhase) {
    return {
      ...getPhaseLighting(overridePhase),
      ...hexifyPalette(PHASE_PALETTES[overridePhase] ?? {}),
    };
  }

  const h = ((hour % 24) + 24) % 24;

  /* Inside a ramp? blend from→to across it (smoothstep on the fraction). */
  for (const ramp of RAMPS) {
    if (h >= ramp.start && h <= ramp.end) {
      let f = (h - ramp.start) / (ramp.end - ramp.start);
      f = f * f * (3 - 2 * f); /* the same held-then-flowing easing */
      return {
        ...mixLighting(PALETTE_LIGHTING[ramp.from], PALETTE_LIGHTING[ramp.to], f),
        ...mixStops(PHASE_PALETTES[ramp.from], PHASE_PALETTES[ramp.to], f),
      };
    }
  }

  /* Pure plateau: the phase owning this hour, untouched. */
  const phase = getSkyPhaseAt(h);
  return {
    ...getPhaseLighting(phase),
    ...hexifyPalette(PHASE_PALETTES[phase]),
  };
}
