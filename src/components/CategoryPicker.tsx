import type { HexagramCategory } from "../data/types.ts";
import type { CategoryMeta } from "../data/categories.ts";

interface CategoryPickerProps {
  categories: CategoryMeta[];
  selected: HexagramCategory | null;
  onSelect: (category: HexagramCategory) => void;
}

export function CategoryPicker({
  categories,
  selected,
  onSelect,
}: CategoryPickerProps) {
  return (
    <div class="grid grid-cols-2 gap-3">
      {categories.map((cat) => {
        const isActive = selected === cat.value;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onSelect(cat.value)}
            class={`text-left rounded-lg px-3 py-3 border transition-colors ${
              isActive
                ? "border-cinnabar bg-cinnabar/10"
                : "border-ink/15 bg-white/60 hover:border-cinnabar/50"
            }`}
          >
            <div
              class={`font-serif font-bold text-base ${
                isActive ? "text-cinnabar" : "text-ink"
              }`}
            >
              {cat.value} {cat.label}
            </div>
            <div class="mt-1 font-sans text-xs leading-relaxed text-ink/60">
              {cat.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
