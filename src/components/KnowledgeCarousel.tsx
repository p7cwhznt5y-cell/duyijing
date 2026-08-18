// src/components/KnowledgeCarousel.tsx
import { useState, useEffect } from "preact/hooks";
import { KNOWLEDGE_ITEMS } from "../data/knowledge.ts";

export function KnowledgeCarousel() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  
  const items = KNOWLEDGE_ITEMS;
  const total = items.length;

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <div class="relative">
      {/* 轮播视口 */}
      <div class="overflow-hidden rounded-2xl">
        <div 
          class="flex transition-transform duration-500 ease-out"
          style={`transform: translateX(-${current * 100}%)`}
        >
          {items.map((item) => (
            <div class="w-full flex-shrink-0 relative h-64">
              {/* Bing 随机风景图作背景 */}
              <img
                src={item.bg}
                alt={item.title}
                class="absolute inset-0 w-full h-full object-cover"
                onLoad={() => setLoaded((p) => ({ ...p, [item.id]: true }))}
                style={loaded[item.id] ? {} : { opacity: 0 }}
              />
              {/* 渐变遮罩，保证文字可读 */}
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* 文本内容 */}
              <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div class="text-3xl mb-2">{item.icon}</div>
                <h3 class="font-serif text-2xl font-bold mb-1">{item.title}</h3>
                <p class="font-sans text-sm text-white/80">{item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 左右箭头 */}
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

      {/* 指示器圆点 */}
      <div class="flex justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
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