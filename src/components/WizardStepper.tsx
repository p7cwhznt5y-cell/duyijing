interface WizardStepperProps {
  current: number; // 0-indexed
  total: number;
}

/** 顶部进度条：显示当前步骤 / 总步骤 + 百分比 */
export function WizardStepper({ current, total }: WizardStepperProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(0, current), safeTotal - 1);
  const percent = Math.round(((safeCurrent + 1) / safeTotal) * 100);
  return (
    <div class="mb-6">
      <div class="flex items-center justify-between font-sans text-xs text-ink/60 mb-2">
        <span>
          第 {safeCurrent + 1} / {safeTotal} 步
        </span>
        <span>{percent}%</span>
      </div>
      <div class="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
        <div
          class="h-full bg-cinnabar rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
