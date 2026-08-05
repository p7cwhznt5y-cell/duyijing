import { useEffect, useMemo, useState } from "preact/hooks";
import type { RoutableProps } from "preact-router";
import type { Hexagram, HexagramCategory } from "../data/types.ts";
import { getHexagramsByCategory } from "../data/hexagrams.ts";
import { HEXAGRAM_CATEGORIES } from "../data/categories.ts";
import { interpretHexagram } from "../api/interpret.ts";
import { detectSensitive, truncateInput } from "../utils/safetyFilter.ts";
import { WizardStepper } from "../components/WizardStepper.tsx";
import { CategoryPicker } from "../components/CategoryPicker.tsx";
import { YaoStep } from "../components/YaoStep.tsx";
import { DecisionReport } from "../components/DecisionReport.tsx";

type StepType =
  | "dilemma"
  | "category"
  | "hexagram-select"
  | "no-match"
  | "yao"
  | "report";

interface Step {
  type: StepType;
  yaoIndex?: number;
}

const DILEMMA_MIN = 10;
const DILEMMA_MAX = 500;

function yaoTitle(position: number, isYang: boolean): string {
  const number = isYang ? "九" : "六";
  if (position === 1) return `初${number}`;
  if (position === 6) return `上${number}`;
  const names = ["", "二", "三", "四", "五", ""];
  return `${number}${names[position] ?? String(position)}`;
}

