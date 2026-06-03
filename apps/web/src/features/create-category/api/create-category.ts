import { apiPost } from "@/shared/api/client";
import type { Category } from "@/entities/category";

export interface CreateCategoryPayload {
  name: string;
  color: string;
  icon: string;
}

export function createCategory(
  token: string | null,
  payload: CreateCategoryPayload,
): Promise<Category> {
  return apiPost<Category>("/categories", payload, token);
}
