/* ============================================================================
   DREAMSCAPE — PHASE LIGHTING (compatibility wrapper, v4.1)
   ----------------------------------------------------------------------------
   The lighting table MOVED to skyEnvironment.js (approved redesign: the
   mood must blend continuously with the hour, so lighting lives beside
   the ramp mixer instead of as a per-phase lookup). This file keeps the
   old import path breathing for any code that still reads it — it adds
   nothing of its own and owns no second truth.
   ============================================================================ */

export { PALETTE_LIGHTING as PHASE_LIGHTING, getPhaseLighting } from './skyEnvironment.js'
