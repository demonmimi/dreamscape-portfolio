/**
 * Sun — art-directed sun, built from three feathered GlowDiscs:
 *   1. CORE  — small and brightest: "here is the light itself"
 *   2. DISC  — the visible body, a touch wider, dimmer
 *   3. HALO  — wide and faint: the melt into the sky
 * No flat yellow button anywhere — every rim is feathered by the
 * GlowDisc shader. Position is damped toward the choreography's
 * target (exponential softness); opacity is smoothed inside each
 * GlowDisc — the two layers of "no sudden popping".
 *
 * INDEPENDENCE (Founder refinement): every property this component
 * consumes comes from the Sun's OWN keyframes in celestial.js —
 *   state.opacity → overall presence (0–1)
 *   state.scale   → visual size of the whole body
 *   state.glow    → strength of the glow-only layers (disc + halo)
 * where 1 = the usual melt. The layer RATIOS below are the Sun's own
 * permanent look, named constants — no magic numbers.
 *
 * Ownership: position/opacity/scale/glow = day-time (celestial.js);
 * tint = the dial's `color` prop from phaseLighting.js.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import GlowDisc from './GlowDisc.jsx'
import { DEBUG_CELESTIAL } from './celestial.js'

/* The Sun's permanent layer recipe (times the per-phase `glow`). */
const DISC_STRENGTH = 0.8   /* the disc is slightly weaker than the core */
const HALO_STRENGTH = 0.22  /* the wide melt stays a whisper            */

export default function Sun({ state, color }) {
  const groupRef = useRef(null)
  const targetRef = useRef(new THREE.Vector3())
  const scaleRef = useRef(null)   /* current scale, damped like position */

  const targetOpacity = DEBUG_CELESTIAL ? Math.max(state.opacity, 0.99) : state.opacity
  const glow = state.glow

  useMemo(() => {
    targetRef.current.set(state.x, state.y, state.z)
  }, [state])

  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return
    g.position.lerp(targetRef.current, 1 - Math.exp(-dt * 1.4))
    /* scale glides with the same softness as position (state.scale on) */
    if (scaleRef.current == null) scaleRef.current = state.scale
    scaleRef.current += (state.scale - scaleRef.current) * (1 - Math.exp(-dt * 1.4))
    g.scale.setScalar(scaleRef.current)
  })

  return (
    <group ref={groupRef} visible={state.opacity > 0.02}>
      {/* 1. core — always full opacity; the sun's essence */}
      <GlowDisc radius={1.35} softness={0.08} color={color} alpha={targetOpacity} />
      {/* 2. disc — body strength rides the opacity × glow */}
      <GlowDisc radius={2.6} softness={0.28} color={color} alpha={targetOpacity * glow * DISC_STRENGTH} z={-0.1} />
      {/* 3. halo — the melt, weakest of all */}
      <GlowDisc radius={4.6} softness={0.45} color={color} alpha={targetOpacity * glow * HALO_STRENGTH} z={-0.4} />

      {/* Locator ring — exists ONLY while DEBUG_CELESTIAL is true. */}
      {DEBUG_CELESTIAL && (
        <mesh position={[0, 0, -0.6]}>
          <ringGeometry args={[4.9, 5.15, 72]} />
          <meshBasicMaterial
            color="#FF3FA4"
            transparent
            opacity={0.6}
            depthWrite={false}
            fog={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  )
}
