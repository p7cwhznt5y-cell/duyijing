import { useEffect, useState } from "preact/hooks";
import "./Home.css";
import type { RoutableProps } from "preact-router";
import type { Hexagram } from "../data/types.ts";
import {
  getHexagramByIndex,
  getRandomHexagram,
  getTodayReading,
  getTodayString,
  saveTodayReading,
} from "../data/index.ts";
import { HexagramSymbol } from "../components/HexagramSymbol.tsx";
import { GuaCiCard } from "../components/GuaCiCard.tsx";
import { YaoList } from "../components/YaoList.tsx";
import { Disclaimer } from "../components/Disclaimer.tsx";
import { QuestionInput } from "../components/QuestionInput.tsx";
import { detectSensitive, truncateInput } from "../utils/safetyFilter.ts";
import { interpretHexagram } from "../api/interpret.ts";

export function Home(_props: RoutableProps) {
  const [hexagram, setHexagram] = useState<Hexagram | null>(null);
  const [question, setQuestion] = useState("");
  const [careMessage, setCareMessage] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const reading = getTodayReading();
    if (reading) {
      const existing = getHexagramByIndex(reading.hexagramIndex);
      if (existing) {
        setHexagram(existing);
        if (reading.question) setQuestion(reading.question);
        if (reading.interpretation) setInterpretation(reading.interpretation);
        return;
      }
    }
    const random = getRandomHexagram();
    setHexagram(random);
    saveTodayReading({ date: getTodayString(), hexagramIndex: random.index });
  }, []);

  const handleInspire = async () => {
  if (loading || !hexagram) return;
  const truncated = truncateInput(question.trim());
  const detection = detectSensitive(truncated);
  if (detection.sensitive && detection.careMessage) {
    setCareMessage(detection.careMessage);
    return;
  }
  setCareMessage(null);
  setLoading(true);
  setError("");
  try {
    const result = await interpretHexagram(hexagram, truncated);
    if (result.error) {
      setError(result.error);
      setInterpretation("");
    } else {
      setInterpretation(result.interpretation);
      saveTodayReading({
        date: getTodayString(),
        hexagramIndex: hexagram.index,
        question: truncated,
        interpretation: result.interpretation,
      });
    }
  } catch (e: any) {
    console.error("💥 handleInspire 异常:", e);
    setError(e?.message || "今日卦象已为你抽取，但 AI 解读暂时不可用，请稍后再试。");
    setInterpretation("");
  } finally {
    setLoading(false);
  }
};

  if (!hexagram) {
    return (
      <main class="max-w-md md:max-w-2xl mx-auto px-4 py-16 font-sans text-center text-ink/60">
        正在抽取今日卦象……
      </main>
    );
  }

  return (
    <main class="max-w-md md:max-w-2xl mx-auto px-4 py-6 font-sans bg-paper">
      <header class="text-center mb-8">
        <h1 class="font-serif text-3xl md:text-4xl font-bold">
          <span class="text-cinnabar">观变</span>
          <span class="mx-2 text-ink">·</span>
          <span class="text-ink">易经</span>
        </h1>
        <p class="mt-3 font-sans text-sm text-ink/60">
          今日卦象：{hexagram.name} 卦
        </p>
      </header>

      <section class="my-8">
        <HexagramSymbol hexagram={hexagram} />
      </section>

      <section class="my-6">
        <GuaCiCard guaCi={hexagram.guaCi} />
      </section>

      <section class="my-6">
        <h2 class="font-serif text-lg text-ink mb-3">爻辞</h2>
        <YaoList hexagram={hexagram} />
      </section>

      {interpretation ? (
        <div className="inspiration-card">
       <h2>今日启发</h2>
       <div className="inspiration-text">{interpretation}</div>
       <p className="inspiration-footer">
       以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。
       </p>
       </div>
      ) : null}

      {loading ? (
        <section class="my-4">
          <p class="font-sans text-sm text-ink/60 animate-pulse">
            正在为您推演...
          </p>
        </section>
      ) : null}

      {error ? (
        <section class="my-4">
          <p role="alert" class="font-sans text-sm text-cinnabar leading-relaxed">
            {error}
          </p>
        </section>
      ) : null}

      <section class="my-8">
        <QuestionInput value={question} onChange={setQuestion} />
        <button
          type="button"
          onClick={handleInspire}
          disabled={loading}
          class="mt-2 w-full bg-cinnabar text-ink font-sans font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "解读生成中..." : "获得启发"}
        </button>
        {careMessage ? (
          <div
            role="alert"
            class="mt-4 bg-cinnabar/10 border border-cinnabar/30 rounded-lg px-4 py-3 text-cinnabar font-sans text-sm leading-relaxed"
          >
            {careMessage}
          </div>
        ) : null}
      </section>

      <Disclaimer />
    </main>
  );
}
