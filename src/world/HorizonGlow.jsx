/**
 * HorizonGlow — the distant magical light at the sky's hem.
 *
 * A wide, low plane whose fragment shader feathers the color to
 * nothing toward the edges (ordered smoothstep — see GlowDisc for the
 * debugging story behind that rule), so it can never read as a flat
 * glowing plate: it is a *grain of light* dissolving into the fog.
 *
 * STAGE 1.5 — it LEANS toward the sun: `leanX` receives the sun's
 * interpolated world-x from the choreography (clamped to ±10 units,
 * scaled 0.32 — a suggestion of direction, not a spotter's mirror),
 * so at dawn the light pools from the east, at dusk from the west.
 * Its STRENGTH and COLOR remain wholly the dial's.
 *
 * FIX (Stage-1 debugging): uniform values are written THROUGH the
 * live material ref (a side-channel uniform object turned out
 * disconnected from what the GPU reads), and its strength now DAMPS —
 * phase changes glide instead of snapping.
 */

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/* GLSL — the tiny language shaders speak. Vertex passes each pixel's
   place on the plane (uv 0..1) to the fragment part. */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
/* The fragment part: feather = 1 at the center, 0 at the edges. */
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    float d = distance(vUv, vec2(0.5, 0.5));
    float feather = 1.0 - smoothstep(0.02, 0.5, d);
    gl_FragColor = vec4(uColor, feather * uAlpha);
  }
`

const GLOW_TEMPER = 0.55 /* keeps even full glow subtle — Law #5 of the look */

export default function HorizonGlow({ alpha, color, leanX = 0 }) {
  /* The lean: the sun's choreography x, tempered into a suggestion. */
  const lean = Math.max(-10, Math.min(10, leanX * 0.32))

  const matRef = useRef(null)
  const alphaRef = useRef(0)

  useFrame((_, dt) => {
    const mat = matRef.current
    if (!mat || !mat.uniforms) return
    const target = alpha * GLOW_TEMPER
    alphaRef.current += (target - alphaRef.current) * (1 - Math.exp(-dt * 2.0))
    mat.uniforms.uAlpha.value = alphaRef.current
    /* one `.set` a frame on a tiny Color — cheap, and always true */
    mat.uniforms.uColor.value.set(color)
  })

  return (
    <mesh position={[lean, -4.2, -13]}>
      {/* Wide and low: the glowing band where sky meets the cloud sea. */}
      <planeGeometry args={[30, 10]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uColor: { value: new THREE.Color(color) },
          uAlpha: { value: 0 },
        }}
        transparent
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}
