# Design Brief

## Direction

JobTrack AI — Premium job application tracker with luxury minimal productivity design, dark-mode primary with sophisticated indigo primary and warm amber accents for pipeline visualization.

## Tone

Refined, purposeful, confident. No decoration; every element earns visual hierarchy through typography, spacing, and intentional color. Smooth transitions convey premium polish without playfulness.

## Differentiation

Color-coded Kanban pipeline stages with AI confidence rings on Job Fit Score badges and subtle stall-detection aging indicators for applications aged 14+ days.

## Color Palette

| Token           | Light (L C H)      | Dark (L C H)      | Role                          |
| --------------- | ------------------ | ----------------- | ----------------------------- |
| background      | 0.98 0.008 250     | 0.13 0.018 250    | Page base surface              |
| foreground      | 0.18 0.015 250     | 0.92 0.012 250    | Primary text/content           |
| card            | 1.0 0.004 250      | 0.16 0.02 250     | Elevated content surfaces      |
| primary         | 0.45 0.18 265      | 0.68 0.18 265     | CTA buttons, active states     |
| accent          | 0.68 0.16 55       | 0.72 0.18 55      | Warm highlight (offer stage)   |
| destructive     | 0.55 0.22 25       | 0.57 0.2 25       | Rejected applications          |
| chart-1         | 0.5 0.18 265       | 0.7 0.2 265       | Applied stage (indigo)         |
| chart-2         | 0.65 0.16 195      | 0.65 0.18 195     | Interview stage (cyan)         |
| chart-3         | 0.6 0.15 150       | 0.6 0.16 150      | Offer stage (green)            |
| chart-4         | 0.55 0.16 85       | 0.62 0.19 85      | Analytics metric (amber)       |
| muted           | 0.94 0.01 250      | 0.2 0.022 250     | Secondary surfaces, borders    |

## Typography

- Display: Plus Jakarta Sans — headings, form labels, hero text
- Body: Plus Jakarta Sans — paragraphs, table content, UI labels
- Mono: JetBrains Mono — reference text, confidence scores
- Scale: Hero `text-3xl font-bold tracking-tight`, H2 `text-xl font-semibold tracking-tight`, Label `text-sm font-semibold uppercase tracking-widest`, Body `text-base leading-relaxed`

## Elevation & Depth

Subtle shadow hierarchy: minimal shadows on light mode (xs: 0.05, sm: 0.1), elevated shadows on dark mode (md: 0.12, lg: 0.15) to distinguish cards from background. Borders replace heavy shadows.

## Structural Zones

| Zone        | Background         | Border         | Notes                           |
| ----------- | ------------------ | -------------- | ------------------------------- |
| Header      | card               | border/muted   | Sticky nav with app title       |
| Sidebar     | sidebar (0.98/0.16)| sidebar-border | Navigation, active highlight    |
| Content     | background         | —              | Alternating card/muted sections |
| Card (list) | card               | border         | 6px radius, transition-smooth   |
| Footer      | muted/5 opacity    | border-t       | Copyright, minimal              |

## Spacing & Rhythm

6px base radius, 16px micro-spacing (gaps, padding), 24px macro-spacing (section gaps), 32px page padding. Content density: 12px card padding (compact), 16px for section headings.

## Component Patterns

- **Buttons**: Rounded-sm (4px), primary=indigo-600 dark/0.45 light, hover=brightness-110, disabled=opacity-50
- **Cards**: 6px radius, bg-card, 1px solid border-border, shadow-md on dark
- **Badges**: `fit-badge` + stage classes (stage-applied, stage-interview, stage-offer, stage-rejected) with 10% background opacity, colored border 30% opacity
- **Form inputs**: 6px radius, bg-input, focus=ring-2 ring-primary

## Motion

- **Entrance**: fade-in 0.3s ease-out (page load), slide-up 0.4s ease-out (list items)
- **Hover**: transition-smooth 0.3s, scale-102 shadow-lg on cards, text-primary on links
- **Decorative**: float-subtle 3s infinite on AI insight cards, pulse on stalled indicators

## Constraints

- No gradients except as utilities for specific emphasis (hero text only)
- Maximum 2 font families (Plus Jakarta Sans + JetBrains Mono)
- Card shadows use OKLCH alpha values, never hard shadows
- All colors as OKLCH CSS variables, never hex or rgb() literals

## Signature Detail

AI-powered confidence ring on Job Fit Score badges: circular progress indicator showing 0–100% match, scaled with float-subtle animation to draw attention when score >80%.
