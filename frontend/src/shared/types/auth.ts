export type AuthResponse = {
  userId: number;
  displayName: string;
  email: string;
  accessToken: string;
};

export type AuthSession = AuthResponse;
