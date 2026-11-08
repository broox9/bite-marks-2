---
id: ADR-0001
title: Record architecture decisions and hypothesis decisions in the repo
status: accepted
date: 2026-11-06
deciders: [Brookes]
related: []
supersedes:
superseded_by:
---

# ADR-0001: Record architecture decisions and hypothesis decisions in the repo

## Context

Bite Marks is built with several specialised agents. Agents start each task without the history of earlier ones, so decisions made in chat or in someone's head get remade, or quietly reversed. We are also moving from a factory-style pipeline to a design loop, where requirements are treated as hypotheses and prototypes are evidence. That only works if the evidence and the decisions survive.

## Options considered

1. **Linear only.** Easy to read and comment on, but agents working in the repo do not see it, and CI cannot enforce it.
2. **Repo only.** Agents read it with the code, it is versioned with the change it explains, and CI can enforce it. It is less pleasant to comment on.
3. **Repo for records, Linear for workflow.** Records live in `docs/decisions/`; Linear issues link to them and carry status and labels.

## Decision

Option 3. Notebooks, hypothesis decision records and ADRs live in `docs/decisions/`. Linear holds the workflow and links to the files. CI enforces the rules in `docs/decisions/README.md`.

## Consequences

- Every `Explore` issue gets a notebook. Every decided hypothesis gets an HDR.
- Architecture changes need an ADR, or a reference to an accepted one.
- `explore/*` branches never merge to `main`.
- Agents read `docs/decisions/` and `LESSONS.md` before starting work.
- Some overhead per change. We accept it because remaking decisions costs more.

## Evidence

Discussion of Rob West's "The Agentic Software Factory is the Wrong Metaphor" (Nov 2026) and the Grokbot design-loop proposal.
