/**
 * SkyLayers — THE LIVING SKY's painter.
 *
 * Five stacked gradient layers, one per phase. CSS decides which one is
 * visible (via <html data-sky="...">), and crossfades between them.
 *
 * SINCE v4.1 (one synchronized world) there is a SIXTH layer, `.sky--live`:
 * when the sky follows the clock (no artistic override), it paints the
 * time-BLENDED palette through the active slots --sky-top/mid/low, which
 * applySkyPhase() re-writes on every clock announcement. The same three
 * gradient stops in the same 0/55/100 geometry as the five palettes — so
 * the look never changes, only the way it flows. The classic stack stays
 * for overrides (?sky= / a dial pick) and for the no-JS fallback.
 * aria-hidden: it's atmosphere, screen readers must skip it entirely.
 */
export default function SkyLayers() {
  return (
    <div className="sky-stack" aria-hidden="true">
      <div className="sky sky-live" />
      <div className="sky sky--dawn" />
      <div className="sky sky--morning" />
      <div className="sky sky--afternoon" />
      <div className="sky sky--sunset" />
      <div className="sky sky--night" />
    </div>
  )
}
