Wrote DESIGN.md covering everything you need to rebuild the system around R1:

Principles — the "why" behind the layout choices (map-first, thumb-zone, etc.)
Tokens — colors (semantic + map), the rules for pairing them, pin color states
Typography — 7-step scale with px/weight/tracking and usage rules
Spacing, radii, elevation — the 5-level shadow system including the colored FAB shadow
Icons — sizing rules per context
Components — full specs for every part: header, location pill, map controls, in-view chip, pins, Search FAB (with the rationale for green over orange), filter tabs, spot card, bottom tab bar, search drawer, section cards, pills, primary button
Screen specs — exact vertical stacks for Listings, Search Drawer, and Detail
Motion — drawer curves, FAB press, reduced-motion fallbacks
Accessibility — touch targets, contrast caveats (notably: don't use the plain green on white text — use --bm-green-deep), focus, ARIA for map pins/drawer
Implementation notes — CSS variable block ready to paste, Tailwind hints, Mapbox/Google/Apple style mapping, suggested folder structure, and 5 open questions to tackle next (empty states, Add Spot flow, photos, offline, dark mode)
A handful of opinions worth flagging:

The Search FAB lives at right: 18px; bottom: calc(48% - 28px) — that math anchors it to the map↔list seam regardless of phone size.
I'm reserving orange for "you are here / primary destination" and green for "tool/action" — that's why the FAB and Save-on-detail use different colors despite both being CTAs.
The drawer uses a slight overshoot on open (cubic-bezier(.2,.7,.2,1.05)) — feels more responsive, but kill it for reduced-motion users.
