# Bite Marks — R1 Design System

A practical spec for rebuilding the mobile-web app around the R1 direction (Listings, Search Drawer, Detail). Pair this with the React reference in `variants/r1-refined.jsx` and the live preview in `Bite Marks redesigns.html`.

## Contents
1. [Principles](#1-principles)
2. [Design tokens](#2-design-tokens)
3. [Typography](#3-typography)
4. [Spacing, radii, elevation](#4-spacing-radii-elevation)
5. [Iconography](#5-iconography)
6. [Components](#6-components)
7. [Screen specs](#7-screen-specs)
8. [Motion](#8-motion)
9. [Accessibility](#9-accessibility)
10. [Implementation notes](#10-implementation-notes)

---

## 1. Principles

- **Map first.** Bite Marks is a *spatial* memory tool. Every primary screen should answer "where is this?" before "what is this?" The map gets the top ~46% of the listings view; the detail page carries a mini-map.
- **Thumb-zone primary action.** The most-used control (Search) lives in the lower-right of the map area where a thumb naturally rests on a phone. Secondary chrome (header, tab bar) stays at the edges.
- **Quiet UI, loud data.** Neutrals do 90% of the work; orange and green only appear on brand, status, and the primary action. No gradients, no decorative iconography.
- **Bite-sized cards.** List rows are 88 px tall and carry a thumbnail, name, location, rating, distance, visited dot — nothing more. Detail is where depth lives.
- **One brand color per role.** Orange = brand & primary destructive. Green = success/visited & primary positive action (Search FAB, save confirm). Star gold = ratings only.

---

## 2. Design tokens

All values match `variants/r1-refined.jsx` so you can copy them straight into CSS variables.

### Color — semantic

| Token | Hex | Role |
|---|---|---|
| `--bm-bg` | `#FFFFFF` | App background, card surface |
| `--bm-panel` | `#FAF7F1` | Subtle field/chip surface |
| `--bm-panel-2` | `#F2EDE2` | Thumbnail placeholder, deeper neutral fill |
| `--bm-line` | `#E8E2D6` | Borders, dividers, hairlines |
| `--bm-ink` | `#15140F` | Primary text, dark surfaces |
| `--bm-ink-2` | `#3A3833` | Secondary text, icon default |
| `--bm-ink-3` | `#6E6A60` | Tertiary text, captions |
| `--bm-ink-4` | `#A29C8E` | Quaternary text, disabled |
| `--bm-orange` | `#E55F1A` | Brand, active nav, primary CTA |
| `--bm-orange-soft` | `#FCEADD` | Orange backgrounds, highlights |
| `--bm-green` | `#11A36B` | Visited state, search FAB |
| `--bm-green-soft` | `#DFF4E9` | Visited pill background |
| `--bm-green-deep` | `#0E8A5B` | Green text on green-soft, AA contrast |
| `--bm-star` | `#D9A24B` | Rating glyph fill |
| `--bm-star-soft` | `#FBEFD7` | Rating pill background |

### Color — map

| Token | Hex | Use |
|---|---|---|
| `--bm-map-land` | `#F1EBDD` | Map land fill (warm neutral) |
| `--bm-map-water` | `#CFE0DC` | Water polygons |
| `--bm-map-park` | `#DCE6CE` | Parks/greenspace |
| `--bm-map-road` | `#FFFFFF` | Primary roads |
| `--bm-map-road-alt` | `#FFE9C2` | Highways (warm accent) |

### Pin colors

- **Default pin** — white fill, `--bm-line` border, ink label
- **Visited pin** — `--bm-green` fill, `--bm-green-deep` border, white label, `CheckIcon`
- **Active/selected pin** — `--bm-orange` fill, no border, white label, `StarIcon`, glow shadow `0 6px 14px rgba(229,95,26,0.4)`

### Pairing rules

- Orange-soft pairs only with orange ink. Green-soft pairs only with green-deep ink (never plain green — fails AA on light backgrounds at small sizes).
- Never put orange and green directly adjacent (they fight). Always separate them with neutral surface.
- The only place orange touches green is the live map (orange = "you are here / selected", green = saved/visited pins).

---

## 3. Typography

**Family.** `'Plus Jakarta Sans', system-ui, sans-serif`. Weights used: 500, 600, 700, 800.

**Scale.** Type sizes are *intentionally narrow* — only six steps in the whole product. Numbers are 1-line.

| Token | px | line-height | weight | tracking | Use |
|---|---|---|---|---|---|
| `display` | 22 | 1.1 | 800 | -0.5 | Detail page restaurant name |
| `title` | 17 | 1.2 | 800 | -0.3 | App brand mark |
| `body-lg` | 15 | 1.3 | 700 | 0 | List card name, search input |
| `body` | 13 | 1.4 | 600 | 0 | Filter tabs, ratings, primary CTA |
| `caption` | 12 | 1.4 | 500/600 | 0 | Location pill, card subtitle, distance |
| `micro` | 11 | 1.3 | 700 | 0 | Map chip, "10 photos" badge, status bar |
| `eyebrow` | 10–11 | 1.3 | 700–800 | +0.8 to +1.4 (uppercase) | Cuisine, "MY RATING", section labels |

**Rules**
- Tabular numerals (`font-variant-numeric: tabular-nums`) on every distance, rating, count, time.
- Eyebrows are *always* uppercase + letter-spaced + colored `--bm-ink-3`. Never use uppercase elsewhere.
- Line-height for hero name (`display`) is 1.1 — keeps two-line names tight enough that the hero card stays compact.
- Never use italic. Never use weight 400 — minimum 500.

---

## 4. Spacing, radii, elevation

### Spacing scale (px)

`2 · 4 · 6 · 8 · 10 · 12 · 14 · 18 · 22 · 24`

Stick to this. The most-used values: **18** (horizontal page gutter), **12** (vertical card padding), **6** (chip/tag gap), **10** (form gap).

### Radii

| Token | px | Use |
|---|---|---|
| `r-xs` | 2 | Status bar battery, micro chrome |
| `r-sm` | 4 | n/a in R1 |
| `r-md` | 8 | Map control buttons, status pill on detail |
| `r-lg` | 10 | Notes block, link cards, search field inside drawer |
| `r-xl` | 12 | Thumbnails, hero CTA |
| `r-2xl` | 14 | Hero card, personal-details card, search input on drawer |
| `r-3xl` | 22 | Drawer top corners |
| `r-full` | 999 | Pills, FAB, location chip, all status pips |

**Rule.** Larger surface = larger radius. A 14 px card holds 10 px sub-elements; never invert.

### Elevation

| Level | Shadow | Use |
|---|---|---|
| `e-0` | none | Flat (filter tabs, list rows) |
| `e-1` | `0 2px 6px rgba(0,0,0,0.10)` | Map controls, mini-map "Directions" pill |
| `e-2` | `0 4px 14px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)` | Floating location pill, mini-map overlay chip |
| `e-3` | `0 10px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)` | Detail hero card (overlapping hero photo) |
| `e-fab` | `0 10px 24px rgba(17,163,107,0.45), 0 2px 6px rgba(0,0,0,0.1)` | Search FAB — colored shadow ties it to the green |
| `e-drawer` | `0 -16px 40px rgba(0,0,0,0.18)` | Slide-up search drawer (shadow points up) |

**No frosted glass, no inner shadows, no gradients on shadows.** The shadow + 1 px hairline pattern carries depth.

---

## 5. Iconography

Custom SVG line icons. `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`, `fill: none` except where noted.

| Icon | Where | Size |
|---|---|---|
| `BurgerLogo` | Header brand mark | 20 |
| `SearchIcon` | FAB (22), drawer field (16), bottom nav (16) | 16–22 |
| `PinIcon` | Location pill, address line, drawer match | 12–14 |
| `StarIcon` (fill) | Ratings (active pin, hero pill, list row, rating editor) | 11–20 |
| `CheckIcon` | Visited badges, visited pin | 9–13 |
| `ChevronRight` | List row affordance, drawer match | 14–16 |
| `ArrowIcon` | Detail back button | 16 |
| `ExternalIcon` | Link cards | 11 |
| `PlusIcon` | "Add link" affordance | 12 |

**Sizing.** Icons sit at body-size minus 2 px (a 13 px row gets 11 px icons). Stars at the rating editor go up to 16 px so they're tap-targets.

---

## 6. Components

### 6.1 Header (status bar + app bar)

```
┌──────────────────────────────────────────────────┐
│ 9:41                              ●●●●  5G  🔋  │  ← status bar (system, 11px/700)
├──────────────────────────────────────────────────┤
│ 🍔 Bite Marks                              [≡]   │  ← app bar
└──────────────────────────────────────────────────┘
```
- Status bar: `padding: 8px 18px 0`. Status text `--bm-ink-2`, weight 700, 11 px.
- App bar: `padding: 10px 18px 12px`. Brand mark = `BurgerLogo` 20px + "Bite Marks" 17/800/-0.3 in `--bm-orange`.
- Menu button: 34×34 circle, `--bm-panel` bg, ink-2 glyph.
- No border on app bar — the map (or hero photo) is the first edge.

### 6.2 Location pill (floating on map)

- Position: `top: 12, left: 50%, translateX(-50%)`.
- 7×12 padding, fully rounded, white bg.
- `PinIcon` in `--bm-orange` + place name in `--bm-ink` (12/600) + `· 29 mi` in `--bm-ink-3` (12/500).
- Elevation `e-2`.

### 6.3 Map controls (top-right cluster)

- Three buttons stacked: `+`, `−`, `⌖` (locate-me).
- 34×34 white squares, radius `r-md` (8), elevation `e-1`, 6 px gap.
- "Locate me" glyph in `--bm-orange`; zoom in `--bm-ink-2`.
- Sits at `right: 12, top: 56` (clear of the location pill).

### 6.4 "Spots in view" chip

- Bottom-left of map, `left: 12, bottom: 12`.
- Black (`--bm-ink`) bg, white text, 11/600, padding `6px 10px`, fully rounded.
- Always shows count of pins currently in the visible map bounds.

### 6.5 Map pin

A label + a triangle pointer beneath it.

- Body: 3×7 padding, fully rounded, 11 px / 700 text.
- States are the only thing that changes between the three pin types — see the color table in §2.
- Pointer: 5 px triangle in the same color as the body fill.
- Width is intrinsic (label-driven), but reserve a 4-letter minimum so single-word names don't look stubby.

### 6.6 Search FAB ⭐ (the hero interaction)

```
        ┌────────────┐
   map  │      ╲     │
        │   ┌──┐ ╲   │
   ─ ─ ─│ ─ │🔍 │ ─ ╲│  ← visually centered on the map↔list boundary
        │   └──┘     │
   list │            │
```

- 56×56 circle, `--bm-green` (#11A36B) bg, white `SearchIcon` (22 px stroke).
- Position: `position: absolute; right: 18px; bottom: calc(48% - 28px);`. The `48%` is the height of the map area (46%) plus half-FAB height so the FAB straddles the seam, anchored visually to the map but reaching into the list.
- Elevation `e-fab` — colored shadow is intentional, reinforces "this is the green action."
- Touch target ≥ 44×44 ✅ (56×56). Click → opens search drawer (§6.10).

> **Why green, not orange?** Orange is reserved for the *destination state* (active map pin, primary CTA on Save). The Search FAB is a *tool*, not a destination — green keeps it from competing with the orange "you are here" pin sitting right next to it on the map.

### 6.7 Filter tabs

A row of 3 pills: `All 70`, `Visited 38`, `To try 32`.

- Container: `padding: 12px 18px 10px`, `gap: 6`, `border-bottom: 1px solid var(--bm-line)`.
- Active pill: `--bm-ink` bg, white text. Count in `rgba(255,255,255,0.6)`.
- Inactive pill: `--bm-panel` bg, `--bm-ink-2` text. Count in `--bm-ink-3`.
- Pill: 7×12 padding, fully rounded, 13/600 label + 12 count, 6 px gap.
- This row is **sticky** at `top: 0` of the list scroll container so filters stay in reach while scrolling.

### 6.8 Spot card (list row)

```
┌────────────────────────────────────────┐
│ ┌───┐  Felina Steak Jersey City        │
│ │📷✓│  Jersey City, NJ · Steak · View  │
│ └───┘  ★ 4.3   4 mi              ›    │
└────────────────────────────────────────┘
```
- Grid: `64px 1fr auto`, `gap: 12`, `padding: 12px 18px`, `border-bottom: 1px solid var(--bm-line)`.
- Thumbnail: 64×64, radius `r-xl` (12). Visited overlay = 16 px green circle with 2 px white ring at bottom-right.
- Name: 15/700, ellipsis on overflow (use `white-space:nowrap; overflow:hidden; text-overflow:ellipsis`).
- Subtitle: 12 px `--bm-ink-3`, format `{city} · {tag1} · {tag2}`.
- Meta row: 12 px line with `★ 4.3` (gold star, ink-2 label, weight 600) and distance (ink-3, tabular).
- Trailing chevron: 16 px, ink-3.
- Whole card is one tap target (no nested actions in the list).

### 6.9 Bottom tab bar

5 destinations: Spots, List, Tags, Nearby, Me.

- `padding: 8px 0 14px`, `border-top: 1px solid var(--bm-line)`, white bg.
- Each tab: column, icon 16 + label 11/600, 2 px gap.
- Active = `--bm-orange`, inactive = `--bm-ink-3`.
- The 14 px bottom padding accounts for the iOS home indicator.

### 6.10 Search drawer (slide-up modal)

```
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← scrim (rgba(20,15,10,0.42))
   ┌───────────────────────────┐
   │           ─── grab         │
   │ ┌───────────────────────┐ │
   │ │ 🔍 fel|        Cancel │ │  ← search field
   │ └───────────────────────┘ │
   │ TOP MATCHES                │
   │  📍 Felina Steak…       › │
   │  📍 Felipé Café…        › │
   │ QUICK FILTERS              │
   │  [Open now][Visited]…     │
   │ RECENT                     │
   │  ↺ Razza                   │
   └───────────────────────────┘
```

- Height: 76% of viewport. Anchored bottom, slides up.
- Top corners radius `r-3xl` (22), bottom flush. Elevation `e-drawer`.
- Grab handle: 36×4 pill in `--bm-line`, centered, 10 px below top.
- Search field: `--bm-panel` bg, `--bm-line` border, radius `r-2xl` (14), padding `12px 14px`.
  - Left `SearchIcon` 16 / `--bm-ink-2`.
  - Caret indicated with 1 px wide orange-soft block + orange foreground (this is the typing affordance in the mock).
  - Right "Cancel" link: 12/700, `--bm-orange`. Dismisses drawer.
- Section labels: 11/700 uppercase, letter-spacing 1.2, `--bm-ink-3`, 8 px below the section.
- **Top matches** rows: 40 px round-square pin icon + bold name (matched substring background `--bm-orange-soft`, color `--bm-orange`) + city subtitle + chevron. 10 px vertical padding, hairline divider.
- **Quick filters**: chip row, 6 px gap, wraps. Chip = `--bm-panel` bg, `--bm-line` border, 13/600, padding `8px 12px`, fully rounded. Selected state inverts to ink/white (same rule as filter tabs).
- **Recent**: list of 14 px ink-2 lines with `↺` glyph in ink-4, hairline divider.
- Tap scrim or hit Cancel → drawer slides down + fades scrim. ESC closes on web.

### 6.11 Section card (detail page surface)

The Personal details, Notes, Links blocks all share one surface treatment:

- `border: 1px solid var(--bm-line)`, radius `r-2xl` (14), `padding: 14`.
- Card header row: 14/700 title on the left, 11/500 ink-3 meta on the right ("edited 2d ago"), 10 px below.
- Inside cards: eyebrow (11/700 uppercase, letter-spacing 0.8, ink-3, 5 px below value) over each field.

### 6.12 Pills (status, tag, meta)

`<R1Pill bg fg>` is the workhorse:
- 4×9 padding, fully rounded, 12/600, 6 px gap between icon and label.
- Three default styles, all defined by their (bg, fg) pair:
  - **Rating pill** — `--bm-star-soft` / `--bm-ink` (with gold star inside).
  - **Visited pill** — `--bm-green-soft` / `--bm-green-deep` (with green check).
  - **Neutral pill** — `--bm-panel` / `--bm-ink-2` (for distance, links, etc.).

### 6.13 Primary button

- Height 44 px minimum (`13px 14px` vertical padding gets you there at 14/700 text).
- `--bm-orange` bg, white text, radius `r-xl` (12).
- Full-width inside the 18 px gutters, no border.
- Pressed state: scale `0.98`, no color shift (animation §8).
- *Destructive variant:* outline only — `--bm-line` border, `--bm-ink-2` text, no fill.

---

## 7. Screen specs

Viewport assumption: 390–420 px wide × 800–900 tall mobile web.

### 7.1 Listings

Vertical stack from top:
1. **Status bar** (~24 px, system-driven)
2. **App bar** (~52 px)
3. **Map area — 46% of remaining height**, containing:
   - Map background
   - Location pill (top-center)
   - Map controls (top-right)
   - Map pins (in-canvas)
   - "Spots in view" chip (bottom-left)
4. **Search FAB** — absolute, straddles map↔filter seam (right: 18, bottom: calc(48% - 28px))
5. **Filter tabs row** (~52 px, sticky)
6. **Scrolling list** — fills remaining space
7. **Bottom tab bar** (~62 px)

**Key invariant.** The FAB's vertical center sits at *48% from the bottom of the content area* — not the screen — so it always lands at the natural thumb-arc midpoint of the device's input zone, even on smaller phones where the map shrinks.

### 7.2 Search drawer

Mounted over Listings with a scrim. Structure inside the sheet:
1. Grab handle (10 px from top)
2. Search field
3. (Optional) Suggestions — "Top matches" list
4. "Quick filters" chip row
5. "Recent" list

Sheet height is fixed at 76% on open. Drag down → spring-snap to dismiss past 25% of drag.

### 7.3 Detail

Vertical stack:
1. **Status bar + app bar** (shared shell)
2. **Hero photo block** — 240 px tall full-bleed photo with:
   - Back button (36 px white circle, top-left)
   - Photo count badge (semi-opaque pill, top-right)
   - **Hero info card** — overlaps photo by 18 px at the bottom (negative `bottom: -18px`, 18 px side gutter). Contains: cuisine eyebrow, restaurant name (22/800/-0.5), address line, and a row of meta pills.
3. **Mini-map card** — 130 px tall, 12 px radius, 1 px border, 1 active pin centered, "Directions ↗" pill bottom-right (white bg, orange fg, elevation `e-1`).
4. **Personal details card** — 2-col grid (My rating, Status), then Notes block.
5. **Links card** — eyebrow + "Add" affordance, 2-col grid of bordered mini-cards `{eyebrow, value}`.
6. **Primary CTA** — full-width "Save changes" in orange.

**Spacing between cards on detail:** 14 px first gap (mini-map → personal), then 12 px between cards, ending with 16 px above the CTA and 24 px after.

---

## 8. Motion

Animation is restrained — confirm, don't decorate.

| Where | What | Curve | Duration |
|---|---|---|---|
| FAB press | Scale 1 → 0.95 → 1 | `cubic-bezier(.2,.7,.3,1)` | 120 ms down, 180 ms back |
| Drawer open | Translate Y from `100%` → `24%`, scrim fade 0 → 1 | `cubic-bezier(.2,.7,.2,1.05)` (slight overshoot) | 280 ms |
| Drawer dismiss | Translate Y back to `100%`, scrim fade out | `cubic-bezier(.4,0,.6,1)` | 220 ms |
| Drawer drag | Tracks finger 1:1; release < 25% snaps open, > 25% dismisses | spring `stiffness 280, damping 28` | — |
| Filter pill change | Bg + fg crossfade only (no movement) | `linear` | 120 ms |
| List row press | Background → `--bm-panel` | `linear` | 80 ms |
| Pin tap on map | Scale 1 → 1.06, glow shadow ramps | `cubic-bezier(.2,.7,.3,1)` | 180 ms |
| Map pan/zoom | Native map library default — don't override |

**Reduced motion.** With `prefers-reduced-motion: reduce`: kill the drawer overshoot (use plain `ease-out`), shorten everything to 120 ms, disable the pin scale.

---

## 9. Accessibility

- **Touch targets.** Every tappable element ≥ 44×44 px (FAB is 56, map controls 34 are too small — bump to 40 with invisible padding, or accept and rely on map gestures).
- **Color contrast.**
  - `--bm-ink` on white: 19:1 ✓
  - `--bm-ink-3` on white: 5.1:1 ✓ (use only for captions, not body)
  - **Don't** use `--bm-green` on white for text — fails AA at 13 px. Use `--bm-green-deep`.
  - Orange on white at 13 px passes AA (4.9:1) only for **bold** weights; keep all orange text ≥ 12/700.
- **Focus states.** 2 px `--bm-orange` outline + 2 px offset on every interactive element on keyboard focus.
- **Screen reader.**
  - Map pins: `aria-label="Felina Steak — visited, rated 4.3"`.
  - Visited dot on thumbnail: `<span class="sr-only">Visited</span>`.
  - Filter pill count: read as "All, 70 spots".
- **Form labels.** Every input — including the search field — has a programmatic label, not just placeholder.
- **Drawer.** Set `role="dialog" aria-modal="true"` on the sheet; trap focus inside; return focus to FAB on close.

---

## 10. Implementation notes

### CSS custom properties

```css
:root {
  --bm-bg: #FFFFFF;
  --bm-panel: #FAF7F1;
  --bm-panel-2: #F2EDE2;
  --bm-line: #E8E2D6;
  --bm-ink: #15140F;
  --bm-ink-2: #3A3833;
  --bm-ink-3: #6E6A60;
  --bm-ink-4: #A29C8E;
  --bm-orange: #E55F1A;
  --bm-orange-soft: #FCEADD;
  --bm-green: #11A36B;
  --bm-green-soft: #DFF4E9;
  --bm-green-deep: #0E8A5B;
  --bm-star: #D9A24B;
  --bm-star-soft: #FBEFD7;
  --bm-radius-md: 8px;
  --bm-radius-lg: 10px;
  --bm-radius-xl: 12px;
  --bm-radius-2xl: 14px;
  --bm-radius-3xl: 22px;
  --bm-gutter: 18px;
  --bm-font: 'Plus Jakarta Sans', system-ui, sans-serif;
}
```

### Tailwind config (if you use Tailwind)

Map the tokens above to `colors.bm.*`, add `borderRadius` keys for `xl`/`2xl`/`3xl`, and extend `boxShadow` with `bm-1`, `bm-2`, `bm-3`, `bm-fab`, `bm-drawer`.

### Font loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
```

Self-host in production. Subset to Latin if you don't need extended ranges.

### Map provider

R1 uses a stylized schematic map. To match it with a real provider:
- **Mapbox** — fork the "Light" style. Land `#F1EBDD`, water `#CFE0DC`, parks `#DCE6CE`, primary roads `#FFFFFF`, highways `#FFE9C2`. Hide POI labels (we use our own pins).
- **Google Maps** — use a custom style JSON with the same color map. Disable POI labels and transit.
- **Apple MapKit JS** — pass the same tokens to the colorScheme; you'll get close, with less stylistic control on roads.

Pins should be HTML overlays (not native), so the active-state pulse animation and label work consistently.

### Folder structure (suggested)

```
app/
  styles/
    tokens.css            ← the :root block above
    typography.css
  components/
    AppShell.tsx          ← status bar + app bar + slot
    Map/
      MapCanvas.tsx
      MapPin.tsx
      MapControls.tsx
      LocationPill.tsx
      InViewChip.tsx
    SearchFab.tsx
    SearchDrawer.tsx
    FilterTabs.tsx
    SpotCard.tsx
    BottomNav.tsx
    SectionCard.tsx
    Pill.tsx
    PrimaryButton.tsx
  screens/
    Listings.tsx
    SpotDetail.tsx
```

### Open questions to resolve next

1. **Empty states.** What does Listings look like with 0 saved spots? With 0 *in view*?
2. **Add Spot flow.** Where does the "+" entry live? Likely a second FAB or a `+` tab in the bottom nav.
3. **Photo upload.** The hero supports 1–N photos — define swipe/thumbnail behavior.
4. **Offline.** The map provider needs an offline strategy or the FAB needs a "saved" view that works without tiles.
5. **Dark mode.** Not specified in R1 — the warm neutrals don't directly invert; D2 in the canvas is a starting point if you want one.
