import { apiGet } from "@/shared/api/client";
import type { Category } from "../model/types";

export function getCategories(token: string | null): Promise<Category[]> {
  return apiGet<Category[]>("/categories", token);
}
