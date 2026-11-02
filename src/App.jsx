/**
 * App — the root of DREAMSCAPE.
 *
 * The Vite demo content is retired: the world now mounts the Living Sky
 * and the Home (Heart Island) section. Old template assets/files still
 * exist on disk pending Malek's deletion approval — nothing was removed.
 */
import { lazy, Suspense } from 'react'
import SkyLayers from './ui/SkyLayers.jsx'
import SkyDial from './ui/SkyDial.jsx'
import Home from './sections/Home.jsx'

/* The 3D world loads ASYNC (React.lazy): three.js is heavy (~900 kB),
   so it must never block the homepage's first paint. Until it arrives,
   fallback = null — meaning the CSS sky-stack keeps painting the sky,
   exactly the fallback contract we promised. */
const WorldCanvas = lazy(() => import('./world/WorldCanvas.jsx'))


export default function App() {
  return (
    <>
      <SkyLayers />
      <Suspense fallback={null}>
        <WorldCanvas />
      </Suspense>
      <SkyDial />
      <main>
        <Home />
      </main>
    </>
  )
}
