/**
 * SkyLayers — THE LIVING SKY's painter.
 *
 * Five stacked gradient layers, one per phase. CSS decides which one is
 * visible (via <html data-sky="...">), and crossfades between them.
 * This component is deliberately dumb: no props, no state, no logic —
 * the *tokens* own the colors, the *attribute* owns the choice.
 * aria-hidden: it's atmosphere, screen readers must skip it entirely.
 */
export default function SkyLayers() {
  return (
    <div className="sky-stack" aria-hidden="true">
      <div className="sky sky--dawn" />
      <div className="sky sky--morning" />
      <div className="sky sky--afternoon" />
      <div className="sky sky--sunset" />
      <div className="sky sky--night" />
    </div>
  )
}
