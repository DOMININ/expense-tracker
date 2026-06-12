import type { Category } from "../model/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-colors hover:bg-accent">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: `${category.color}22` }}
        aria-hidden
      >
        {category.icon}
      </span>
      <span className="min-w-0 truncate font-semibold">{category.name}</span>
    </div>
  );
}
