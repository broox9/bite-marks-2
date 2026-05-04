---
name: Bite Marks
description: Urban, minimalist food discovery and saved-spots product with light street-level texture.
colors:
  burnt-orange: "oklch(0.63 0.21 52)"
  burnt-orange-hover: "oklch(from var(--cta-primary) calc(l + 0.06) calc(c + 0.02) h)"
  burnt-orange-active: "oklch(from var(--cta-primary) calc(l - 0.09) calc(c + 0.02) h)"
  peach-wash: "oklch(from var(--cta-primary) 0.94 calc(c * 0.18) h)"
  cool-indigo: "oklch(0.50 0.16 265)"
  map-mint: "oklch(0.6892 0.1425 166.1212)"
  signal-blue: "oklch(0.66 0.15 235)"
  success-green: "oklch(0.70 0.17 148)"
  warning-amber: "oklch(0.76 0.17 78)"
  error-crimson: "oklch(0.62 0.20 24)"
  city-paper: "oklch(1 0.0134 267.1)"
  paper-raised: "oklch(0.9762 0.0134 267.1)"
  concrete-line: "oklch(0.9262 0.0134 267.1)"
  muted-ink: "oklch(0.667 0.0134 267.1)"
  asphalt-ink: "oklch(0.297 0.0134 267.1)"
typography:
  display:
    fontFamily: "system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
  headline:
    fontFamily: "system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0"
  title:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "0"
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0"
rounded:
  sm: "6px"
  md: "12px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.burnt-orange}"
    textColor: "{colors.paper-raised}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    height: "40px"
  button-quiet:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.asphalt-ink}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    height: "40px"
  input-search:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.asphalt-ink}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    height: "40px"
  floating-action:
    backgroundColor: "{colors.map-mint}"
    textColor: "{colors.paper-raised}"
    rounded: "{rounded.circle}"
    width: "42px"
    height: "42px"
  card-surface:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.asphalt-ink}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: Bite Marks

## 1. Overview

**Creative North Star: "The City Pocketbook"**

Bite Marks should feel like a compact city notebook for food discovery: practical, fast to scan, and lightly marked by the texture of streets, maps, receipts, and saved places. The system is product-first. It supports search, save, tag, map, and revisit workflows without behaving like a landing page.

The current code already points toward this: warm orange action color, mint map/action accents, cool tinted neutrals, system UI typography, rounded controls, compact spacing, and mobile-first map/list surfaces. The next layer should add urban texture through restrained material cues such as fine grain, map-line rhythm, receipt-like dividers, or inked labels. Texture must never reduce readability.

It explicitly rejects the PRODUCT.md anti-references: "marketing landing page", "lifestyle blog", "generic SaaS dashboard", "glossy restaurant reservation platform", "oversized hero sections", "cream-and-purple startup styling", "heavy cards everywhere", "cute food illustrations as the main identity", and "decorative texture that gets in the way of scanning."

**Key Characteristics:**

- Compact mobile-first surfaces for quick outdoor or between-decision use.
- Restrained OKLCH palette with warm action, mint location, and cool concrete neutrals.
- System UI typography with clear weight contrast and no decorative font dependency.
- Tactile controls: rounded, full-border, direct, and easy to tap.
- Texture as material signal, not decoration.

## 2. Colors

The palette is restrained city paper: cool tinted neutrals carry most surfaces, burnt orange marks primary intent, and mint marks location or map-related action.

### Primary

- **Burnt Orange** (`burnt-orange`): Primary CTA color for save, submit, and decisive actions. Use sparingly so it stays useful.
- **Peach Wash** (`peach-wash`): Soft primary tint for subtle feedback, selected states, and quiet emphasis where a filled orange button would be too loud.

### Secondary

- **Map Mint** (`map-mint`): Location, mapping, and floating action color. This is the strongest product-specific accent and should not be used as generic decoration.
- **Cool Indigo** (`cool-indigo`): Secondary contrast role for future controls that need a cooler counterpoint to orange. It exists in tokens but should be introduced deliberately.

