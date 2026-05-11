import type { AuthRepository } from "$lib/ports/auth.repository";
import { appwriteAuthRepository } from "$lib/adapters/secondary/appwrite";

export class AuthorizationUseCase implements AuthRepository {
  #authLib: AuthRepository;
  constructor(private authLib: AuthRepository) {
    this.#authLib = authLib;
  }

  async login(email: string, password: string) {
    console.log("[bs] authorization::login::email", email);
    console.log("[bs] authorization::login::password", password);
    const result = await this.#authLib.login(email, password);
    return result;
  }
  async register(email: string, password: string) {
    console.log("[bs] authorization::register::email", email);
    console.log("[bs] authorization::register::password", password);
    const result = await this.#authLib.register(email, password);
    return result;
  }
  async logout(sessionSecret: string) {
    console.log("[bs] authorization::logout");
    const result = await this.#authLib.logout(sessionSecret);
    return result;
  }
  async getGoogleOAuthRedirectUrl(successUrl: string, failureUrl: string) {
    return this.#authLib.getGoogleOAuthRedirectUrl(successUrl, failureUrl);
  }
  async completeOAuthLogin(userId: string, secret: string) {
    return this.#authLib.completeOAuthLogin(userId, secret);
  }
  getCookieName() {
    return this.#authLib.getCookieName();
  }
}

const authorizationUseCase = new AuthorizationUseCase(appwriteAuthRepository);
export { authorizationUseCase };

