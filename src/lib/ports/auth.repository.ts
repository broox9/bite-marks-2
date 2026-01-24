export interface AuthRepository {
  login(email: string, password: string): Promise<any>;
  register(email: string, password: string): Promise<any>;
  logout(): Promise<boolean>;
  getCookieName: () => string;
}

