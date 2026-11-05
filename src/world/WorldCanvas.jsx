/**
 * WorldCanvas — Stage 1: The Living Sky (simplified celestial edition).
 *
 * What exists here now:
 *   • One <Canvas>, mounted once, layered at --z-world:
 *       above the CSS sky-stack (-1), below page content (10).
 *   • A TRANSPARENT canvas: the existing CSS sky keeps painting the
 *     actual sky — untouched fallback if WebGL is unavailable.
 *
 * THE OWNER MAP (object-centric edition):
 *   • day-time (celestial.js choreography, testable with ?t=HH:MM)
 *     → each of Sun / Moon / Stars has its OWN keyframe list (position
 *       x/y/z + opacity + scale + glow; stars just an alpha curve), all
 *       interpolated INDEPENDENTLY on their own timelines. Position and
 *       opacity are damped — nothing pops.
 *   • ONE clock → colors glide too (v4.1): skyEnvironment.js blends the
 *       five palettes + lighting across the hour — DOM gradient, fog,
 *       lights, glow, sun tint. No staircase at the gates anymore.
 *   • the Sky-Dial override → mood PINNED to the chosen phase (crisp
 *       classic look); the clock keeps owning positions.
 *
 * CHANGELOG (announced before each implementation):
 *   Stage 1   — fog probe retires; StarField, Moon, HorizonGlow join.
 *   Stage 1.5 — astronomy interlude: taught us what we DON'T need;
 *               removed with the Founder's approval (see docs/LEARNING.md
 *               §1.1.c). Replaced by the art-directed choreography.
 *
 * Zero texture assets. Zero CSS changes. Zero palette changes.
 */

import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSkyPhase, getActiveOverride } from '../hooks/useSkyPhase.js'
import { environmentAt } from './skyEnvironment.js'
import { useSkyClock, celestialStateAt, MOOD_PREVIEW_HOURS } from './celestial.js'
import StarField from './StarField.jsx'
import Moon from './Moon.jsx'
import Sun from './Sun.jsx'
import HorizonGlow from './HorizonGlow.jsx'

/* The fog, owned imperatively so announcements never remount it: created
   once, its COLOR re-set per clock tick (v4.1: it glides with the hour).
   (see LEARNING.md §1.2 — uniforms/objects must be written through the
   live object; props-swap remounting was the old staircase). */
const FOG_NEAR = 12
const FOG_FAR = 30
function SkyFog({ color }) {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    if (!scene.fog) scene.fog = new THREE.Fog(color, FOG_NEAR, FOG_FAR)
    scene.fog.color.set(color)
  }, [scene, color])
  return null
}

export default function WorldCanvas() {
  const phase = useSkyPhase()                 /* DOM label (gates)          */
  const hour = useSkyClock()                  /* the ONE clock (continuous) */

  /* v4.1 — the atmosphere rides the same hour: colors blended every tick.
     v4.2 — an Artistic Mood preview redirects the SAMPLER, not the clock:
     colors come from the mood's static palette (environmentAt ignores the
     hour under an override) AND the celestial state is sampled at the
     mood's representative hour, so Sun/Moon/stars match the look. The
     hour below stays the clock's whenever no override is active. */
  const override = getActiveOverride()
  const lookHour = override ? MOOD_PREVIEW_HOURS[override] : hour
  const sky = celestialStateAt(lookHour)          /* celestial glide (v4)   */
  const L = environmentAt(lookHour, override)

  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}                 /* performance law: clamp device pixel ratio */
        camera={{ fov: 45, position: [0, 1.5, 11] }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        {/* Fog tinted continuously by the hour — objects fade INTO the
            sky's current mood (SkyFog re-colors it, never remounts). */}
        <SkyFog color={L.fog} />

        <ambientLight color={L.ambientColor} intensity={L.ambient} />
        <directionalLight
          position={[4, 6, 4]}
          color={L.keyColor}
          intensity={L.keyIntensity}
        />

        {/* Sky furniture — independent strings, one clock, one dial. */}
        <StarField alpha={sky.stars.alpha} />
        <HorizonGlow alpha={L.glowAlpha} color={L.glowColor} leanX={sky.sun.x} />
        <Sun state={sky.sun} color={L.sunColor} />
        <Moon state={sky.moon} />
      </Canvas>
    </div>
  )
}
