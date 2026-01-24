import type { Handle } from "@sveltejs/kit";
import {
  getSessionCookieName,
  createSessionAccount,
  createSessionTablesDB,
} from "$lib/adapters/secondary/appwrite/server-client.server";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionSecret = event.cookies.get(getSessionCookieName()) ?? "";

  event.locals.appwrite = {
    account: createSessionAccount(sessionSecret),
    tablesDB: createSessionTablesDB(sessionSecret),
  };

  try {
    event.locals.user = await event.locals.appwrite.account.get();
    // console.log('[bs] HOOKS::SERVER::event.locals.user', event.locals.user);
  } catch (error) {
    console.error('[bs] HOOKS::SERVER::error', error);
    event.locals.user = null;
  }

  return resolve(event);
};
