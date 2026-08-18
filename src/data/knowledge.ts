export interface KnowledgeItem {
  id: string;
  icon: string;
  title: string;
  summary: string;
  bg: string;
}

export const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: "what-is-yijing",
    icon: "📜",
    title: "什么是易经？",
    summary: "《易经》是中国古代哲学经典，被誉为「群经之首，大道之源」。",
    bg: "https://source.unsplash.com/800x400/?chinese,philosophy",
  },
  {
    id: "what-is-gua",
    icon: "🌿",
    title: "什么是卦？",
    summary: "卦是《易经》中最基本的符号单元，用来模拟和象征宇宙万事万物的状态与变化规律。一卦有六爻。",
    bg: "https://source.unsplash.com/800x400/?nature,landscape",
  },
  {
    id: "yin-yang",
    icon: "⚖️",
    title: "什么是阳爻、阴爻？",
    summary: "阳爻：用一条实线“—”表示，象征刚健、主动、光明。阴爻：用两条短线“--”表示，象征柔顺、被动、幽暗。",
    bg: "https://source.unsplash.com/800x400/?balance,yin-yang",
  },
  {
    id: "bian-yao",
    icon: "🔄",
    title: "什么是变爻？",
    summary: "变爻是《易经》占卜中的一个核心概念，指的是在起卦过程中，因数字变化而导致阴阳属性发生转变的爻。它是连接“本卦”（当前状态）与“变卦”（未来趋势）的关键桥梁。",
    bg: "https://source.unsplash.com/800x400/?change,flow",
  },
  {
    id: "not-divination",
    icon: "🧠",
    title: "易经不是算命",
    summary: "它是一种哲学思维，帮助你更好做决策。",
    bg: "https://source.unsplash.com/800x400/?wisdom,thinking",
  },
];