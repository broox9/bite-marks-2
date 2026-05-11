export type AuthSessionPayload = { secret: string; expire: string };

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthSessionPayload>;
  register(email: string, password: string): Promise<any>;
  /** Deletes the current Appwrite session for the given session secret (server-side cookie auth). */
  logout(sessionSecret: string): Promise<boolean>;
  getGoogleOAuthRedirectUrl(successUrl: string, failureUrl: string): Promise<string>;
  completeOAuthLogin(userId: string, secret: string): Promise<AuthSessionPayload>;
  getCookieName: () => string;
}

