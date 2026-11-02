/* ============================================================================
   DREAMSCAPE — PHASE LIGHTING (the 3D twin of the approved palettes)
   ----------------------------------------------------------------------------
   ONE VOICE, TWO MEDIA: the Sky-Dial and its hooks remain the single
   source of *which* phase is active (via useSkyPhase). This file only
   translates a phase NAME into 3D lighting data. Every hex below is
   derived from the approved palette tokens in styles/tokens.css — the
   comment names the token it came from — so the DOM sky and the canvas
   agree by construction, not by luck.

   To adjust a phase's mood later: tokens.css first (DOM), then here
   (3D), keeping their shared hex values in step.
   ============================================================================ */

import { PHASES } from '../hooks/useSkyPhase.js'

export const PHASE_LIGHTING = {
  /* 🌅 DAWN — fog from --sky-dawn-mid #E8A0C8 · sun-glow high
     (--env-sun-glow 1 → warm, strong key light) */
  dawn: {
    fog: '#E8A0C8',
    ambient: 0.55,
    ambientColor: '#F2CF8D',
    keyIntensity: 1.15,
    keyColor: '#F5B87F',          /* golden sunrise              */
  },

  /* 🌼 MORNING — fog from --sky-morning-mid #C7E3F6 · soft fresh light */
  morning: {
    fog: '#C7E3F6',
    ambient: 0.7,
    ambientColor: '#FFFFFF',
    keyIntensity: 1.3,
    keyColor: '#FDF7EC',
  },

  /* ☀️ AFTERNOON — fog from --sky-afternoon-mid #FABFBB · brightest */
  afternoon: {
    fog: '#FABFBB',
    ambient: 0.75,
    ambientColor: '#FFF7E8',
    keyIntensity: 1.45,
    keyColor: '#F7E4B8',
  },

  /* 🌆 SUNSET — fog from --sky-sunset-mid #B558A8 · dramatic, dimmer key */
  sunset: {
    fog: '#B558A8',
    ambient: 0.4,
    ambientColor: '#E877A4',
    keyIntensity: 0.8,
    keyColor: '#F2C24E',
  },

  /* 🌙 NIGHT — fog from --sky-night-mid #45367B · cool, moonlit */
  night: {
    fog: '#45367B',
    ambient: 0.18,
    ambientColor: '#4A3B72',
    keyIntensity: 0.3,
    keyColor: '#8E7CC3',          /* moonlight, not sunlight     */
  },
}

export function getPhaseLighting(phase) {
  /* Falls back to AFTERNOON — the same default :root tokens.css uses. */
  return PHASE_LIGHTING[phase] ?? PHASE_LIGHTING.afternoon;
}
