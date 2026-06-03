import { apiPost } from "@/shared/api/client";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiPost<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiPost<AuthResponse>("/auth/register", payload),
};
