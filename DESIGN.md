# Bite Marks — R1 Design Spec

Source screenshots: `docs/redesign-05-18-2026/`

---

## Color Tokens

All tokens already live in `src/styles/colors-2.css`. The design uses them as follows:


| Role                       | Token                    | Value                        | Usage in design                                                                                                                    |
| -------------------------- | ------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Primary CTA / brand orange | `--cta-primary`          | `oklch(0.63 0.21 52)`        | Logo text, active bottom-nav icon, "Save changes" button bg, star icons, eyebrow text, matched search text highlight, "+ Add" link |
| CTA hover                  | `--cta-primary-hover`    | relative oklch               | Button hover state                                                                                                                 |
| CTA tint (pale peach)      | `--cta-primary-tint-2`   | relative oklch               | Unvisited/orange map marker bg                                                                                                     |
| Success green              | `--success`              | `oklch(0.70 0.17 148)`       | "Visited" map marker bg, "Au Cheval"/"Blu" map labels, visited status chip border/text                                             |
| Success tint               | `--success-tint`         | relative oklch               | Visited status chip background                                                                                                     |
| Background (white)         | `--bg-color`             | `oklch(1 0.0134 267.1)`      | Page bg, card bg                                                                                                                   |
| Surface (off-white)        | `--bg-light`             | `oklch(0.9762 0.0134 267.1)` | List item hover bg, drawer bg, input bg                                                                                            |
| Low-contrast border        | `--bg-low-contrast`      | `oklch(0.9262 0.0134 267.1)` | Dividers, input borders, filter chip borders                                                                                       |
| Muted text                 | `--bg-medium-contrast`   | `oklch(0.667 0.0134 267.1)`  | Cuisine/tag subtitle text, distance text, section eyebrows, search recent icons                                                    |
| Body text                  | `--bg-high-contrast`     | `oklch(0.297 0.0134 267.1)`  | Spot names, address, all primary text                                                                                              |
| Warning tint               | `--warning-tint`         | relative oklch               | Google rating chip background                                                                                                      |
| Warning text               | derived from `--warning` |                              | Google rating chip text/border                                                                                                     |


### Button color rules


| Button                           | Background                        | Border               | Text                   | Hover                 |
| -------------------------------- | --------------------------------- | -------------------- | ---------------------- | --------------------- |
| Primary / Save changes           | `--cta-primary`                   | `--cta-primary`      | white (`--bg-light`)   | `--cta-primary-hover` |
| Ghost / filter chip (unselected) | transparent                       | `--bg-low-contrast`  | `--bg-high-contrast`   | `--bg-light` bg       |
| Segmented — selected             | `--bg-high-contrast` (near-black) | `--bg-high-contrast` | white (`--bg-light`)   | —                     |
| Segmented — unselected           | transparent                       | `--bg-low-contrast`  | `--bg-medium-contrast` | `--bg-light`          |
| Cancel (search drawer)           | transparent                       | none                 | `--cta-primary`        | —                     |
| "+ Add" link-style               | transparent                       | none                 | `--cta-primary`        | —                     |
| Icon (hamburger menu)            | transparent                       | `--bg-low-contrast`  | `--bg-high-contrast`   | `--bg-light`          |


---

## Typography

No font changes from current setup. Specific size/weight callouts from the screens:


| Element                         | Size        | Weight | Color                  | Notes                                         |
| ------------------------------- | ----------- | ------ | ---------------------- | --------------------------------------------- |
| App name "Bite Marks"           | `1.25rem`   | `700`  | `--cta-primary`        | Already set in layout                         |
| Eyebrow (cuisine · city)        | `0.6875rem` | `700`  | `--cta-primary`        | ALL CAPS, letter-spacing ~0.08em              |
| Spot name (detail h1)           | `1.5rem`    | `750`  | `--bg-high-contrast`   | Tighter line-height ~1.1                      |
| Spot name (list item)           | `1rem`      | `700`  | `--bg-high-contrast`   | —                                             |
| Subtitle (city · cuisine · tag) | `0.8125rem` | `400`  | `--bg-medium-contrast` | Dot-separated                                 |
| Distance chip                   | `0.8125rem` | `400`  | `--bg-medium-contrast` | Inline after subtitle                         |
| Section label (MY RATING etc.)  | `0.6875rem` | `700`  | `--bg-medium-contrast` | ALL CAPS, letter-spacing 0.06em               |
| "edited 2d ago"                 | `0.75rem`   | `400`  | `--bg-medium-contrast` | Right-aligned in section header               |
| Search section header           | `0.6875rem` | `700`  | `--bg-medium-contrast` | ALL CAPS, e.g. "TOP MATCHES", "QUICK FILTERS" |


