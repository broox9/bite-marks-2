import type { AuthRepository } from "$lib/ports/auth.repository";
import { APPWRITE_PROJECT_ID, createAdminAccount, ID } from "./server-client.server";

export class AppwriteAuthRepository implements AuthRepository {
  constructor() {}

  async login(email: string, password: string) {
    // Creating a session does not require an API key; however, this adapter is currently server-side only.
    // We use the shared server client factory to avoid leaking configuration into the browser bundle.
    const session = await createAdminAccount().createEmailPasswordSession(email, password);
    return session;
  }
  async register(email: string, password: string) {
    const result = await createAdminAccount().create(ID.unique(), email, password);
    return result;
  }
  async logout() {
    const result = await createAdminAccount().deleteSession("current");
    return !!result;
  }
  getCookieName() {
    return `a_session_${APPWRITE_PROJECT_ID}`;
  }
}

export const appwriteAuthRepository = new AppwriteAuthRepository();

