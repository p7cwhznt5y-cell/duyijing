import type { Hexagram } from "../data/types.ts";

interface HexagramSymbolProps {
  hexagram: Hexagram;
}

export function HexagramSymbol({ hexagram }: HexagramSymbolProps) {
  return (
    <div class="text-center">
      <div class="font-serif text-8xl text-ink leading-none select-none" aria-label={`卦符：${hexagram.name}`}>
        {hexagram.symbol}
      </div>
      <div class="mt-4 font-serif text-2xl text-ink">
        <span class="font-bold">{hexagram.name}</span>
      </div>
    </div>
  );
}
