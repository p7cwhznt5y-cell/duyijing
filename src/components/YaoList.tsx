import type { Hexagram } from "../data/types.ts";

interface YaoListProps {
  hexagram: Hexagram;
}

function yaoTitle(position: number, isYang: boolean): string {
  const number = isYang ? "九" : "六";
  if (position === 1) return `初${number}`;
  if (position === 6) return `上${number}`;
  const names = ["", "", "二", "三", "四", "五"];
  return `${number}${names[position] ?? String(position)}`;
}

export function YaoList({ hexagram }: YaoListProps) {
  return (
    <ol class="space-y-3 list-none p-0 m-0">
      {hexagram.binary.split("").map((bit, i) => {
        const position = i + 1;
        const isYang = bit === "1";
        const title = yaoTitle(position, isYang);
        const text = hexagram.yaoCi[i] ?? "";
        return (
          <li key={position} class="bg-white/60 rounded-lg px-4 py-3">
            <div class="flex items-baseline gap-2">
              <span class="font-serif font-bold text-cinnabar shrink-0">{title}</span>
              <span class="font-serif text-ink leading-relaxed">{text}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