### Tertiary

- **Signal Blue** (`signal-blue`): Informational notices.
- **Success Green** (`success-green`): Positive state, mapped active state, saved state, or confirmation.
- **Warning Amber** (`warning-amber`): Cautionary but non-destructive state.
- **Error Crimson** (`error-crimson`): Destructive actions, validation errors, and delete affordances.

### Neutral

- **City Paper** (`city-paper`): Main app background.
- **Paper Raised** (`paper-raised`): Inputs, subheaders, list popovers, cards, and slightly raised surfaces.
- **Concrete Line** (`concrete-line`): Borders, dividers, low-emphasis checks, and passive icon color.
- **Muted Ink** (`muted-ink`): Secondary text and disabled-like states.
- **Asphalt Ink** (`asphalt-ink`): Primary text and high-contrast UI marks.

### Named Rules

**The Street-Signal Rule.** Orange means commit, mint means location, red means destructive. Do not swap those meanings for variety.

**The Ten Percent Accent Rule.** On a product screen, saturated colors should usually occupy less than 10% of the visible area. The surface is neutral so the next action is obvious.

## 3. Typography

**Display Font:** system-ui, sans-serif  
**Body Font:** system-ui, sans-serif  
**Label/Mono Font:** system-ui, sans-serif

**Character:** The type is utilitarian and plainspoken. It should read like a dependable local tool, not a magazine spread or a restaurant brand campaign.

### Hierarchy

- **Display** (700, `2.5rem`, line-height `1`): Rare, only for true page-level orientation. Avoid hero-scale type inside app panels.
- **Headline** (700, `2rem`, line-height `1.3`): Major section titles such as location setup, saved lists, or empty states.
- **Title** (650, `1.25rem`, line-height `1.25`): App header brand, list item names, dialog titles, and compact component headings.
- **Body** (400, `1rem`, line-height `1.5`): Default interface copy, addresses, metadata, and descriptions. Keep long text to 65-75ch.
- **Label** (600, `0.875rem`, line-height `1.25`): Button labels, field labels, compact metadata, tags, and popover captions.

### Named Rules

**The No Poster Type Rule.** This is a product, not a landing page. Oversized type is forbidden unless the screen is an empty state or first-run orientation with no competing workflow.

**The Zero Letter-Spacing Rule.** Use normal letter spacing. Do not use negative tracking; the existing percentage letter-spacing values should be treated as legacy drift and corrected as components are touched.

## 4. Elevation

The system is flat by default and uses tonal layering first: `city-paper` background, `paper-raised` controls, and `concrete-line` borders. Shadows are allowed only when the interface layer truly floats above the workflow, such as search results, dialogs, map overlays, and floating action buttons.

### Shadow Vocabulary

- **Popover Lift** (`0.25rem 0.5rem 1rem rgba(0, 0, 0, 0.1)`): Search result popovers and temporary lists.
- **Overlay Lift** (`0 0 1rem rgba(0, 0, 0, 0.2)`): Search overlay and modal-like surfaces.
- **Marker Lift** (`0 2px 8px rgba(0, 0, 0, 0.3)`): Map markers and tiny objects sitting on complex map imagery.
- **Legacy Glow** (`1px 1px 4px #bbb, 0 0 10px 10px #ddd`): Existing card glow. Do not expand this pattern; replace it with tonal layering or Popover Lift when revisiting cards.

### Named Rules

**The Flat-At-Rest Rule.** Normal app surfaces are flat. Elevation appears only for temporary, floating, or map-adjacent layers.

**The No Heavy Card Rule.** Do not solve layout with card stacks. PRODUCT.md explicitly rejects "heavy cards everywhere."

## 5. Components

### Buttons

