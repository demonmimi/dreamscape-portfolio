import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
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
