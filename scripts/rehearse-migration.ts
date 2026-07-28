/**
 * Rehearse Appwrite → Convex migration against the DEV deployment.
 *
 * Prerequisites:
 *   1. Run `npx tsx scripts/export-appwrite.ts`
 *   2. `npx convex dev` targeting the dev deployment
 *
 * Usage:
 *   npx tsx scripts/rehearse-migration.ts
 */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const outDir = resolve(process.cwd(), ".tmp/migration");

function readJsonl(path: string): any[] {
  const text = readFileSync(path, "utf8");
  return text
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean)
    .map((l: string) => JSON.parse(l));
}

function convexRun(fn: string, args: unknown) {
  const argsJson = JSON.stringify(args);
  console.log(`[rehearse] npx convex run ${fn} …`);
  const result = execFileSync(
    "npx",
    ["convex", "run", fn, argsJson],
    { encoding: "utf8", cwd: process.cwd(), maxBuffer: 64 * 1024 * 1024 }
  );
  console.log(result.trim());
  try {
    return JSON.parse(result.trim());
  } catch {
    return result.trim();
  }
}

function unwrapPlaceId(place_id: unknown): string {
  if (typeof place_id === "string") return place_id;
  if (Array.isArray(place_id) && place_id[0]) {
    const first = place_id[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      return String((first as any).place_id ?? (first as any).$id ?? "");
    }
  }
  if (place_id && typeof place_id === "object") {
    return String((place_id as any).place_id ?? (place_id as any).$id ?? "");
  }
  return "";
}

async function main() {
  const files = await readdir(outDir).catch(() => []);
  if (!files.includes("users.jsonl") || !files.includes("places.jsonl")) {
    console.error("Missing export files. Run: npx tsx scripts/export-appwrite.ts");
    process.exit(1);
  }

  const users = readJsonl(resolve(outDir, "users.jsonl"));
  const identities = readJsonl(resolve(outDir, "identities.jsonl"));
  const places = readJsonl(resolve(outDir, "places.jsonl"));
  const spots = readJsonl(resolve(outDir, "spots.jsonl"));
  const tags = readJsonl(resolve(outDir, "tags.jsonl"));

  const googleByUser = new Map<string, string>();
  for (const identity of identities) {
    const provider = String(identity.provider ?? identity.providerType ?? "").toLowerCase();
    if (provider.includes("google")) {
      const uid = identity.userId ?? identity.user_id;
      const providerUid = identity.providerUid ?? identity.provider_uid ?? identity.id;
      if (uid && providerUid) googleByUser.set(String(uid), String(providerUid));
    }
  }

  const userPayload = users.map((u) => ({
    legacyUserId: u.$id,
    email: u.email,
    name: u.name || u.email?.split("@")[0] || "User",
    emailVerified: Boolean(u.emailVerification),
    createdAt: u.registration ? Date.parse(u.registration) || Date.now() : Date.now(),
    googleAccountId: googleByUser.get(u.$id),
  }));

  console.log(`[rehearse] importing ${userPayload.length} users…`);
  const mapping = convexRun("migrations:importUsers", { users: userPayload }) as Record<
    string,
    string
  >;

  const placePayload = places.map((p) => ({
    placeId: String(p.place_id ?? p.$id),
    name: String(p.name ?? ""),
    address: String(p.address ?? ""),
    rating: typeof p.rating === "number" ? p.rating : undefined,
    websiteURI: p.websiteURI ?? null,
    priceLevel: String(p.price_level ?? "free"),
    lat: Number(p.lat ?? 0),
    lng: Number(p.lng ?? 0),
    photos: Array.isArray(p.photos) ? p.photos : [],
    neighborhood: String(p.neighborhood ?? ""),
    areas: Array.isArray(p.areas) ? p.areas.map(String) : [],
    placeTypes: Array.isArray(p.place_types) ? p.place_types.map(String) : [],
    primaryType: p.primaryType ? String(p.primaryType) : undefined,
  }));

  // Chunk places to stay under transaction limits
  const PLACE_CHUNK = 50;
  for (let i = 0; i < placePayload.length; i += PLACE_CHUNK) {
    const chunk = placePayload.slice(i, i + PLACE_CHUNK);
    console.log(`[rehearse] importing places ${i + 1}–${i + chunk.length}…`);
    convexRun("migrations:importPlaces", { places: chunk });
  }

  const spotPayload = spots
    .map((s) => {
      const legacyUserId = String(s.user_id ?? "");
      const userId = mapping[legacyUserId];
      const placeId = unwrapPlaceId(s.place_id);
      if (!userId || !placeId) return null;
      return {
        legacyUserId,
        userId,
        placeId,
        name: s.name ?? null,
        personalRating: s.personal_rating ?? null,
        personalNotes: s.personal_notes ?? null,
        isVisited: Boolean(s.is_visited),
        socialLinks: Array.isArray(s.social_links) ? s.social_links.map(String) : [],
      };
    })
    .filter(Boolean);

  const SPOT_CHUNK = 50;
  for (let i = 0; i < spotPayload.length; i += SPOT_CHUNK) {
    const chunk = spotPayload.slice(i, i + SPOT_CHUNK);
    console.log(`[rehearse] importing spots ${i + 1}–${i + chunk.length}…`);
    convexRun("migrations:importSpots", { spots: chunk });
  }

  const tagPayload = tags
    .map((t) => {
      const legacyUserId = String(t.userId ?? t.user_id ?? "");
      const userId = mapping[legacyUserId];
      if (!userId) return null;
      return { userId, tagName: String(t.tagName ?? t.name ?? "") };
    })
    .filter(Boolean);

  if (tagPayload.length) {
    console.log(`[rehearse] importing ${tagPayload.length} tags…`);
    convexRun("migrations:importTags", { tags: tagPayload });
  }

  console.log("[rehearse] verifying…");
  convexRun("migrations:verifyMigration", {});
  console.log("[rehearse] done. Sign in locally and check /list.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
