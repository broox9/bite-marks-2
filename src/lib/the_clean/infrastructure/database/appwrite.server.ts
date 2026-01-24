// Legacy (the_clean) server helpers.
// Kept as a stable import path while the codebase migrates.
export {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  DATABASE_ID,
  COLLECTIONS,
  createAdminClient,
  createSessionClient,
  createSessionAccount,
  createSessionTablesDB,
  createAdminTablesDB,
  createAdminAccount,
  Query,
  ID,
  Permission,
  Role,
} from "$lib/adapters/secondary/appwrite/server-client.server";
