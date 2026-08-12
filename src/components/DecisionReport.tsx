import type { Hexagram } from "../data/types.ts";
import { HexagramSymbol } from "./HexagramSymbol.tsx";
import { GuaCiCard } from "./GuaCiCard.tsx";
import { Disclaimer } from "./Disclaimer.tsx";

interface DecisionReportProps {
  dilemma: string;
  hexagram: Hexagram;
  yaoChoices: Record<number, string>;
  aiInterpretation: string;
  loading: boolean;
  error: string;
  careMessage: string | null;
  onRestart: () => void;
}

function yaoTitle(position: number, isYang: boolean): string {
  const number = isYang ? "九" : "六";
  if (position === 1) return `初${number}`;
  if (position === 6) return `上${number}`;
  const names = ["", "二", "三", "四", "五", ""];
  return `${number}${names[position] ?? String(position)}`;
}

export function DecisionReport({
  dilemma,
  hexagram,
  yaoChoices,
  aiInterpretation,
  loading,
  error,
  careMessage,
  onRestart,
}: DecisionReportProps) {
  return (
    <div class="space-y-6">
      <header class="text-center">
        <h2 class="font-serif text-2xl font-bold text-cinnabar">推演报告</h2>
        <p class="mt-1 font-sans text-xs text-ink/50">观变 · 易经互动推演</p>
      </header>

      <section class="bg-white/60 rounded-lg px-4 py-3 border-l-4 border-cinnabar">
        <div class="font-sans text-xs tracking-widest text-cinnabar mb-1">
          你的两难
        </div>
        <p class="font-serif text-base leading-relaxed text-ink whitespace-pre-wrap">
          {dilemma}
        </p>
      </section>

      <section>
        <HexagramSymbol hexagram={hexagram} />
        <div class="mt-4">
          <GuaCiCard guaCi={hexagram.guaCi} />
        </div>
      </section>

      <section>
        <h3 class="font-serif text-lg font-bold text-ink mb-3">爻位抉择</h3>
        <ol class="space-y-2 list-none p-0 m-0">
          {hexagram.binary.split("").map((bit, i) => {
            const position = i + 1;
            const isYang = bit === "1";
            const title = yaoTitle(position, isYang);
            const choice = yaoChoices[position];
            return (
              <li
                key={position}
                class="bg-white/60 rounded-lg px-4 py-2 flex items-baseline gap-2"
              >
                <span class="font-serif font-bold text-cinnabar shrink-0">
                  {title}
                </span>
                <span class="font-sans text-sm text-ink/70">
                  → {choice ?? "未抉择"}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section class="bg-white/60 rounded-lg px-4 py-4">
        <h3 class="font-serif text-lg font-bold text-cinnabar mb-2">整体启发</h3>
        {loading ? (
          <p class="font-sans text-sm text-ink/60 animate-pulse">
            正在为您推演...
          </p>
        ) : null}
        {!loading && error ? (
          <p
            role="alert"
            class="font-sans text-sm text-cinnabar leading-relaxed"
          >
            {error}
          </p>
        ) : null}
        {!loading && !error && aiInterpretation ? (
          <p class="font-sans text-sm leading-relaxed text-ink whitespace-pre-wrap">
            {aiInterpretation}
          </p>
        ) : null}
      </section>

      {careMessage ? (
        <div
          role="alert"
          class="bg-cinnabar/10 border border-cinnabar/30 rounded-lg px-4 py-3 text-cinnabar font-sans text-sm leading-relaxed"
        >
          {careMessage}
        </div>
      ) : null}

      <Disclaimer />

      <section class="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={onRestart}
          class="w-full bg-cinnabar text-white font-sans font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          重新推演
        </button>
        <a
          href="/"
          class="block text-center w-full border border-ink/30 text-ink font-sans py-3 rounded-lg no-underline hover:bg-ink/5 transition-colors"
        >
          回到首页
        </a>
      </section>
    </div>
  );
}
