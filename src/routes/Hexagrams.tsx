import { useState } from "preact/hooks";
import type { RoutableProps } from "preact-router";
import type { HexagramCategory } from "../data/types.ts";
import { HEXAGRAMS } from "../data/hexagrams.ts";
import { HEXAGRAM_CATEGORIES } from "../data/categories.ts";
import { ContactButton } from "../components/ContactButton.tsx";

export function Hexagrams(_props: RoutableProps) {
  const [filter, setFilter] = useState<HexagramCategory | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const visible = filter
    ? HEXAGRAMS.filter((h) => h.category === filter)
    : HEXAGRAMS;

  const filterLabel = filter
    ? HEXAGRAM_CATEGORIES.find((c) => c.value === filter)?.label ?? filter
    : null;

  return (
    <main class="max-w-md md:max-w-2xl mx-auto px-4 py-6 font-sans bg-paper">
      <header class="text-center mb-6">
        <h1 class="font-serif text-3xl md:text-4xl font-bold text-ink">
          卦象详情
        </h1>
        <p class="mt-3 font-sans text-xs text-ink/50 leading-relaxed">
        </p>
      </header>

      <section class="mb-6">
        <button
          type="button"
          onClick={() => setShowFilter((s) => !s)}
          aria-expanded={showFilter}
          class="w-full flex items-center justify-between rounded-lg border border-ink/15 bg-white/60 px-4 py-2 font-sans text-sm text-ink hover:border-cinnabar/50 transition-colors"
        >
          <span>
            按分类筛选
            {filterLabel ? <span class="text-cinnabar">：{filterLabel}</span> : null}
          </span>
          <span class="text-ink/40">{showFilter ? "收起" : "展开"}</span>
        </button>
        {showFilter ? (
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter(null)}
              class={`rounded-full border px-3 py-1 font-sans text-xs transition-colors ${
                filter === null
                  ? "border-cinnabar bg-cinnabar/10 text-cinnabar"
                  : "border-ink/15 bg-white/60 text-ink/70 hover:border-cinnabar/50"
              }`}
            >
              全部
            </button>
            {HEXAGRAM_CATEGORIES.map((c) => {
              const active = filter === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFilter(c.value)}
                  class={`rounded-full border px-3 py-1 font-sans text-xs transition-colors ${
                    active
                      ? "border-cinnabar bg-cinnabar/10 text-cinnabar"
                      : "border-ink/15 bg-white/60 text-ink/70 hover:border-cinnabar/50"
                  }`}
                >
                  {c.value} 
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <section class="grid grid-cols-2 md:grid-cols-4 gap-3">
        {visible.map((h) => (
          <a
            key={h.index}
            href={`/hexagrams/${h.index}`}
            class="block rounded-lg bg-white/60 border border-ink/10 px-3 py-4 text-center no-underline hover:border-cinnabar hover:bg-white transition-colors"
          >
            <div class="font-serif text-5xl text-ink leading-none select-none">
              {h.symbol}
            </div>
            <div class="mt-2 font-serif font-bold text-ink">
              {h.name}
            </div>
            <div class="mt-1 font-sans text-xs text-ink/50">第 {h.index} 卦</div>
          </a>
        ))}
      </section>

      {visible.length === 0 ? (
        <p class="text-center font-sans text-sm text-ink/50 py-8">
          该分类下暂无已录入卦象。
        </p>
      ) : null}
      <ContactButton />
    </main>
  );
}
