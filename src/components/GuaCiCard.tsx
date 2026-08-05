interface GuaCiCardProps {
  guaCi: string;
}

/** 卦辞卡片：朱砂红左竖线 + 文字 */
export function GuaCiCard({ guaCi }: GuaCiCardProps) {
  return (
    <div class="bg-white/60 rounded-lg border-l-4 border-cinnabar px-4 py-3">
      <div class="font-sans text-xs tracking-widest text-cinnabar mb-1">卦 辞</div>
      <p class="font-serif text-lg leading-relaxed text-ink">{guaCi}</p>
    </div>
  );
}
