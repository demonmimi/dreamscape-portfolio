/**
 * Moon — the storybook crescent, now on the choreography's strings.
 *
 * The crescent remains ONE computed outline (moon's edge the long way
 * around, the bite's edge back between the exact same two tips) —
 * Founder request #3 honored: never two overlapping circles; there is
 * physically no second disc anywhere.
 *
 * Simplified per the approved redesign: astronomy is gone — position,
 * opacity, scale and glow arrive from the Moon's OWN keyframes in
 * celestial.js (all damped, smooth glides). The halo breathes with a
 * soft glow whose strength each keyframe may tune (`glow`); its
 * illumination-fraction dance retired together with the ephemeris.
 */
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import GlowDisc from './GlowDisc.jsx'
import { DEBUG_CELESTIAL } from './celestial.js'

/* The crescent recipe — pure math, done once at scene start (useMemo). */
function buildCrescentShape() {
  const R = 1            /* the moon's radius                   */
  const r = 0.78         /* the bite's radius                   */
  const d = 0.35         /* how far the bite leans toward the edge */

  /* Where the two circles WOULD cross = the two horn tips. */
  const a = (R * R - r * r + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(R * R - a * a, 0))
  const tipMoon = Math.atan2(h, a)      /* top tip from the MOON's center  */
  const tipBite = Math.atan2(h, a - d)  /* top tip from the BITE's center  */

  const shape = new THREE.Shape()
  /* Outer edge: around the moon the LONG way (through its far side). */
  shape.absarc(0, 0, R, tipMoon, 2 * Math.PI - tipMoon, false)
  /* Inner curve: back along the bite's edge, between the SAME two
     tips — the short concave hop (through angle 0, the bite's near
     side). With aClockwise=true the arc sweeps the LONG way through
     the moon's interior, producing a self-intersecting outline whose
     garbled earcut triangulation painted the mysterious dark disc. */
  shape.absarc(d, 0, r, -tipBite, tipBite, true)
  return shape
}

/* The Moon's permanent layer recipe. */
const MOON_HALO_STRENGTH = 0.12  /* the soft sheen around the crescent */

export default function Moon({ state }) {
  const shape = useMemo(buildCrescentShape, [])
  const groupRef = useRef(null)
  const bodyRef = useRef(null)
  const targetRef = useRef(new THREE.Vector3())
  const alphaRef = useRef(0)
  const scaleRef = useRef(null)   /* current scale, damped like position */

  const targetAlpha = DEBUG_CELESTIAL ? Math.max(state.opacity, 0.99) : state.opacity
  const glow = state.glow

  useMemo(() => {
    targetRef.current.set(state.x, state.y, state.z)
  }, [state])

  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return
    g.position.lerp(targetRef.current, 1 - Math.exp(-dt * 1.4))
    /* scale glides with the same softness (state.scale-owned now) */
    if (scaleRef.current == null) scaleRef.current = state.scale
    scaleRef.current += (state.scale - scaleRef.current) * (1 - Math.exp(-dt * 1.4))
    g.scale.setScalar(scaleRef.current)
    alphaRef.current +=
      (targetAlpha - alphaRef.current) * (1 - Math.exp(-dt * 2.0))
    const a = alphaRef.current
    if (bodyRef.current) bodyRef.current.opacity = a
    /* halo breathing is GlowDisc's job now — it damps its own alpha */
  })

  return (
    <group
      ref={groupRef}
      scale={state.scale}        /* per-keyframe scale (damped above) */
      rotation={[0, 0, -0.5]}
      visible={state.opacity > 0.02}
    >
      {/* The crescent itself — self-lit; it IS light. */}
      <mesh>
        <shapeGeometry args={[shape, 64]} />
        <meshBasicMaterial
          ref={bodyRef}
          color="#FBE7B4"         /* soft pale gold, not glaring white */
          transparent
          opacity={0}
          depthWrite={false}
          fog={false}
          toneMapped={false}      /* keep the pastel EXACT, unfiltered */
        />
      </mesh>
      {/* The halo — a feathered GlowDisc: soft rim, depth, no plate. */}
      <GlowDisc radius={1.18} softness={0.5} color="#F6E2B0" alpha={targetAlpha * glow * MOON_HALO_STRENGTH} z={-0.05} />

      {/* Locator ring — exists ONLY while DEBUG_CELESTIAL is true. */}
      {DEBUG_CELESTIAL && (
        <mesh position={[0.35, 0, -0.1]}>
          <ringGeometry args={[1.55, 1.66, 72]} />
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
