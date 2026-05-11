import type { AuthRepository } from "$lib/ports/auth.repository";
import { OAuthProvider } from "node-appwrite";

import {
  APPWRITE_PROJECT_ID,
  createAdminAccount,
  createSessionAccount,
  ID,
} from "./server-client.server";

export class AppwriteAuthRepository implements AuthRepository {
  constructor() {}

  async login(email: string, password: string) {
    const session = await createAdminAccount().createEmailPasswordSession(email, password);
    return session;
  }
  async register(email: string, password: string) {
    const result = await createAdminAccount().create(ID.unique(), email, password);
    return result;
  }
  async logout(sessionSecret: string) {
    if (!sessionSecret) return false;
    await createSessionAccount(sessionSecret).deleteSession({ sessionId: "current" });
    return true;
  }
  async getGoogleOAuthRedirectUrl(successUrl: string, failureUrl: string) {
    return createAdminAccount().createOAuth2Token({
      provider: OAuthProvider.Google,
      success: successUrl,
      failure: failureUrl,
    });
  }
  async completeOAuthLogin(userId: string, secret: string) {
    return createAdminAccount().createSession({ userId, secret });
  }
  getCookieName() {
    return `a_session_${APPWRITE_PROJECT_ID}`;
  }
}

export const appwriteAuthRepository = new AppwriteAuthRepository();

