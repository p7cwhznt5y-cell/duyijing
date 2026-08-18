import { useState, useEffect, useRef } from "preact/hooks";
import { KNOWLEDGE_ITEMS } from "../data/knowledge.ts";

const FALLBACK_GRADIENTS = [
  "from-emerald-900 via-teal-800 to-cyan-700",
  "from-stone-800 via-zinc-700 to-neutral-600",
  "from-amber-900 via-yellow-800 to-orange-700",
  "from-sky-900 via-blue-800 to-indigo-700",
  "from-rose-900 via-pink-800 to-purple-700",
];

export function KnowledgeCarousel() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [errored, setErrored] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<number | null>(null);

  const items = KNOWLEDGE_ITEMS;
  const total = items.length;

  const startAutoPlay = () => {
    if (intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 8000); // 从 5000 改为 8000 毫秒
  };

  const stopAutoPlay = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div
      class="relative"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
    >
      <div class="overflow-hidden rounded-2xl">
        <div
          class="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              class={`w-full flex-shrink-0 relative h-64 ${
                errored[item.id]
                  ? `bg-gradient-to-br ${FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]}`
                  : "bg-ink/5"
              }`}
            >
              {!errored[item.id] && (
                <img
                  src={item.bg}
                  alt={item.title}
                  class="absolute inset-0 w-full h-full object-cover"
                  onLoad={() => setLoaded((p) => ({ ...p, [item.id]: true }))}
                  onError={() => setErrored((p) => ({ ...p, [item.id]: true }))}
                  style={{ opacity: loaded[item.id] ? 1 : 0 }}
                />
              )}
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div class="text-3xl mb-2">{item.icon}</div>
                <h3 class="font-serif text-2xl font-bold mb-1">{item.title}</h3>
                <p class="font-sans text-sm text-white/80">{item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setCurrent((c) => (c - 1 + total) % total)}
        class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-ink hover:bg-white transition-colors"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % total)}
        class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-ink hover:bg-white transition-colors"
      >
        ›
      </button>

      <div class="flex justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            class={`w-2 h-2 rounded-full transition-all ${
              i === current ? "w-6 bg-cinnabar" : "bg-ink/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}