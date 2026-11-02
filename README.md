# 🌙 DREAMSCAPE

Hello, I'm **Malek Ben Khlifa** — an IT graduate and aspiring web developer with a designer's eye and an imagination that refuses to stay inside the box.

I graduated in **Licence en Technologies de l'Informatique — Multimédia et Développement Web** from **ISET Djerba in 2026**. I'm interested in web development, UI/UX design, and building creative digital experiences that bring ideas to life.

**DREAMSCAPE is not a conventional portfolio.** It's a floating kingdom in the sky: a whimsical, surrealist storybook world where six magical locations each hold one chapter of my journey as a developer and designer.

I'm building this experience with React, Vite, CSS, React Three Fiber, GSAP — and a lot of pastel paint.

---

## 📓 My Project Journal

I keep my working notes, decisions and ideas here, so this repository documents its own journey — from the initial concept to the final interactive experience.

Last updated: 2026-11-02.

### The Vision

A hand-painted, dreamlike fantasy world: soft glowing clouds in lavender, rose pink, mint and baby blue; quirky pastel cottages; winding staircases made of clouds; a glowing Ferris wheel; hot-air balloons; a grandfather clock standing on a stack of books; a teacup house with cream swirls; stardust and a glowing crescent moon.

**Rich, chaotic scenery behind — clean, readable information in front.**

I never want it to look like a generic SaaS website, flat pastel cards, or generic low-poly 3D.

### The Six Locations

| # | Location | Represents |
|---|---|---|
| 1 | ⛅ **The Heart Island** (Home) | My introduction and the beginning of the journey |
| 2 | 📚 **The Enchanted Library** (About) | My background, education and approach to development |
| 3 | 🔧 **The Inventor's Workshop** (Skills) | My technical and creative skills, with honest proficiency levels |
| 4 | 🏪 **The Magical Marketplace** (Projects) | My projects and case studies: CineBox and Shrimp Time |
| 5 | 🔭 **The Observatory** (Experience) | My education, internship and professional milestones |
| 6 | 📮 **The Message Station** (Contact) | How to reach me: email, LinkedIn and GitHub |

### My Architecture Decision — Strategy C (Hybrid) ✅

- One persistent React Three Fiber canvas — "one stage, six plays".
- Illustrated 2D painted layers (CSS parallax) for the sky, edges and atmosphere.
- Real 3D landmark dioramas at the center of interest (toon / gradient materials).
- I get magic from *art direction* (fog, rim light, palette, particles), not from polygon count.
- Graceful degradation: every island can fall back to illustrated PNG artwork if the 3D look ever disappoints.

### My Six Project Laws

I set these rules for myself before writing a single line — breaking them is a mistake I'd rather catch at a git diff than a week later:

1. **Incremental** — Heart Island first; never all six 3D environments at once.
2. **Simple milestones** — Git, structure, design tokens, typography, basic homepage before anything fancy.
3. **No heavy libraries** — Three.js, GSAP and friends only when I truly need them.
4. **Tested, not assumed** — Performance targets must be verified, especially on mobile.
5. **Understanding over copy-paste** — I want to understand the code, practice independently and document what I learn.
6. **No silent file changes** — Every important change should be explained before implementation.

### My Design System

**Palette** (locked as a starting point — I allow myself small adjustments when something doesn't look right in the browser):

| Role | Name | HEX |
|---|---|---|
| Sky top | Midnight haze | `#3A2E55` |
| Sky mid | Twilight lavender | `#8E7CC3` |
| Sky low | Dream pink | `#E8A0C8` |
| Cloud rose | — | `#F5B8CB` |
| Cloud mint | — | `#BDE6D0` |
| Cloud baby blue | — | `#B8DFF2` |
| Cream / paper | — | `#FDF7EC` |
| Warm ivory | — | `#FFF9F0` |
| Soft peach | — | `#FCC7A8` |
| Soft gold | — | `#F2CF8D` |
| Gold highlight (glow only) | — | `#EFB54A` |
| Ink text | Deep plum ink | `#3A3149` |
| Secondary text | Muted mauve | `#6E6280` |
| Headings (on dark) | Cream | `#FFF9F0` |
| Links / interactive | Royal lavender | `#7B5EA7` |
| Hover | Rose | `#E58BB0` |
| Focus ring | Gold | `#EFB54A` |

**Typography**

- **Fraunces** (600–700) → display headings
- **Cormorant Garamond** (italic 500/600) → storybook accent titles
- **Nunito Sans** (400/600/700) → body text
- System monospace → tiny tech tags

**My taste rules:** Gold is for glow/focus/magic, never body text. Body text never floats over busy scenery without a paper panel behind it. All text combinations must pass WCAG AA contrast. `prefers-reduced-motion` is respected everywhere.

### My Milestone Log

| Date | Step | Result |
|---|---|---|
| 2026-11-02 | M1 · Step 1 | Git + GitHub connected, scaffold committed (`origin/main`) ✓ |

### 💭 My Ideas Parking Lot

*New ideas go here instead of derailing my current milestone. I review them at phase gates.*

---

## 🔧 If You're Inspecting the Code

This project uses [React](https://react.dev) + [Vite](https://vite.dev) with JavaScript (no TypeScript, by design — I learn on the language the web natively speaks).

Clone it, then:

```bash
git clone https://github.com/demonmimi/dreamscape-portfolio.git
cd dreamscape-portfolio
npm install
npm run dev
npm run build
```

The local development server is available at `http://localhost:5173`.

*The portfolio is in active construction — the world grows one island at a time.* 🌙

---

<p align="center">
  Made with curiosity, creativity, and a little bit of chaos ✨
</p>
