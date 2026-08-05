interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

/** 问题输入框 + 字数统计 */
export function QuestionInput({ value, onChange, maxLength = 200 }: QuestionInputProps) {
  return (
    <div>
      <label
        htmlFor="question-input"
        class="block font-sans text-sm text-ink mb-2"
      >
        想问点什么？（可选，最多 {maxLength} 字）
      </label>
      <textarea
        id="question-input"
        value={value}
        maxLength={maxLength}
        rows={3}
        placeholder="想问点什么？（可选，最多 200 字）"
        onInput={(e) => {
          const target = e.currentTarget as HTMLTextAreaElement;
          onChange(target.value);
        }}
        class="w-full bg-white/60 rounded-lg border border-ink/10 px-3 py-2 font-sans text-sm leading-relaxed text-ink resize-none focus:outline-none focus:border-cinnabar"
      />
      <div class="mt-1 text-right font-sans text-xs text-ink/50">
        {value.length} / {maxLength}
      </div>
    </div>
  );
}
