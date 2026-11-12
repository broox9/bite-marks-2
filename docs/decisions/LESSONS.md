# Lessons

Each lesson says what we learned, where it came from, and its guard: the test, lint rule, CI rule or `AGENTS.md` line that stops us repeating the mistake. A lesson without a guard is unfinished. Strike through lessons that turn out to be wrong and say why; do not delete them.

| # | Lesson | Source | Guard |
|---|---|---|---|
| L1 | Normalise a Google place payload exactly once. The save path trimmed `place_types` in the browser and again on the server, so saved places lost four types instead of two. | `docs/SERVER-LAYER-SPEC.md` §6, Q8 | None yet. Needs a test that saving an already-normalised place leaves `place_types` unchanged. |
| L2 | Every endpoint that spends money or touches user data needs auth from the first commit. `POST /agent` shipped without it. | `docs/SERVER-LAYER-SPEC.md` Q1; reportedly closed in `89685b5` | None yet. Needs an authz test that an anonymous call to each server route is rejected. Confirm `89685b5` before closing. |
