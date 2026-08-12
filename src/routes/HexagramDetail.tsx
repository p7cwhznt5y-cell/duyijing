import type { RoutableProps } from "preact-router";
import { getHexagramByIndex } from "../data/hexagrams.ts";
import { GuaCiCard } from "../components/GuaCiCard.tsx";
import { YaoList } from "../components/YaoList.tsx";
import { HEXAGRAM_CATEGORIES } from "../data/categories.ts";

interface HexagramDetailProps extends RoutableProps {
  index?: string;
}

export function HexagramDetail({ index }: HexagramDetailProps) {
  const numericIndex = Number(index);
  const hexagram = Number.isFinite(numericIndex)
    ? getHexagramByIndex(numericIndex)
    : undefined;
  const categoryLabel = hexagram
    ? HEXAGRAM_CATEGORIES.find((c) => c.value === hexagram.category)?.label ?? ""
    : "";
  if (!hexagram) {
    return (
      <main class="max-w-md md:max-w-2xl mx-auto px-4 py-12 font-sans text-center bg-paper">
        <h1 class="font-serif text-2xl text-ink">未找到此卦</h1>
        <p class="mt-4 font-sans text-sm text-ink/60 leading-relaxed">
          未找到此卦，可能尚未录入。首版仅收录 8 个基础卦，余 56 卦迭代补全。
        </p>
        <a
          href="/hexagrams"
          class="inline-block mt-6 font-sans text-sm text-cinnabar hover:underline"
        >
          ← 返回卦象列表
        </a>
      </main>
    );
  }

  return (
    <main class="max-w-md md:max-w-2xl mx-auto px-4 py-6 font-sans bg-paper">
      <header class="text-center mb-8">
        <p class="font-sans text-xs text-ink/50">第 {hexagram.index} 卦</p>
        <div class="mt-3 font-serif text-8xl md:text-9xl text-ink leading-none select-none">
          {hexagram.symbol}
        </div>
        <h1 class="mt-4 font-serif text-2xl text-ink">
          <span class="font-bold">{hexagram.name}</span>
        </h1>
        <span class="inline-block mt-4 rounded-full border border-cinnabar/60 text-cinnabar px-3 py-0.5 font-sans text-xs">
          {hexagram.category} {categoryLabel}
        </span>
      </header>

      <section class="my-6">
        <GuaCiCard guaCi={hexagram.guaCi} />
      </section>

      <section class="my-6">
        <h2 class="font-serif text-lg text-ink mb-3">爻辞</h2>
        <YaoList hexagram={hexagram} />
      </section>

      <section class="mt-8">
        <a
          href="/hexagrams"
          class="inline-block font-sans text-sm text-cinnabar hover:underline"
        >
          ← 返回卦象列表
        </a>
      </section>

      <p class="mt-8 pt-4 border-t border-ink/10 text-center font-sans text-xs leading-relaxed text-ink/50">
        以上内容为《周易》原典经文，仅供学习参考。
      </p>
    </main>
  );
}
