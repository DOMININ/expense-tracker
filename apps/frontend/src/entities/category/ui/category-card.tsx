import type { Category } from "../model/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base"
        style={{ backgroundColor: `${category.color}33` }}
        aria-hidden
      >
        <span>{category.icon}</span>
      </div>
      <span className="font-medium">{category.name}</span>
    </div>
  );
}