export function Decision(_props: RoutableProps) {
  const [step, setStep] = useState(0);
  const [dilemma, setDilemma] = useState("");
  const [category, setCategory] = useState<HexagramCategory | null>(null);
  const [selectedHexagram, setSelectedHexagram] = useState<Hexagram | null>(
    null,
  );
  const [yaoChoices, setYaoChoices] = useState<Record<number, string>>({});
  const [aiInterpretation, setAiInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [careMessage, setCareMessage] = useState<string | null>(null);
  const [reportRequested, setReportRequested] = useState(false);

  const steps = useMemo<Step[]>(() => {
    const arr: Step[] = [{ type: "dilemma" }, { type: "category" }];
    if (category) {
      const matches = getHexagramsByCategory(category);
      if (matches.length === 0) {
        arr.push({ type: "no-match" });
      } else if (matches.length > 1) {
        arr.push({ type: "hexagram-select" });
      }
    }
    if (selectedHexagram) {
      for (let i = 0; i < 6; i++) {
        arr.push({ type: "yao", yaoIndex: i });
      }
      arr.push({ type: "report" });
    }
    return arr;
  }, [category, selectedHexagram]);

  const safeStep = Math.min(step, steps.length - 1);
  const currentStep: Step = steps[safeStep] ?? { type: "dilemma" };

  useEffect(() => {
    if (step > steps.length - 1) {
      setStep(Math.max(0, steps.length - 1));
    }
  }, [step, steps.length]);

  const handleDilemmaInput = (value: string) => {
    const truncated = truncateInput(value, DILEMMA_MAX);
    setDilemma(truncated);
    const detection = detectSensitive(truncated);
    setCareMessage(detection.sensitive ? detection.careMessage ?? null : null);
  };

  const handleSelectCategory = (cat: HexagramCategory) => {
    setCategory(cat);
    const matches = getHexagramsByCategory(cat);
    setSelectedHexagram(matches.length === 1 ? matches[0] : null);
    setYaoChoices({});
    setAiInterpretation("");
    setError("");
    setReportRequested(false);
  };

  const handleSelectHexagram = (h: Hexagram) => {
    setSelectedHexagram(h);
    setYaoChoices({});
    setAiInterpretation("");
    setError("");
    setReportRequested(false);
  };

  const handleSelectYaoChoice = (position: number, choice: string) => {
    setYaoChoices((prev) => ({ ...prev, [position]: choice }));
  };

  const handleRestart = () => {
    setStep(0);
    setDilemma("");
    setCategory(null);
    setSelectedHexagram(null);
    setYaoChoices({});
    setAiInterpretation("");
    setError("");
    setCareMessage(null);
    setReportRequested(false);
    setLoading(false);
  };

  useEffect(() => {
    if (currentStep.type !== "report") return;
    if (reportRequested) return;
    if (!selectedHexagram) return;
    setReportRequested(true);
    setLoading(true);
    setError("");
    const truncated = truncateInput(dilemma.trim(), DILEMMA_MAX);
    let cancelled = false;
    interpretHexagram(selectedHexagram, truncated)
      .then((result) => {
        if (cancelled) return;
        if (result.error || !result.interpretation) {
          setError("AI 解读暂时不可用，请稍后再试");
          setAiInterpretation("");
        } else {
          setAiInterpretation(result.interpretation);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("AI 解读暂时不可用，请稍后再试");
        setAiInterpretation("");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentStep.type, reportRequested, selectedHexagram, dilemma]);

  const canNext = (): boolean => {
    switch (currentStep.type) {
      case "dilemma":
        return dilemma.trim().length >= DILEMMA_MIN;
      case "category":
        return category !== null;
      case "hexagram-select":
        return selectedHexagram !== null;
      case "no-match":
        return false;
      case "yao": {
        const idx = currentStep.yaoIndex;
        if (idx === undefined) return false;
        if (!selectedHexagram) return false;
        const position = idx + 1;
        return yaoChoices[position] !== undefined;
      }
      case "report":
        return false;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canNext()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const yaoForCurrentStep =
    currentStep.type === "yao" &&
    currentStep.yaoIndex !== undefined &&
    selectedHexagram
      ? (() => {
          const idx = currentStep.yaoIndex!;
          const position = idx + 1;
          const isYang = selectedHexagram.binary[idx] === "1";
          const title = yaoTitle(position, isYang);
          const text = selectedHexagram.yaoCi[idx] ?? "";
          return { position, isYang, title, text };
        })()
      : undefined;

  const selectedCategoryLabel = category
    ? HEXAGRAM_CATEGORIES.find((c) => c.value === category)?.label ?? category
    : category;

  return (
    <main class="max-w-md md:max-w-2xl mx-auto px-4 py-6 font-sans bg-paper">
      <WizardStepper current={safeStep} total={steps.length} />

      {currentStep.type === "dilemma" ? (
        <section>
          <h2 class="font-serif text-xl font-bold text-ink">你正面临什么两难？</h2>
          <p class="mt-1 font-sans text-xs text-ink/50">
            请描述你当前的两难情境，例如：要不要换工作 / 是否继续一段关系
          </p>
          <textarea
            value={dilemma}
            maxLength={DILEMMA_MAX}
            rows={5}
            placeholder="例如：我在一份稳定的工作和一次有风险的机会之间犹豫，不知该如何取舍……"
            onInput={(e) =>
              handleDilemmaInput((e.currentTarget as HTMLTextAreaElement).value)
            }
            class="mt-4 w-full bg-white/60 rounded-lg border border-ink/10 px-3 py-2 font-sans text-sm leading-relaxed text-ink resize-none focus:outline-none focus:border-cinnabar"
          />
          <div class="mt-1 text-right font-sans text-xs text-ink/50">
            {dilemma.length} / {DILEMMA_MAX}
          </div>
          {careMessage ? (
            <div
              role="alert"
              class="mt-3 bg-cinnabar/10 border border-cinnabar/30 rounded-lg px-4 py-3 text-cinnabar font-sans text-sm leading-relaxed"
            >
              {careMessage}
            </div>
          ) : null}
        </section>
      ) : null}

      {currentStep.type === "category" ? (
        <section>
          <h2 class="font-serif text-xl font-bold text-ink">这是怎样的情境？</h2>
          <p class="mt-1 mb-4 font-sans text-xs text-ink/50">
            选择最贴近你处境的类型，将匹配对应卦象引导推演
          </p>
          <CategoryPicker
            categories={HEXAGRAM_CATEGORIES}
            selected={category}
            onSelect={handleSelectCategory}
          />
        </section>
      ) : null}

      {currentStep.type === "hexagram-select" && category ? (
        <section>
          <h2 class="font-serif text-xl font-bold text-ink">选择一卦以推演</h2>
          <p class="mt-1 mb-4 font-sans text-xs text-ink/50">
            「{selectedCategoryLabel}」类情境对应以下卦象，请选择其一
          </p>
          <div class="space-y-3">
            {getHexagramsByCategory(category).map((h) => {
              const isActive = selectedHexagram?.index === h.index;
              return (
                <button
                  key={h.index}
                  type="button"
                  onClick={() => handleSelectHexagram(h)}
                  class={`w-full text-left rounded-lg px-4 py-3 border transition-colors ${
                    isActive
                      ? "border-cinnabar bg-cinnabar/10"
                      : "border-ink/15 bg-white/60 hover:border-cinnabar/50"
                  }`}
                >
                  <div class="flex items-center gap-3">
                    <span class="font-serif text-3xl text-ink leading-none">
                      {h.symbol}
                    </span>
                    <div class="min-w-0">
                      <div
                        class={`font-serif font-bold text-base ${
                          isActive ? "text-cinnabar" : "text-ink"
                        }`}
                      >
                        {h.name}
                      </div>
                      <p class="mt-0.5 font-sans text-xs text-ink/60 leading-relaxed truncate">
                        {h.guaCi}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {currentStep.type === "no-match" ? (
        <section class="text-center py-8">
          <p class="font-serif text-base text-ink/70">
            该情境类型暂无对应卦象数据，请选择其他类型。
          </p>
          <p class="mt-2 font-sans text-xs text-ink/40">
            首版仅录入 8 个基础卦，部分类型尚未覆盖。
          </p>
        </section>
      ) : null}

      {currentStep.type === "yao" && yaoForCurrentStep ? (
        <section>
          <YaoStep
            position={yaoForCurrentStep.position}
            isYang={yaoForCurrentStep.isYang}
            title={yaoForCurrentStep.title}
            text={yaoForCurrentStep.text}
            selected={yaoChoices[yaoForCurrentStep.position] ?? null}
            onSelect={(choice) =>
              handleSelectYaoChoice(yaoForCurrentStep.position, choice)
            }
          />
        </section>
      ) : null}

      {currentStep.type === "report" && selectedHexagram ? (
        <DecisionReport
          dilemma={dilemma}
          hexagram={selectedHexagram}
          yaoChoices={yaoChoices}
          aiInterpretation={aiInterpretation}
          loading={loading}
          error={error}
          careMessage={careMessage}
          onRestart={handleRestart}
        />
      ) : null}

      {currentStep.type !== "report" ? (
        <nav class="mt-8 flex items-center gap-3">
          {safeStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              class="flex-1 border border-ink/30 text-ink font-sans py-3 rounded-lg hover:bg-ink/5 transition-colors"
            >
              上一步
            </button>
          ) : null}
          {safeStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext()}
              class="flex-1 bg-cinnabar text-white font-sans font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