---

## Layout — Global (`+layout.svelte`)

### Header

Current: Hamburger icon + "Bite Marks" text, hamburger nav links on right.  
Target:

- Left: brand emoji 🍔 + "**Bite Marks**" in `--cta-primary` (orange). The logo glyph is a fork/bite icon, use the existing emoji or swap to a custom SVG when available.
- Right: hamburger/menu icon button — ghost style, `--bg-low-contrast` border, `--bg-high-contrast` icon.
- Remove the sub-header location bar from inside the header. It moves to a **location pill** that overlays the top of the map.

### Location pill (new element, overlays map)

- Position: absolute, top of the map section, horizontally centered.
- Style: `--bg-color` background, `--bg-low-contrast` border, `border-radius: 999px`, `padding: 0.375rem 0.875rem`.
- Content: location pin icon (muted) + city name + `·` + distance. All `--bg-medium-contrast`.
- File: add inside `src/routes/list/+page.svelte` `#map-container`.

### Bottom navigation bar (new component)

Replace the current `<footer>` with a proper bottom nav.  
Create `src/components/BottomNav.svelte`:

```
[ 🍽 Spots ]  [ ≡ List ]  [ # Tags ]  [ ⊕ Nearby ]  [ ★ Me ]
```

- Full-width, fixed to bottom, `--bg-color` bg, top border `1px solid --bg-low-contrast`.
- Height: `3.5rem` + safe area inset (`padding-bottom: env(safe-area-inset-bottom)`).
- Each tab: icon + label below, stacked vertically, centered.
- Active tab: icon and label color = `--cta-primary`.
- Inactive tab: icon and label color = `--bg-medium-contrast`.
- No background highlight on active tab — color change only.
- Wire into `+layout.svelte`, replacing `<footer>`.

---

## Map (`#map-container` in `src/routes/list/+page.svelte`)

### Map markers (`.bite-marker-pin` global style)

Current: filled circle.  
Target: speech-bubble/label pill style — name visible on marker.


| Marker type        | Background           | Text  | Border    |
| ------------------ | -------------------- | ----- | --------- |
| Visited spot       | `--success`          | white | white 2px |
| To-try / unvisited | `--cta-primary`      | white | white 2px |
| Selected / active  | `--bg-high-contrast` | white | white 2px |


- Shape: `border-radius: 999px`, `padding: 0.25rem 0.625rem`, `font-size: 0.75rem`, `font-weight: 700`.
- Add a small downward triangle pointer (CSS `::after` pseudo-element or SVG).
- Remove the separate `.bite-marker-popup` — text is now on the marker itself.

### "N spots in view" chip (new)

- Position: absolute, bottom-left of map container.
- Style: `--bg-high-contrast` bg, white text, `border-radius: 999px`, `font-size: 0.8125rem`, `font-weight: 700`, `padding: 0.25rem 0.75rem`.

### Floating search button (FAB)

Current: bottom-right of page, fixed.  
Target: bottom-right of the **map container** itself (not page-fixed).

- Background: `--success` (green). This contrasts with the orange brand.
- Icon: `Search` (magnifying glass), white.
- Size: `3rem` diameter, `border-radius: 50%`.
- Position: `position: absolute; bottom: 0.75rem; right: 0.75rem;`

---

## Listings / Spots List (`src/routes/list/+page.svelte`)

### Filter tabs (`SegmentedControl.svelte`)

Current: 3 options — All, Visited, Unvisited.  
Target: 3 options — **All 70**, **Visited 38**, **To try 32** (counts appended to labels).

Selected pill style:

- `background-color: var(--bg-high-contrast)` (near-black)
- `color: var(--bg-light)` (white)
- `border-radius: 999px`
- `font-weight: 700`

Unselected pill style:

- `background-color: transparent`
- `color: var(--bg-medium-contrast)`
- `border: 1px solid var(--bg-low-contrast)`

Container: `display: flex; gap: 0.375rem;` — no shared border/group, each pill is independent.  
Update `src/components/ui/SegmentedControl.svelte` to support this pill style.

### `#spots-list-header`

