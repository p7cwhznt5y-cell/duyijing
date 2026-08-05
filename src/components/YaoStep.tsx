interface YaoStepProps {
  position: number;
  isYang: boolean;
  title: string;
  text: string;
  selected: string | null;
  onSelect: (choice: string) => void;
}

function getOptions(isYang: boolean): string[] {
  return isYang
    ? ["刚健进取", "持守谦柔"]
    : ["柔顺承应", "坚守本位"];
}

function getTip(isYang: boolean, choice: string): string {
  if (isYang) {
    if (choice === "刚健进取") {
      return "阳爻主刚。刚健进取者，当审时度势、刚而不暴，顺势而动方能行而有利。";
    }
    return "刚中择柔。知进退之机，谦以自处，刚柔相济，乃得久长之道。";
  }
  if (choice === "柔顺承应") {
    return "阴爻主柔。柔顺承应者，以柔济刚、承上启下，守正而不失其位。";
  }
  return "柔中守刚。安守本位而不逾矩，静以待时，自可无失。";
}

export function YaoStep({ position, title, text, isYang, selected, onSelect }: YaoStepProps) {
  const options = getOptions(isYang);

  return (
    <div>
      <div class="bg-white/60 rounded-lg px-4 py-3 border-l-4 border-cinnabar">
        <div class="font-sans text-xs tracking-widest text-cinnabar mb-1">
          第 {position} 爻 · {title}
        </div>
        <p class="font-serif text-lg leading-relaxed text-ink">{text}</p>
      </div>

      <div class="mt-4">
        <p class="font-sans text-sm text-ink/70 mb-3">
          在此爻之位，你倾向于？
        </p>
        <div class="grid grid-cols-2 gap-3">
          {options.map((opt) => {
            const isActive = selected === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onSelect(opt)}
                class={`font-serif text-base py-3 rounded-lg border transition-colors ${
                  isActive
                    ? "border-cinnabar bg-cinnabar text-white"
                    : "border-ink/30 bg-white/60 text-ink hover:border-cinnabar/50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {selected ? (
          <div class="mt-4 bg-cinnabar/5 border border-cinnabar/20 rounded-lg px-4 py-3">
            <p class="font-sans text-sm leading-relaxed text-ink/70">
              {getTip(isYang, selected)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
