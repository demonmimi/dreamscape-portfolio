/**
 * WorldCanvas — Stage 0 of the 3D kingdom: the canvas awakens.
 *
 * What exists here (and nothing more, per the approved scope):
 *   • One <Canvas>, mounted once, layered at --z-world:
 *       above the CSS sky-stack (-1), below page content (10).
 *   • A TRANSPARENT canvas: the existing CSS sky keeps painting the sky —
 *     untouched fallback (if WebGL is unavailable, this component
 *     contributes nothing and the site stands complete).
 *   • Fog + two lights, driven by the CURRENT SKY PHASE from the
 *     same useSkyPhase machinery the Sky-Dial uses — one voice, now
 *     speaking to the 3D world through phaseLighting.js.
 *   • A temporary "fog probe" sphere: fog is invisible without geometry,
 *     so this romantic volunteer exists to prove fog works. It retires
 *     in Stage 1.
 */
import { Canvas } from '@react-three/fiber'
import { useSkyPhase } from '../hooks/useSkyPhase.js'
import { getPhaseLighting } from './phaseLighting.js'

function FogProbe() {
  return (
    <mesh position={[0, 0.6, 6]} rotation={[0.5, 0.3, 0]}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshStandardMaterial color="#FDF7EC" />
    </mesh>
  )
}

export default function WorldCanvas() {
  const phase = useSkyPhase()
  const L = getPhaseLighting(phase)

  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}                 /* performance law: clamp device pixel ratio */
        camera={{ fov: 45, position: [0, 1.5, 11] }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        {/* Fog tinted by the current phase — objects fade INTO the sky's mood */}
        <fog attach="fog" args={[L.fog, 12, 30]} />

        <ambientLight color={L.ambientColor} intensity={L.ambient} />
        <directionalLight
          position={[4, 6, 4]}
          color={L.keyColor}
          intensity={L.keyIntensity}
        />

        {/* Temporary witness — retires in Stage 1 */}
        <FogProbe />
      </Canvas>
    </div>
  )
}
