/**
 * App — the root of DREAMSCAPE.
 *
 * The Vite demo content is retired: the world now mounts the Living Sky
 * and the Home (Heart Island) section. Old template assets/files still
 * exist on disk pending Malek's deletion approval — nothing was removed.
 */
import SkyLayers from './ui/SkyLayers.jsx'
import SkyDial from './ui/SkyDial.jsx'
import Home from './sections/Home.jsx'

export default function App() {
  return (
    <>
      <SkyLayers />
      <SkyDial />
      <main>
        <Home />
      </main>
    </>
  )
}
