"use client";

import { CategoryCard } from "@/entities/category";
import { CreateCategoryDialog } from "@/features/create-category";
import { useCategories } from "../model/use-categories";

export function CategoryList() {
  const { categories, loading, error, refetch } = useCategories();

  const items = categories ?? [];

  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Категории
        </h2>
        <CreateCategoryDialog onCreated={refetch} />
      </div>

      <div className="mt-5">
        {loading && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Загрузка…
          </p>
        )}

        {!loading && error && (
          <p className="py-10 text-center text-sm text-danger">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Категорий пока нет
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
