# Decisions, hypotheses and notebooks

Bite Marks runs two loops. This folder is where both loops leave their record.

- **Explore** (Linear label `Explore`): the right answer is not known yet. The work is a hypothesis. Agents prototype on `explore/*` branches and write down what they learn in a notebook. Brookes decides whether to pursue, revise or stop.
- **Deliver** (Linear label `Deliver`): the answer is known and can be checked. Either an accepted decision exists, or the change is mechanical. Delivery code merges to `main` through enforced checks.

## The three records

| Record                             | Path                                    | Who writes it                                                | When                                                        |
| ---------------------------------- | --------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| Notebook                           | `hypotheses/<ISSUE>-<slug>/notebook.md` | Agents append; Brookes adds observations                     | Every experiment on an `Explore` issue                      |
| Hypothesis decision record (HDR)   | `hypotheses/<ISSUE>-<slug>/decision.md` | Agents may draft it as `open`; only Brookes sets the outcome | When an `Explore` issue is decided, and again at check-back |
| Architecture decision record (ADR) | `adr/NNNN-<slug>.md`                    | Whoever proposes the change; Brookes accepts                 | Any change to architecture (see below)                      |

**Notebook.** An append-only log, one entry per experiment or candidate. Each entry says what was tried, on which branch, what happened, what surprised us, and every assumption that had to be guessed. The guesses matter most: they are the ambiguity hiding in the ticket. Never rewrite an earlier entry; add a new one that corrects it. Rejected candidates stay in the notebook with the reason they lost.

**HDR.** Records the decision on a hypothesis: `pursue`, `revise` or `stop`. A `pursue` decision must name the signal that would show we were wrong and a check-back date. At check-back, the verdict is filled in: `confirmed`, `refuted` or `unclear`. A `revise` or `stop` decision is just as valuable as a `pursue`.

**ADR.** Records an architectural choice and the options rejected. A hypothesis can produce ADRs (for example, the datastore spike), and the ADR links back to the HDR and notebook for its evidence. Accepted ADRs are never edited to change their meaning; a new ADR supersedes them.

## When an ADR is required

A pull request needs an ADR when it changes any of these paths, or when its Linear issue has the `ADR required` label:

- `src/convex/schema.ts`, `src/convex/auth.ts`, `src/convex/auth.config.ts`, `src/convex/authHelpers.ts`, `src/convex/http.ts`, `src/convex/convex.config.ts`
- `src/hooks.server.ts`
- `src/lib/ports/`, `src/lib/glue/`
- `wrangler.jsonc`, `convex.json`, `svelte.config.js`

The PR satisfies the rule by adding or changing a file in `adr/`, or by citing an existing accepted ADR in its description (for example `ADR-0002`) when the change follows a decision already made.

## What CI enforces

`.github/scripts/check-decision-records.mjs` runs on every pull request:

1. Every ADR, HDR and notebook has valid frontmatter.
2. An `explore/*` branch can never merge into `main`. Prototypes are evidence, not delivery.
3. If the branch's issue (or a `Hypothesis: BRO-123` line in the PR description) has a hypothesis folder, its `decision.md` must have status `pursue`, a `signal` and a `check_back` date.
4. A PR that touches the architecture paths above must add or change an ADR, or cite an accepted one.

It also prints a warning (not a failure) for any `pursue` decision whose check-back date has passed with no verdict.

## Lessons

`LESSONS.md` lists what we have learned that should change future work. A lesson is only finished when it has a guard: a test, a lint rule, a CI rule or a line in `AGENTS.md`. Lessons that turn out to be wrong are struck through with the reason, not deleted.

## Workflow in one line

Linear `Explore` issue → `explore/*` branches + notebook entries → comparison entry → Brookes writes the HDR → `Deliver` issue with `Hypothesis: BRO-123` → PR passes checks → release → check-back verdict → lessons.
