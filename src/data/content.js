/* ============================================================================
   DREAMSCAPE — CONTENT (the single source of truth)
   ----------------------------------------------------------------------------
   ALL portfolio facts live here. Nothing else in the codebase contains
   "Malek's words" — to update the portfolio, you edit THIS file only.
   Pure data: no imports of components, no markup, no logic.

   Honesty rule (project law inherited from the plan): levels are written
   as the three real states — "comfortable", "familiar", "learning".
   Never invent achievements, certifications or features.
   ============================================================================ */

/* ---------- Identity ------------------------------------------------------ */
export const site = {
  name: 'Malek Ben Khlifa',
  title: 'Web Developer & UI/UX Designer',
  location: 'Tunis, Tunisia', // TODO: confirm how you want to be located
}

/* ---------- Home — The Heart Island --------------------------------------- */
export const hero = {
  greeting: "Hello, I'm Mimi ✨",
  intro: "A developer with a designer's eye.",
  flavor: "Somewhere between creativity and code, I found my world. 🌷",
  ctaExplore: 'Begin the journey',
}

/* ---------- About — The Enchanted Library --------------------------------- *
 * Education (confirmed):                                                    */
export const education = {
  degree: "Licence en Technologies de l'Informatique — Multimédia et Développement Web",
  school: 'ISET Djerba',
  year: 2026,
}

export const about = {
  // TODO: your words. Draft kept deliberately short until you write your own.
  bio: 'I\u2019m a web developer with a designer\u2019s eye and an imagination that refuses to stay inside the box. I\u2019m currently completing my licence at ISET Djerba and building projects that bring ideas to life.',
  interests: ['Web development', 'UI/UX design', 'Interactive experiences', 'Creative digital products'],
  // TODO: professional approach — write freely later.
  approach: 'Learning by building — every project is a workshop lesson.',
}

/* ---------- Skills — The Inventor's Workshop ------------------------------
 * level ∈ 'comfortable' | 'familiar' | 'learning'  (exactly three states) */
export const skillCategories = [
  {
    id: 'frontend',
    label: 'Frontend Development',
    skills: [
      { name: 'HTML', level: 'comfortable' },
      { name: 'CSS', level: 'comfortable' },
      { name: 'JavaScript', level: 'familiar' },
      { name: 'React', level: 'familiar' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend Development',
    skills: [
      { name: 'Java', level: 'familiar' },
      { name: 'PHP', level: 'familiar' },
      { name: 'Spring Boot', level: 'learning' },
      { name: 'Node.js', level: 'learning' },
      { name: 'Express', level: 'learning' },
    ],
  },
  {
    id: 'design',
    label: 'UI/UX & Design',
    skills: [
      { name: 'Figma', level: 'familiar' },
      { name: 'Photoshop', level: 'familiar' },
      { name: 'Illustrator', level: 'familiar' },
    ],
  },
  {
    id: 'databases',
    label: 'Databases',
    skills: [
      { name: 'SQL', level: 'familiar' },
      { name: 'MySQL', level: 'familiar' },
      { name: 'PostgreSQL', level: 'learning' },
    ],
  },
  {
    id: 'tools',
    label: 'Development Tools',
    skills: [
      { name: 'Git', level: 'familiar' },
      { name: 'GitHub', level: 'familiar' },
    ],
  },
]

/* ---------- Projects — The Magical Marketplace ----------------------------
 * Only confirmed real projects. Fields left null/empty are waiting for
 * YOUR confirmation — never filled by invention. */
export const projects = [
  {
    id: 'cinebox',
    name: 'CineBox',
    subtitle: "L'Agora cinema platform",
    description:
      'A cinema project built during a professional internship for L\u2019Agora.',
    type: 'Internship project',
    tech: [],           // TODO: exact technologies you used there
    role: 'TODO: your contribution, in your own words',
    challenges: 'TODO: challenge → solution, in your own words',
    screenshots: [],
    github: null,       // TODO: repo URL if public
    live: null,         // TODO: live URL if it exists
  },
  {
    id: 'shrimp-time',
    name: 'Shrimp Time',
    subtitle: 'Restaurant website',
    description:
      'A website for a seafood restaurant — my own creative web project.',
    type: 'Personal project',
    tech: [],           // TODO: exact technologies (HTML/CSS/JS? React?)
    role: 'TODO: your contribution',
    challenges: 'TODO: challenge → solution',
    screenshots: [],
    github: null,       // TODO: repo URL if public
    live: null,         // TODO: live URL if it exists
  },
]

/* ---------- Experience — The Observatory ----------------------------------
 * Facts only. Education first; internship listed as the real milestone. */
export const experience = [
  {
    id: 'iset',
    date: '2022 — 2026', // TODO: confirm your exact study years
    title: 'Licence en Technologies de l\u2019Informatique',
    place: 'ISET Djerba',
    detail: 'Multimédia et Développement Web track.',
  },
  {
    id: 'cinebox-internship',
    date: 'TODO: confirm dates',
    title: 'Internship — CineBox / L\u2019Agora',
    place: 'TODO: confirm location/format',
    detail: 'Cinema web project.',
  },
]

/* ---------- Contact — The Message Station ---------------------------------- */
export const contact = {
  email: 'malekbenkhlifa84@gmail.com',
  github: 'https://github.com/demonmimi',
  linkedin: null,       // TODO: your LinkedIn URL
  linkedinLabel: 'LinkedIn',
}
