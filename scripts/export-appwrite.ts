/**
 * READ-ONLY export of Appwrite data for the Convex migration rehearsal.
 *
 * Usage:
 *   npx tsx scripts/export-appwrite.ts
 *
 * Writes JSONL (+ a summary JSON) under .tmp/migration/ (gitignored).
 */
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client, Databases, Users, Query } from "node-appwrite";

function loadEnvFile(path: string) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

const ENDPOINT =
  process.env.PUBLIC_APPWRITE_ENDPOINT ||
  process.env.APPWRITE_ENDPOINT ||
  "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = "bite_marks";
const COLLECTIONS = {
  userPlaces: "places_user",
  masterPlaces: "66b02cb3001e8f0fa113",
  tags: "tags",
} as const;

if (!PROJECT_ID || !API_KEY) {
  console.error("Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);
const databases = new Databases(client);
const users = new Users(client);

const outDir = resolve(process.cwd(), ".tmp/migration");

async function listAllDocuments(collectionId: string, extraQueries: string[] = []) {
  const docs: any[] = [];
  let cursor: string | undefined;
  for (;;) {
    const queries = [Query.limit(100), ...extraQueries];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const page = await databases.listDocuments(DATABASE_ID, collectionId, queries);
    docs.push(...page.documents);
    if (page.documents.length < 100) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }
  return docs;
}

async function listAllUsers() {
  const result: any[] = [];
  let offset = 0;
  for (;;) {
    const page = await users.list([Query.limit(100), Query.offset(offset)]);
    result.push(...page.users);
    if (page.users.length < 100) break;
    offset += page.users.length;
  }
  return result;
}

async function listAllIdentities() {
  const result: any[] = [];
  let cursor: string | undefined;
  for (;;) {
    const queries = [Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const page = await users.listIdentities({ queries });
    const identities = page.identities ?? [];
    result.push(...identities);
    if (identities.length < 100) break;
    cursor = identities[identities.length - 1].$id;
  }
  return result;
}

function toJsonl(rows: any[]) {
  return rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : "");
}

async function main() {
  await mkdir(outDir, { recursive: true });

  console.log("[export] listing master places…");
  const places = await listAllDocuments(COLLECTIONS.masterPlaces);
  console.log(`[export] places: ${places.length}`);

  console.log("[export] listing user spots…");
  const spots = await listAllDocuments(COLLECTIONS.userPlaces, [
    Query.select(["*", "place_id.*"]),
  ]);
  console.log(`[export] spots: ${spots.length}`);

  console.log("[export] listing tags…");
  const tags = await listAllDocuments(COLLECTIONS.tags);
  console.log(`[export] tags: ${tags.length}`);

  console.log("[export] listing users…");
  const appwriteUsers = await listAllUsers();
  console.log(`[export] users: ${appwriteUsers.length}`);

  console.log("[export] listing identities…");
  const identities = await listAllIdentities();
  console.log(`[export] identities: ${identities.length}`);

  await writeFile(resolve(outDir, "places.jsonl"), toJsonl(places));
  await writeFile(resolve(outDir, "spots.jsonl"), toJsonl(spots));
  await writeFile(resolve(outDir, "tags.jsonl"), toJsonl(tags));
  await writeFile(
    resolve(outDir, "users.jsonl"),
    toJsonl(
      appwriteUsers.map((u) => ({
        $id: u.$id,
        email: u.email,
        name: u.name,
        emailVerification: u.emailVerification,
        registration: u.registration,
        status: u.status,
      }))
    )
  );
  await writeFile(
    resolve(outDir, "identities.jsonl"),
    toJsonl(
      identities.map((identity) => ({
        $id: identity.$id,
        userId: identity.userId,
        provider: identity.provider,
        providerUid: identity.providerUid,
        providerEmail: identity.providerEmail,
        // Deliberately omit access/refresh tokens from the on-disk export.
      }))
    )
  );

  const summary = {
    exportedAt: new Date().toISOString(),
    endpoint: ENDPOINT,
    projectId: PROJECT_ID,
    counts: {
      places: places.length,
      spots: spots.length,
      tags: tags.length,
      users: appwriteUsers.length,
      identities: identities.length,
    },
  };
  await writeFile(resolve(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log("[export] wrote", outDir);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
