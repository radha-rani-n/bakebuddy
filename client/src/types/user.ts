export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  session: AuthSession;
}
