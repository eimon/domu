# Domu Design System — "Obsidian Glass"

Visual language for the Domu platform, applicable to both the Next.js web app and the React Native / Expo mobile app.

---

## Core Aesthetic

Dark navy-black base with frosted glass panels, indigo/violet accent, and crisp typography. Inspired by premium property management software.

**One rule:** Everything lives on a dark canvas. Surfaces "float" with glass transparency. The accent color (`domu-primary`) is the only saturated color used for interactive/active states.

---

## Color Tokens

| Token | Hex / Value | Usage |
|-------|------------|-------|
| `domu-base` | `#06090f` | App background |
| `domu-surface` | `#0c1120` | Option/select backgrounds |
| `domu-primary` | `#818cf8` | Accent, active states, buttons, focus rings |
| `domu-success` | `#34d399` | Success states, active badges |
| `domu-warning` | `#fbbf24` | Warning states, tentative badges |
| `domu-danger` | `#f87171` | Error states, cancel actions |

### Transparency scale (white over dark backgrounds)

| Name | Value | Usage |
|------|-------|-------|
| text-primary | `rgba(255,255,255,0.90)` | Primary text, headings |
| text-secondary | `rgba(255,255,255,0.55)` | Subtitles, descriptions |
| text-tertiary | `rgba(255,255,255,0.40)` | Placeholders, captions, disabled |
| text-muted | `rgba(255,255,255,0.28)` | Input placeholders |
| surface-glass | `rgba(255,255,255,0.04)` | Cards, panels |
| surface-elevated | `rgba(255,255,255,0.07)` | Hovered cards, secondary surfaces |
| surface-modal | `rgba(6,9,15,0.88)` | Dialogs, overlays |
| border-subtle | `rgba(255,255,255,0.08)` | Card borders, dividers |
| border-medium | `rgba(255,255,255,0.11)` | Elevated surface borders |
| border-strong | `rgba(255,255,255,0.20)` | Inactive tab hover |

---

## Glass Effects

Three levels of glass, from most transparent to most opaque:

### `glass` — base panel
```
background: rgba(255,255,255,0.04)
backdropFilter: blur(24px) saturate(160%)
border: 1px solid rgba(255,255,255,0.08)
borderRadius: 12px
```
Used for: cards, table wrappers, sidebar (desktop)

### `glass-elevated` — hovered / active panel
```
background: rgba(255,255,255,0.07)
backdropFilter: blur(24px) saturate(160%)
border: 1px solid rgba(255,255,255,0.11)
borderRadius: 12px
```
Used for: card hover states, secondary surfaces

### `glass-modal` — dialog / overlay
```
background: rgba(6,9,15,0.88)
backdropFilter: blur(40px) saturate(200%)
border: 1px solid rgba(255,255,255,0.09)
borderRadius: 16px
```
Used for: modals, floating menus, overlays

### `glass-sidebar` — nav panel
```
background: rgba(8,12,22,0.94)
backdropFilter: blur(24px) saturate(160%)
borderRight: 1px solid rgba(255,255,255,0.07)
```
Used for: the main navigation sidebar

> **Expo note:** React Native does not support `backdrop-filter`. Use `BlurView` from `expo-blur` as a substitute. On Android (where BlurView may not work), increase the background opacity: use `rgba(8,12,22,0.97)` instead.

---

## Typography

Font family: **Geist** (web). For Expo use **Inter** or **DM Sans** (similar proportions).

| Role | Size | Weight | Color |
|------|------|--------|-------|
| Page title | 20px / 1.25rem | 700 | text-primary |
| Section heading | 16px / 1rem | 600 | text-primary |
| Card title | 15px / 0.9375rem | 600 | text-primary |
| Body | 14px / 0.875rem | 400 | text-secondary |
| Caption / label | 12px / 0.75rem | 500 | text-tertiary |
| Overline (uppercase labels) | 11px / 0.6875rem | 500 | text-tertiary, `letterSpacing: 0.08em` |
| Monospace (dates, IDs) | 13px / 0.8125rem | 400 | text-secondary, font-mono |

---

## Spacing

Uses an 4px base unit. Standard values:

| Token | px | rem | Usage |
|-------|----|-----|-------|
| xs | 4 | 0.25rem | Icon gaps |
| sm | 8 | 0.5rem | Tight padding |
| md | 12 | 0.75rem | Nav item padding |
| lg | 16 | 1rem | Card padding (compact) |
| xl | 20 | 1.25rem | Card padding (default) |
| 2xl | 24 | 1.5rem | Section padding |

---

## Border Radius

