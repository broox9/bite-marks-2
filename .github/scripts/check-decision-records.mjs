#!/usr/bin/env node
// Enforces the rules in docs/decisions/README.md.
// Env (all optional; without PR context only the records are validated):
//   BASE_SHA  commit to diff against (pull_request.base.sha)
//   HEAD_REF  source branch name (github.head_ref)
//   BASE_REF  target branch name (github.base_ref)
//   PR_BODY   pull request description
//   TODAY     override today's date (YYYY-MM-DD), for tests
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const DECISIONS_DIR = "docs/decisions";

// Changing any of these needs an ADR (added/changed in the PR, or an accepted one cited).
// Entries ending in "/" match everything under that folder.
export const ARCHITECTURE_PATHS = [
	"src/convex/schema.ts",
	"src/convex/auth.ts",
	"src/convex/auth.config.ts",
	"src/convex/authHelpers.ts",
	"src/convex/http.ts",
	"src/convex/convex.config.ts",
	"src/hooks.server.ts",
	"src/lib/ports/",
	"src/lib/glue/",
	"wrangler.jsonc",
	"convex.json",
	"svelte.config.js",
];

const ADR_STATUSES = ["proposed", "accepted", "rejected", "superseded", "deprecated"];
const HDR_STATUSES = ["open", "pursue", "revise", "stop", "superseded"];
const VERDICTS = ["pending", "confirmed", "refuted", "unclear"];
const ISSUE_RE = /^[A-Z]+-\d+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isDate = (v) => typeof v === "string" && DATE_RE.test(v) && !Number.isNaN(Date.parse(v));
const nonEmpty = (v) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "");