- Remove the `spot-count` badge (count is now inside the filter tabs).
- The `#shrink-map-button` drag handle stays.
- Sticky header remains.

### `ResultListItem.svelte`

Current: swipe-reveal tool buttons (delete, map).  
Target: clean chevron-right list row. Remove the swipe/tool reveal pattern entirely.

New row layout:

```
[ name (bold) ]                              [ › ]
[ City, ST · Cuisine · Tag  ★ 4.3  12 mi ]
```

- Remove `.tool-buttons`, `.tools-toggle`, `isToolsOpen` state, `Settings2` icon.
- The `›` chevron: `ChevronRight` lucide icon, `--bg-medium-contrast`, `flex: 0 0 auto`.
- The entire row is a link to `/spot/${item.id}` (wrap in `<a>` instead of having a nested `<a>`).
- Star icon: `Star` lucide, `fill: var(--cta-primary)`, `color: var(--cta-primary)`, `size={13}`.
- Rating + distance: after the subtitle text, `--bg-medium-contrast`, `font-size: 0.8125rem`.

Visited indicator: replace the `visited-check` span with a `✓ Visited` green chip (same `.status-chip` style as detail page) shown inline in the subtitle row, or omit from list — the filter tab already segregates them.

Row divider: `border-bottom: 1px solid var(--bg-low-contrast)`. No side borders.  
Background: `var(--bg-color)`. Hover: `var(--bg-light)`.

---

## Detail Page (`src/routes/spot/[id]/+page.svelte`)

### Hero section

**Eyebrow** (new element above `h1`):

```svelte
<p class="spot-eyebrow">{spot.types[0]} · {city}, {state}</p>
```

- `font-size: 0.6875rem`, `font-weight: 700`, `letter-spacing: 0.08em`, `text-transform: uppercase`
- `color: var(--cta-primary)` (orange)
- Derive city/state from `spot.address` (split last two comma-separated segments).

**Spot name (`h1`)**: reduce to `1.5rem` on mobile (currently `2rem`).

**Metadata row chips** (`.rating-chip`, `.status-chip`):

- Rating chip stays as-is (warning tint bg).
- Visited chip stays as-is (success tint bg). Text: "✓ Visited".
- Distance: plain text after chips, `--bg-medium-contrast`, no border/pill.

**Photo container**: aspect ratio stays `16/9`. No changes needed.

### Personal details card (`#editable-fields-section`)

**Section header** row change:

- Left: "Personal details" label (existing).
- Right: "edited 2d ago" muted timestamp (new). Pull from spot's `$updatedAt` field.
  - `font-size: 0.75rem`, `color: var(--bg-medium-contrast)`.

**MY RATING label**: change to ALL CAPS small label style (see typography table above). Show stars visually:

- Render filled `Star` icons for `floor(personalRating)`, half star if fractional, empty for remainder.
- Star color: `--cta-primary` (orange fill).
- Numeric value next to stars: `font-weight: 700`.

**STATUS field** (new, replaces the standalone visited checkbox):

- Label: "STATUS" (all-caps small label).
- Display: `✓ Visited · Jan '26` green chip (use `.status-chip` style).
- The checkbox `is-visited-label` becomes this chip — clicking it toggles visited and re-renders the chip.

**NOTES field**: stays as textarea. Label becomes "NOTES" all-caps small label.

**LINKS section** (replaces "Social links"):

