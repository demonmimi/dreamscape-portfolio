import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* Typography — self-hosted fonts (installed as tiny asset packages).
   Imported here so the stylesheet connecting them loads before first paint. */
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'
import '@fontsource/cormorant-garamond/600-italic.css'
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'

import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import { applySkyPhase } from './hooks/useSkyPhase.js'
import App from './App.jsx'

// The Living Sky is resolved before render so the very first painted
// frame already wears the visitor's local hour — no color flash.
applySkyPhase()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