| Name | px | Usage |
|------|----|-------|
| sm | 8px | Buttons, badges, inputs |
| md | 10px | Small cards |
| lg | 12px | Cards, panels, glass surfaces |
| xl | 16px | Modals, dialogs |
| full | 999px | Badges, avatars |

---

## Interactive Components

### Primary Button
```
background: #818cf8
hover: rgba(129,140,248,0.80)
text: white, 14px, weight 500
padding: 10px 16px
borderRadius: 8px
```

### Ghost / Cancel Button
```
background: transparent
hover: rgba(255,255,255,0.05)
text: rgba(255,255,255,0.55), hover rgba(255,255,255,0.80)
padding: 10px 16px
borderRadius: 8px
```

### Danger Button
```
background: transparent
hover: rgba(248,113,113,0.08)
text: rgba(248,113,113,0.75), hover #f87171
```

### Text Input / Select
```
background: rgba(255,255,255,0.06)
border: 1px solid rgba(255,255,255,0.10)
focus border: rgba(129,140,248,0.60)
focus ring: rgba(129,140,248,0.15), 2px
text: rgba(255,255,255,0.90)
placeholder: rgba(255,255,255,0.28)
borderRadius: 8px
padding: 10px 14px
fontSize: 14px
```

### Status Badges
```
Confirmed / Active:   bg rgba(52,211,153,0.12)  text #34d399
Tentative / Warning:  bg rgba(251,191,36,0.12)  text #fbbf24
Cancelled / Danger:   bg rgba(248,113,113,0.12) text #f87171
```

### Nav Item (sidebar)
```
Active:   bg rgba(129,140,248,0.10)  text #818cf8
Inactive: text rgba(255,255,255,0.50), hover rgba(255,255,255,0.80)
          hover bg rgba(255,255,255,0.05)
iconActive: #818cf8
iconInactive: rgba(255,255,255,0.35), hover rgba(255,255,255,0.60)
padding: 10px 12px
borderRadius: 8px
```

### Table
```
wrapper: glass (rgba(255,255,255,0.04) + blur)
thead bg: rgba(255,255,255,0.03)
th text: rgba(255,255,255,0.35), uppercase, 11px, letterSpacing 0.08em
row divider: rgba(255,255,255,0.05)
row hover: rgba(255,255,255,0.03)
td text primary: rgba(255,255,255,0.80)
td text secondary: rgba(255,255,255,0.50)
```

### Tab Bar
```
container border: rgba(255,255,255,0.10)
active: border-bottom 2px #818cf8, text #818cf8
inactive: text rgba(255,255,255,0.40)
inactive hover: text rgba(255,255,255,0.65), border rgba(255,255,255,0.20)
```

---

## App Background

```
base color: #06090f
gradient:
  radial-gradient(ellipse 140% 60% at 50% -10%, rgba(99,102,241,0.09), transparent)
  radial-gradient(ellipse 60% 30% at 85% 110%, rgba(129,140,248,0.04), transparent)
```

> **Expo note:** Use `LinearGradient` or `RadialGradient` from `expo-linear-gradient`. For a simpler approach, use `#06090f` solid with a subtle `#818cf8/0.06` overlay at the top.

---

## Shadows

Dark glass UIs use colored glow instead of gray shadows:

```
card glow on hover: 0 8px 32px rgba(99,102,241,0.12)
modal shadow:       0 24px 64px rgba(0,0,0,0.60)
sidebar shadow:     0 0 40px rgba(0,0,0,0.50)
```

---

## Expo / React Native Mapping

| Web (Tailwind) | React Native |
|----------------|--------------|
| `glass` class | `StyleSheet` with `backgroundColor: 'rgba(255,255,255,0.04)'` + `BlurView` |
| `glass-modal` | `backgroundColor: 'rgba(6,9,15,0.88)'` + `BlurView intensity={40}` |
| `backdrop-blur-*` | `<BlurView intensity={24} tint="dark">` from `expo-blur` |
| `text-white/90` | `color: 'rgba(255,255,255,0.90)'` |
| `border-white/8` | `borderColor: 'rgba(255,255,255,0.08)'` |
| `bg-domu-primary/10` | `backgroundColor: 'rgba(129,140,248,0.10)'` |
| `rounded-xl` | `borderRadius: 12` |
| `rounded-2xl` | `borderRadius: 16` |
| `divide-y divide-white/5` | `borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)'` on each row |

---

## Scrollbars (web only)

```css
width: 5px
track: transparent
thumb: rgba(255,255,255,0.10), hover rgba(255,255,255,0.20)
borderRadius: 99px
```
