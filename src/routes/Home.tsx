import { KnowledgeCarousel } from "../components/KnowledgeCarousel.tsx";
import { ContactButton } from "../components/ContactButton.tsx";

export function Home() {
  return (
    <main class="min-h-screen bg-paper">
      <div class="max-w-2xl mx-auto px-4 py-12">
        {/* 主标题 */}
        <h1 class="font-serif text-3xl md:text-4xl font-bold text-center text-ink mb-2">
           轻松读懂易经
        </h1>
        <p class="text-center text-ink/50 text-sm mb-10">
          三千年的东方智慧，陪你面对每一个选择
        </p>

        {/* 科普轮播 */}
        <KnowledgeCarousel />

        {/* 底部说明 */}
        <p class="text-center text-xs text-ink/40 mt-10 leading-relaxed">
          以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。
        </p>
      </div>

      <ContactButton />
    </main>
  );
}