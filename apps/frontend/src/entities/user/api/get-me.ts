import { apiGet } from "@/shared/api/client";
import type { User } from "../model/types";

export function getMe(token: string | null): Promise<User> {
  return apiGet<User>("/auth/me", token);
}
