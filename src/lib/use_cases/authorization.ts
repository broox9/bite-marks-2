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
  async logout() {
    console.log("[bs] authorization::logout");
    const result = await this.#authLib.logout();
    return result;
  }
  getCookieName() {
    return this.#authLib.getCookieName();
  }
}

const authorizationUseCase = new AuthorizationUseCase(appwriteAuthRepository);
export { authorizationUseCase };

