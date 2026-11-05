/**
 * StarField — Stage 1 (rewrite after Stage 1 debugging).
 *
 * REAL BUG that forced this rewrite (documented in docs/LEARNING.md):
 * drei's <Stars> uses a custom ShaderMaterial that never reads
 * material.opacity — so the dial's star fade (0.25 at dawn, 0 at day)
 * was silently ignored; stars glowed full-bright in every theme.
 * Replaced with a 35-line points shader of our own that obeys
 * opacity BY CONSTRUCTION — no new dependency (drei stays installed
 * for its other tools), no texture (roundness is computed per pixel,
 * like HorizonGlow's feather).
 *
 * MOTION TRUTH (simplified with the approved redesign):
 *   • Individual stars do NOT wander (fixed positions map the sheet).
 *   • The whole sheet drifts around the vertical axis at a slow,
 *     constant rate (the Earth's-ish true slide — 0.25°/minute:
 *     watch over minutes; it is built to stay calm, never spinning).
 *   • A whisper of twinkle (±12% brightness, slow) gives life without
 *     becoming a firefly swarm. Calm, per the Master Reference.
 */

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const COUNT = 1400

/* Round, soft points: gl_PointCoord gives the position INSIDE each
   square point sprite — we simply feather a circle out of it. */
const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (130.0 / -mv.z);   /* perspective, dainty */
    vColor = aColor;
    vTwinkle = 0.88 + 0.12 * sin(uTime * 0.6 + aPhase * 6.2831);
  }
`
const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    /* FIX (Stage-1 debug): reversed-edge smoothstep (0.5 → 0.14) is
       UNDEFINED in GLSL — some drivers return 0 for every pixel,
       which made the whole star sheet vanish. Ordered edges only. */
    float soft = 1.0 - smoothstep(0.14, 0.5, d);
    float a = soft * uOpacity * vTwinkle;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor, a);
  }
`

/* The star sheet's pastels — a whisper of color, never harsh white. */
const STAR_TINTS = ['#F2E8FF', '#FFF3D8', '#FFE9E4', '#E8F0FF']

const SIDEREAL_RATE = (15 * Math.PI) / 180 / 3600 /* 15°/hour, in rad/s */

export default function StarField({ alpha }) {
  const group = useRef(null)
  const pointsRef = useRef(null)
  const alphaRef = useRef(alpha ?? 0)

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    const phases = new Float32Array(COUNT)
    const colors = new Float32Array(COUNT * 3)
    const c = new THREE.Color()
    for (let i = 0; i < COUNT; i++) {
      /* A shell band around the whole world — some stars sit high, some near. */
      const r = 42 + Math.random() * 4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      sizes[i] = 0.8 + Math.random() * 1.7  /* tiny: ~2–7 px on screen */
      phases[i] = Math.random()
      c.set(STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)])
      colors[i * 3 + 0] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  /* FIX (Stage-1 debugging): uniforms are written THROUGH the live
     material ref. A parallel uniforms object passed via JSX proved
     disconnected from the copy the renderer actually reads (the probe
     showed the Points alive with uOpacity frozen at 0) — the lesson:
     mutate the material the GPU sees, never a side-channel copy. */
  useFrame((_, delta) => {
    const root = group.current
    if (!root) return
    /* CONTINUITY (v4): the sheet is ALWAYS visible and ALWAYS drifting —
       even in full day, when uOpacity is 0 (the shader discards each
       <0.004 pixel). Freezing the rotation before (root.visible=false at
       day) made stars resume from a stale spot after dusk. */
    const mat = pointsRef.current?.material
    if (mat?.uniforms?.uOpacity) {
      /* a whisper of damping: the clock's linked alpha glides, never snaps */
      alphaRef.current += (alpha - alphaRef.current) * (1 - Math.exp(-delta * 3))
      mat.uniforms.uOpacity.value = alphaRef.current
      mat.uniforms.uTime.value = (mat.uniforms.uTime.value || 0) + delta
    }
    root.rotation.y += delta * SIDEREAL_RATE   /* the slow, alive slide */
  })

  return (
    <group ref={group}>
      <points geometry={geometry} ref={pointsRef}>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{ uOpacity: { value: 0 }, uTime: { value: 0 } }}
          transparent
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </points>
    </group>
  )
}
