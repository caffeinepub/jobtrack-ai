# JobTrack AI — SpaceX Cinematic Design System

## Direction

Industrial aerospace minimalism. Pure black void (#000000) with spectral white text (#f0f0fa). Full-bleed 100vh cinematic photography backgrounds (rockets, space, Earth, Mars). Ghost buttons only. Zero cards, panels, shadows, borders, decorative elements. Interface disappears into photography.

## Tone

Uncompromising minimalism. Every pixel serves the cinematic aerospace aesthetic. Typography + photography only. All text UPPERCASE with geometric sans-serif (D-DIN / Space Grotesk).

## Color Palette

| Token | OKLCH | Purpose |
|-------|-------|---------|
| background | 0.0 0.0 0 | Space black void |
| foreground | 0.96 0.002 250 | Spectral white text |
| accent | 0.96 0.002 250 | Ghost button text/border |
| muted | 0.15 0.001 250 | Secondary hierarchy |
| destructive | 0.55 0.22 25 | Error state only |

## Typography

| Scale | Font | Size | Weight | Tracking | Case |
|-------|------|------|--------|----------|------|
| Hero/Display | Space Grotesk | 48px+ | 700 | 0.96px | UPPERCASE |
| Nav/Labels | Space Grotesk | 13px | 700 | 1.17px | UPPERCASE |
| Body | Space Grotesk | 16px | 400 | 1.17px | UPPERCASE |
| Captions | Space Grotesk | 12px | 400 | 1.17px | UPPERCASE |

## Elevation & Depth

NO SHADOWS. Depth through composition only: full-bleed photography + dark overlay + left-aligned uppercase text overlays. Zero borders, zero decoration.

## Structural Zones

| Zone | Treatment | Content |
|------|-----------|---------|
| Page Sections | 100vh full-bleed aerospace photography + rgba(0,0,0,0.5) overlay | Left-aligned uppercase text, generous padding |
| Navigation | Transparent overlay on photography, tracked uppercase | SpaceX wordmark style, ghost buttons only |
| Content | Direct text overlay on photography, NO containers | Bold uppercase typography, minimal density |
| CTAs | Ghost buttons only | rgba(240,240,250,0.1) bg, 1px rgba(240,240,250,0.35) border, 32px radius |

## Spacing & Rhythm

Full-viewport 100vh pacing between sections. Left-aligned text with generous padding (32px minimum). Text bleeds to viewport edges. No containers, no card padding, no micro-spacing hierarchy.

## Component Patterns

- **Ghost Button**: rgba(240,240,250,0.1) background, 1px solid rgba(240,240,250,0.35) border, 32px border-radius, 18px horizontal padding, UPPERCASE tracked text, hover: +5% opacity
- **Typography**: ALL UPPERCASE, 0.96px letter-spacing (hero), 1.17px (body/nav), Space Grotesk geometric sans-serif
- **NO Cards, NO Badges, NO Borders, NO Shadows, NO Decorative Icons**

## Motion

- **Entrance**: fade-in (opacity 0 → 1)
- **Transition**: slide-up between 100vh sections
- **Hover**: Ghost button background brightens +5%, text emphasis
- NO DECORATIVE ANIMATIONS. Motion serves navigation only.

## Patterns

- All text UPPERCASE with positive letter-spacing (0.96px hero, 1.17px nav/body)
- Ghost button: no fill, subtle transparency, 32px rounded, minimal contrast on dark background
- Full-viewport photography as negative space—interface disappears into image
- No cards, panels, containers, shadows, borders, decorative icons, badges
- Vertical 100vh pacing between sections (each section = new cinematic scene)
- Dark overlay ensures text legibility on all imagery

## Constraints

- Pure black (#000000) background ONLY
- Spectral white (#f0f0fa) text ONLY
- Space Grotesk font ONLY (geometric sans-serif, no serif fallbacks)
- ALL TEXT UPPERCASE with positive tracking
- Ghost buttons are the ONLY interactive element (no solid fills, no colors, no effects)
- ZERO shadows, zero borders, zero cards, zero containers, zero decorative elements
- Photography + Typography only — the interface must disappear

## Signature Detail

Uncompromising minimalism. The photography IS the whitespace. The interface vanishes into aerospace imagery. Every pixel serves the cinematic experience.
