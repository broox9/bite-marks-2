import { Account, Client, TablesDB } from "node-appwrite";
import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";

export const APPWRITE_ENDPOINT = publicEnv.PUBLIC_APPWRITE_ENDPOINT!;
export const APPWRITE_PROJECT_ID = privateEnv.APPWRITE_PROJECT_ID!;
// console.log('[bs] APPWRITE_ENDPOINT', APPWRITE_ENDPOINT);
// console.log('[bs] APPWRITE_PROJECT_ID', APPWRITE_PROJECT_ID);
// console.log('[bs] privateEnv.APPWRITE_API_KEY', privateEnv.APPWRITE_API_KEY);
// console.log('[bs] publicEnv.PUBLIC_APPWRITE_ENDPOINT', publicEnv.PUBLIC_APPWRITE_ENDPOINT);

export const DATABASE_ID = "bite_marks";
export const COLLECTIONS = {
  userPlaces: "places_user",
  masterPlaces: "66b02cb3001e8f0fa113",
  tags: "tags",
} as const;

export function createAdminClient() {
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  client.setKey(privateEnv.APPWRITE_API_KEY!);
  return client;
}

export function createSessionClient(sessionSecret: string) {
  // Appwrite session secret is stored in cookie `a_session_${APPWRITE_PROJECT_ID}` by our login action.
  return new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setSession(sessionSecret ?? "");
}

export function createSessionAccount(sessionSecret: string) {
  return new Account(createSessionClient(sessionSecret));
}

export function createSessionTablesDB(sessionSecret: string) {
  return new TablesDB(createSessionClient(sessionSecret));
}

export function createAdminTablesDB() {
  return new TablesDB(createAdminClient());
}

export function createAdminAccount() {
  return new Account(createAdminClient());
}

export function getSessionCookieName() {
  return `a_session_${APPWRITE_PROJECT_ID}`;
}

// NOTE: This re-export is kept for compatibility with existing adapter code.
export { Query, ID, Permission, Role } from "appwrite";