- Label: "LINKS" all-caps small label.
- "+ Add" button: text-only link style, `color: var(--cta-primary)`, no border/bg.
- Existing links render as two-column grid of small pill cards:
  ```
  [ WEBSITE          ] [ MENU            ]
  [ felinajc.com     ] [ /dinner         ]
  ```
  - Each card: `border: 1px solid --bg-low-contrast`, `border-radius: --border-radius`, `padding: 0.5rem 0.75rem`.
  - Top line: uppercase label (`font-size: 0.6875rem`, `--bg-medium-contrast`).
  - Bottom line: value truncated, `font-size: 0.875rem`, `--bg-high-contrast`.
  - Tapping a card opens the URL (if it's a full URL) or does nothing if it's a path.

**Save changes button**:

- Full-width, `border-radius: 999px` (fully rounded pill — not the current `0.75rem`).
- `background-color: var(--cta-primary)`.
- `color: var(--bg-light)` (white text).
- `font-weight: 700`, `font-size: 1rem`.
- `min-height: 3rem`.
- No box-shadow (flat).
- Component: `SubmitButton.svelte` — add `border-radius: 999px` when `data-width="full"`, or add a `variant="pill"` prop.

---

## Search Drawer (new component)

Create `src/components/SearchDrawer.svelte` to replace the current `#search-container` fixed panel.

### Behavior

- Triggered by the FAB (green search button on map).
- Slides up from the bottom as a sheet — `position: fixed; bottom: 0; left: 0; right: 0;`.
- Backdrop: semi-transparent dark overlay over map (`background: oklch(0.15 0.02 267 / 0.45)`).
- Drag handle pill at top of sheet.
- Max height: `85svh`. Scrollable inside.

### Layout (top to bottom)

1. **Drag handle**: 2.5rem wide, 0.25rem tall pill, `--bg-low-contrast`, centered, `margin: 0.625rem auto`.
2. **Search input row**: `Search` icon (muted) + text input (no border, transparent bg, full-width) + "Cancel" text button (`--cta-primary`).
  - Wrap in `.ui-input-with-button` style container but with `border-radius: 999px` and `background: --bg-low-contrast`.
3. **TOP MATCHES** section (when query is non-empty):
  - Section label: ALL CAPS, `--bg-medium-contrast`, `0.6875rem`.
  - Each result row: orange location-pin icon + name (matched chars in `--cta-primary`) + city below in muted.
  - Row chevron: `ChevronRight`, `--bg-low-contrast`.
  - `border-bottom: 1px solid --bg-low-contrast`.
4. **QUICK FILTERS** section (always visible):
  - Section label: ALL CAPS.
  - Filter chips: ghost pill buttons — `border: 1px solid --bg-low-contrast`, `border-radius: 999px`, `padding: 0.375rem 0.875rem`, `font-size: 0.875rem`.
  - `★ 4.5+` chip: prepend filled Star icon.
  - Selected filter chip: `background: --bg-high-contrast`, `color: --bg-light`, no border.
5. **RECENT** section (when query is empty):
  - Section label: ALL CAPS.
  - Each row: clock/history icon (`--bg-medium-contrast`) + name. No chevron.
  - `border-bottom: 1px solid --bg-low-contrast`.

### Sheet surface

- `background: var(--bg-color)`.
- `border-radius: var(--border-radius) var(--border-radius) 0 0` (rounded top corners only).
- `box-shadow: 0 -0.5rem 2rem oklch(0.2 0.02 267 / 0.18)`.

---

## Component: `SegmentedControl.svelte`

Current: shared-border group (button-group style).  
Target: independent pill buttons with gap.

```svelte
<!-- New markup pattern -->
<div class="pill-tabs" role="tablist">
  {#each options as opt}
    <button
      role="tab"
      type="button"
      class="pill-tab"
      class:active={selected === opt.value}
      onclick={() => selected = opt.value}
    >
      {opt.label}
    </button>
  {/each}
</div>
```

```css
.pill-tabs {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}
.pill-tab {
  border: 1px solid var(--bg-low-contrast);
  border-radius: 999px;
  padding: 0.375rem 0.875rem;
  background: transparent;
  color: var(--bg-medium-contrast);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.pill-tab.active {
  background: var(--bg-high-contrast);
  border-color: var(--bg-high-contrast);
  color: var(--bg-light);
}
```

---

## Component: `SubmitButton.svelte`

Add a fully-rounded pill shape for full-width primary actions:

```css
/* In ui.css or SubmitButton.svelte <style> */
.ui-button[data-width='full'][type='submit'],
.ui-button[data-width='full'][data-variant='primary'] {
  border-radius: 999px;
}
```

---

## Existing components — no visual change needed

- `PlaceSearchTool.svelte` — internal logic unchanged, shell moves into `SearchDrawer`.
- `ResultCard.svelte` — used inside the dialog on desktop, no change.
- `Dialog.svelte` — unchanged.
- `PhotoLightbox.svelte` — unchanged.
- `Button.svelte`, `Input.svelte`, `Textarea.svelte` — unchanged.
- `MainNavLinks.svelte` — hidden on mobile (bottom nav replaces it); keep for desktop.

---

## Responsive breakpoints

All screens in the design are mobile (`375px` viewport). At `≥ 768px`:

- Bottom nav hides; `MainNavLinks` in header shows.
- Search drawer becomes the fixed side panel (current behavior).
- Map markers revert to simple dots (label pills can crowd on desktop zoom-out).
- FAB moves back to page-fixed bottom-right.