export function parseFrontmatter(text) {
	const m = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/.exec(text);
	if (!m) return { error: "missing frontmatter block (--- ... ---) at the top of the file" };
	const data = {};
	for (const raw of m[1].split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith("#")) continue;
		const i = line.indexOf(":");
		if (i < 1) return { error: `cannot parse frontmatter line: "${line}"` };
		const key = line.slice(0, i).trim();
		let value = line.slice(i + 1).trim();
		if (value === "") value = null;
		else if (value.startsWith("[") && value.endsWith("]"))
			value = value
				.slice(1, -1)
				.split(",")
				.map((s) => s.trim().replace(/^["']|["']$/g, ""))
				.filter(Boolean);
		else value = value.replace(/^["']|["']$/g, "");
		data[key] = value;
	}
	return { data };
}

export function validateAdr(fileName, fm) {
	const errors = [];
	const m = /^(\d{4})-[a-z0-9-]+\.md$/.exec(fileName);
	if (!m) return [`file name must look like NNNN-short-slug.md`];
	if (fm.id !== `ADR-${m[1]}`) errors.push(`id must be ADR-${m[1]} to match the file name (found ${fm.id ?? "nothing"})`);
	if (!nonEmpty(fm.title)) errors.push("title is required");
	if (!ADR_STATUSES.includes(fm.status)) errors.push(`status must be one of ${ADR_STATUSES.join(", ")}`);
	if (!isDate(fm.date)) errors.push("date must be YYYY-MM-DD");
	if (!nonEmpty(fm.deciders)) errors.push("deciders must list at least one person, e.g. [Brookes]");
	if (fm.status === "superseded" && !nonEmpty(fm.superseded_by)) errors.push("a superseded ADR must name superseded_by");
	return errors;
}

export function validateDecision(folderIssue, fm) {
	const errors = [];
	if (fm.issue !== folderIssue) errors.push(`issue must be ${folderIssue} to match the folder name`);
	if (!nonEmpty(fm.title)) errors.push("title is required");
	if (!HDR_STATUSES.includes(fm.status)) errors.push(`status must be one of ${HDR_STATUSES.join(", ")}`);
	const verdict = fm.verdict ?? "pending";
	if (!VERDICTS.includes(verdict)) errors.push(`verdict must be one of ${VERDICTS.join(", ")}`);
	if (fm.status && fm.status !== "open") {
		if (!isDate(fm.decided)) errors.push("decided must be a YYYY-MM-DD date once the status is not open");
		if (!nonEmpty(fm.decider)) errors.push("decider is required once the status is not open");
	}
	if (fm.status === "pursue") {
		if (!nonEmpty(fm.signal)) errors.push("a pursue decision must name the signal that would show it was wrong");
		if (!isDate(fm.check_back)) errors.push("a pursue decision must have a check_back date (YYYY-MM-DD)");
	}
	if (verdict !== "pending" && fm.status !== "pursue") errors.push("a verdict only applies to a pursue decision");
	return errors;
}

export function validateNotebook(folderIssue, fm) {
	const errors = [];
	if (fm.issue !== folderIssue) errors.push(`issue must be ${folderIssue} to match the folder name`);
	if (!nonEmpty(fm.title)) errors.push("title is required");
	if (!nonEmpty(fm.hypothesis)) errors.push("hypothesis is required");
	if (!isDate(fm.opened)) errors.push("opened must be YYYY-MM-DD");
	return errors;
}

// Reads every record under docs/decisions. Returns { adrs, hypotheses, errors }.
export function loadRecords(root = ".") {
	const base = join(root, DECISIONS_DIR);
	const out = { adrs: new Map(), hypotheses: new Map(), errors: [] };
	const read = (rel, validate) => {
		const r = parseFrontmatter(readFileSync(join(root, rel), "utf8"));
		if (r.error) {
			out.errors.push(`${rel}: ${r.error}`);
			return null;
		}
		for (const e of validate(r.data)) out.errors.push(`${rel}: ${e}`);
		return r.data;
	};

	const adrDir = join(base, "adr");
	if (existsSync(adrDir)) {
		for (const f of readdirSync(adrDir).sort()) {
			if (!f.endsWith(".md") || f === "0000-template.md") continue;
			const fm = read(`${DECISIONS_DIR}/adr/${f}`, (d) => validateAdr(f, d));
			if (fm?.id) {
				if (out.adrs.has(fm.id)) out.errors.push(`${DECISIONS_DIR}/adr/${f}: duplicate id ${fm.id}`);
				out.adrs.set(fm.id, fm);
			}
		}
	}

	const hypDir = join(base, "hypotheses");
	if (existsSync(hypDir)) {
		for (const d of readdirSync(hypDir).sort()) {
			if (d === "_template" || !statSync(join(hypDir, d)).isDirectory()) continue;
			const rel = `${DECISIONS_DIR}/hypotheses/${d}`;
			const m = /^([A-Z]+-\d+)-[a-z0-9-]+$/.exec(d);
			if (!m) {
				out.errors.push(`${rel}: folder name must look like BRO-123-short-slug`);
				continue;
			}
			const issue = m[1];
			if (out.hypotheses.has(issue)) out.errors.push(`${rel}: more than one folder for ${issue}`);
			const entry = { folder: rel, decision: null };
			if (existsSync(join(hypDir, d, "notebook.md"))) read(`${rel}/notebook.md`, (fm) => validateNotebook(issue, fm));
			else out.errors.push(`${rel}: notebook.md is missing`);
			if (existsSync(join(hypDir, d, "decision.md"))) entry.decision = read(`${rel}/decision.md`, (fm) => validateDecision(issue, fm));
			out.hypotheses.set(issue, entry);
		}
	}
	return out;
}

export const touchesArchitecture = (file) =>
	ARCHITECTURE_PATHS.some((p) => (p.endsWith("/") ? file.startsWith(p) : file === p));

const isRecordFile = (file) => file.startsWith(`${DECISIONS_DIR}/`);

// Pull request rules. Returns { errors, notes }.
export function checkPullRequest({ headRef = "", baseRef = "", prBody = "", changedFiles = [], records }) {
	const errors = [];
	const notes = [];
	const codeFiles = changedFiles.filter((f) => !isRecordFile(f));

	if (codeFiles.length === 0) {
		notes.push("Records-only change: notebooks, decisions and ADRs can merge from any branch.");
	}

	// 1. Prototypes never merge.
	if (headRef.startsWith("explore/") && baseRef === "main" && codeFiles.length > 0) {
		errors.push(
			`Branch ${headRef} is an explore branch and changes code (${codeFiles.slice(0, 3).join(", ")}${codeFiles.length > 3 ? ", ..." : ""}). ` +
				"Prototypes are evidence, not delivery: record what you learned in the notebook, then deliver from a feat/fix branch once Brookes has decided.",
		);
	}

	// 2. Delivery from a hypothesis needs a pursue decision.
	if (codeFiles.length > 0) {
		const declared = [...prBody.matchAll(/^\s*Hypothesis:\s*([A-Z]+-\d+)/gim)].map((m) => m[1].toUpperCase());
		const fromBranch = [...headRef.matchAll(/[A-Z]+-\d+/g)].map((m) => m[0]).filter((id) => records.hypotheses.has(id));
		for (const id of declared) {
			if (!records.hypotheses.has(id))
				errors.push(`The PR says "Hypothesis: ${id}" but there is no ${DECISIONS_DIR}/hypotheses/${id}-*/ folder.`);
		}
		for (const id of new Set([...declared, ...fromBranch])) {
			const h = records.hypotheses.get(id);
			if (!h) continue;
			if (!h.decision) errors.push(`${id} has a notebook but no decision.md. Delivery waits for Brookes's decision.`);
			else if (h.decision.status !== "pursue")
				errors.push(`${h.folder}/decision.md has status "${h.decision.status}". Delivery needs status "pursue".`);
		}
	}

	// 3. Architecture changes need an ADR.
	const archFiles = changedFiles.filter(touchesArchitecture);
	if (archFiles.length > 0) {
		const adrChanged = changedFiles.some((f) => /^docs\/decisions\/adr\/(?!0000-template\.md)\d{4}-[^/]+\.md$/.test(f));
		const cited = [...prBody.matchAll(/\bADR-(\d{4})\b/g)].map((m) => `ADR-${m[1]}`);
		const citedAccepted = cited.filter((id) => records.adrs.get(id)?.status === "accepted");
		for (const id of cited) {
			if (!records.adrs.has(id)) errors.push(`The PR cites ${id}, which does not exist.`);
			else if (records.adrs.get(id).status !== "accepted") notes.push(`${id} is cited but its status is "${records.adrs.get(id).status}".`);
		}
		if (!adrChanged && citedAccepted.length === 0) {
			errors.push(
				`This PR changes architecture (${archFiles.join(", ")}). Add or update an ADR in ${DECISIONS_DIR}/adr/, ` +
					"or cite the accepted ADR it follows in the PR description, e.g. ADR-0002.",
			);
		}
	}
	return { errors, notes };
}

export function overdueCheckBacks(records, today) {
	const out = [];
	for (const [id, h] of records.hypotheses) {
		const d = h.decision;
		if (d?.status === "pursue" && isDate(d.check_back) && d.check_back < today && (d.verdict ?? "pending") === "pending")
			out.push(`${id}: check-back was due ${d.check_back} and has no verdict yet (${h.folder}/decision.md).`);
	}
	return out;
}

function changedFilesSince(baseSha) {
	const out = execFileSync("git", ["diff", "--name-only", `${baseSha}...HEAD`], { encoding: "utf8" });
	return out.split("\n").map((s) => s.trim()).filter(Boolean);
}

function main() {
	const env = process.env;
	const today = env.TODAY || new Date().toISOString().slice(0, 10);
	const records = loadRecords(".");
	const errors = [...records.errors];
	const notes = [];

	if (env.BASE_SHA) {
		const pr = checkPullRequest({
			headRef: env.HEAD_REF || "",
			baseRef: env.BASE_REF || "",
			prBody: env.PR_BODY || "",
			changedFiles: changedFilesSince(env.BASE_SHA),
			records,
		});
		errors.push(...pr.errors);
		notes.push(...pr.notes);
	}

	for (const n of notes) console.log(`note: ${n}`);
	for (const w of overdueCheckBacks(records, today)) console.log(`::warning::${w}`);
	if (errors.length) {
		for (const e of errors) console.log(`::error::${e}`);
		console.log(`\n${errors.length} decision-record problem(s). See ${DECISIONS_DIR}/README.md.`);
		process.exit(1);
	}
	console.log(`Decision records OK (${records.adrs.size} ADRs, ${records.hypotheses.size} hypotheses).`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
