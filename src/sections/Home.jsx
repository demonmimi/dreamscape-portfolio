/**
 * Home — The Heart Island.
 *
 * Deliberately simple (approved scope): typography + living sky + one
 * paper panel. Every word comes from data/content.js — this file holds
 * structure only, so Malek can rewrite copy without touching markup.
 */
import { hero, site } from '../data/content.js'

export default function Home() {
  return (
    <section className="home-hero" id="home" aria-label="Introduction">
      <p className="home-hero__greeting on-sky">{hero.greeting}</p>
      <h1 className="home-hero__name on-sky">{site.name}</h1>
      <p className="home-hero__title on-sky">{site.title}</p>

      <div className="paper-panel home-hero__intro">
        {hero.intro}
        <p className="home-hero__flavor">{hero.flavor}</p>
      </div>

      <a className="home-hero__cta on-sky" href="#about">
        {hero.ctaExplore} ↓
      </a>
    </section>
  )
}
