# Kinetic Type & Form

Interactive physics-driven kinetic typography. 8 orchestrated modes. Built with Matter.js.

Text characters are real physics bodies — particles collide, bounce, and flow around them. Each mode applies distinct forces to 70 particles while a proximity smoothstep fades those forces near text surfaces, keeping letterforms legible.

## Modes

**Pulse** → **Orbit** → **Spin** → **Form** → **Chaos** → **Gravity** → **Drift** → **Cohesion** ↻

Sequence follows a narrative arc: rhythm → celestial → kinetic → order → chaos → weight → ascension → convergence. Transitions use z-depth scaling — text recedes into and emerges from the scene at its center point. Mode physics switch at transition start so particles reorganize while text fades.

## Interaction

Drag any particle with your cursor. Shapes respond to mouse constraint with realistic mass and inertia.

## Technical

- Single HTML file, zero build step
- Matter.js collision physics with 70 mixed-geometry particles (circles, rectangles, triangles)
- Per-frame gravity and air friction lookup tables (no redundant per-particle engine writes)
- 3-phase transition FSM: OUT → GAP → IN with staggered per-character easing
- Proximity smoothstep prevents mode forces from destabilizing text collisions
- HiDPI canvas with debounced resize handling
- Work Sans 900 via Google Fonts

## Run

Open `Kinetic_Forms.html` in any modern browser.
