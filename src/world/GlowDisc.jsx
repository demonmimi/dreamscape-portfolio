/**
 * GlowDisc — the feathered circle of light, as a reusable primitive.
 *
 * WHY IT EXISTS (Stage-1 debugging finding): a plain circleGeometry
 * with low opacity paints a HARD-EDGED disc — even at 16% opacity the
 * rim is a visible circle, the exact "flat glowing plate" the Master
 * Reference forbids. Light needs a soft rim: this fragment shader
 * fades a circle from full at its center to nothing at its edge
 * (ordered smoothstep — reversed-edge smoothstep is undefined in GLSL
 * and silently ate the stars on some drivers).
 *
 * SELF-SMOOTHING: it owns its damp (exponential, frame-time
 * normalized), so parent components can pass a *target* alpha and let
 * this drift toward it — no pops when the phase or choreography
 * changes. Uniforms are written THROUGH the live material ref
 * (another debugging finding: a parallel uniforms object can end up
 * disconnected from the one the GPU actually reads).
 */

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  uniform float uSoftness;
  varying vec2 vUv;
  void main() {
    float d = distance(vUv, vec2(0.5));
    /* The feather FALLS ACROSS THE DISC, not just its outer sliver:
       (1 - softness) = the fraction of the radius where the fade
       *begins*. softness 0.08 (sun core) fades in the last 8%; 0.45
       (wide halos) fades across the whole outer half. Before this fix
       a 0.45 halo was 90% flat disc + thin rim — a visible "egg". */
    float edge = (1.0 - uSoftness) * 0.5;
    float feather = 1.0 - smoothstep(edge, 0.5, d);
    float a = feather * uAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
  }
`

export default function GlowDisc({ radius, color, alpha, softness = 0.3, z = 0 }) {
  const matRef = useRef(null)
  const alphaRef = useRef(0)

  useFrame((_, dt) => {
    const mat = matRef.current
    if (!mat || !mat.uniforms) return
    alphaRef.current += (alpha - alphaRef.current) * (1 - Math.exp(-dt * 2.0))
    mat.uniforms.uAlpha.value = alphaRef.current
    mat.uniforms.uColor.value.set(color)
  })

  return (
    <mesh position={[0, 0, z]}>
      <circleGeometry args={[radius, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uColor: { value: new THREE.Color(color) },
          uAlpha: { value: 0 },
          uSoftness: { value: softness },
        }}
        transparent
        depthWrite={false}
        /* NORMAL (alpha) blending — deliberately NOT additive. A
           frame-buffer pixel probe proved the canvas stores only clean
           straight-alpha values; a darkening "halo" seen in headless
           screenshots was the capture pipeline's compositing of
           additive writes onto a transparent canvas, not scene data.
           Normal blending renders identically in every browser. */
        fog={false}
      />
    </mesh>
  )
}