- **Shape:** Gently curved controls using the shared radius (`12px`), with circular icon buttons where the affordance is spatial or floating.
- **Primary:** Burnt Orange background with Paper Raised text, full border, and compact horizontal padding (`10px 18px`, `40px` minimum height).
- **Hover / Focus:** Use border and focus-ring shifts, not layout movement. Focus uses a 3px mint-tinted ring.
- **Secondary / Quiet:** Paper Raised background, Asphalt Ink text, Concrete Line border. Use for cancel, clear, and low-emphasis actions.
- **Icon Buttons:** Prefer lucide icons already in the project. Keep icon-only buttons square or circular with a minimum tap area of `40px`.

### Chips

- **Style:** Tags should feel like small stamped labels: pill radius, Paper Raised or Peach Wash background, Asphalt Ink text, and a Concrete Line border.
- **State:** Selected chips use Peach Wash or Map Mint tint. Do not make tags bright blue Tailwind pills.

### Cards / Containers

- **Corner Style:** Shared radius (`12px`) for real containers. Use square edges (`0`) for rows that belong to one continuous list.
- **Background:** Paper Raised for lifted panels; City Paper for flat list rows.
- **Shadow Strategy:** Use Popover Lift only for temporary popovers. Avoid Legacy Glow.
- **Border:** Use full 1px borders with Concrete Line. Side-stripe accents are forbidden.
- **Internal Padding:** Use `16px` for standard containers, `8px` for compact row rhythm, and `24px` for empty states.

### Inputs / Fields

- **Style:** Full-width controls with Paper Raised background, Concrete Line border, `12px` radius, and `40px` minimum tap area.
- **Focus:** Border shifts to Map Mint and adds a `0 0 0 3px` mint-tinted focus ring.
- **Error / Disabled:** Error uses Error Crimson. Disabled controls keep the same geometry and reduce opacity, never collapse or change layout.

### Navigation

- **Style:** Compact header with brand link, hamburger icon, and simple inline navigation. Links use the action color, but active route state should eventually become a background or underline treatment rather than a color-only cue.
- **Mobile Treatment:** Keep navigation dense and predictable. Avoid hiding core workflows behind decorative menus until route depth requires it.
- **Footer:** Treat the current footer as utility/debug territory, not a primary navigation model.

### Map And Saved-Spot Rows

- **Map:** The map is a working surface, not decoration. Markers use Map Mint with a light border so they hold against map imagery.
- **Saved Rows:** Rows should remain compact and edge-to-edge. Slide-open tools are acceptable when the action buttons are high-contrast and spatially clear.
- **Floating Search:** Use the Map Mint circular floating action button only for search/discovery entry points. Do not reuse it for unrelated actions.

## 6. Do's and Don'ts

### Do:

- **Do** preserve the current OKLCH token direction and introduce new colors as OKLCH values.
- **Do** use `city-paper`, `paper-raised`, and `concrete-line` for most of the surface.
- **Do** reserve Burnt Orange for commit actions and Map Mint for location or map actions.
- **Do** add texture through subtle material cues: grain, receipt dividers, map-line rhythm, small stamped tags, or ink-like labels.
- **Do** keep tap targets at or above `40px` for buttons, inputs, and icon controls.
- **Do** use full borders, tonal fills, or icon/label structure for emphasis.
- **Do** keep product workflows visible: search, save, tag, map, and revisit.

### Don't:

- **Don't** make it feel like a "marketing landing page."
- **Don't** make it feel like a "lifestyle blog."
- **Don't** make it feel like a "generic SaaS dashboard."
- **Don't** make it feel like a "glossy restaurant reservation platform."
- **Don't** use "oversized hero sections" inside the app shell.
- **Don't** use "cream-and-purple startup styling."
- **Don't** use "heavy cards everywhere."
- **Don't** use "cute food illustrations as the main identity."
- **Don't** add "decorative texture that gets in the way of scanning."
- **Don't** keep Tailwind-style blue utility styling on product surfaces; migrate those leftovers into the shared OKLCH system.
- **Don't** use side-stripe borders, gradient text, decorative glassmorphism, or hero-metric templates.
