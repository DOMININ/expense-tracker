"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { CategoryCard } from "@/entities/category";
import { CreateCategoryDialog } from "@/features/create-category";
import { useCategories } from "../model/use-categories";

export function CategoryList() {
  const { categories, loading, error, refetch } = useCategories();

  const items = categories ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">Категории</CardTitle>
        <CreateCategoryDialog onCreated={refetch} />
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Загрузка…
          </p>
        )}

        {!loading && error && (
          <p className="py-6 text-center text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Категорий пока нет
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="divide-y">
            {items.map((category) => (
              <li key={category.id}>
                <CategoryCard category={category} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
