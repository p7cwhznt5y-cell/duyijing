interface NavBarProps {
  currentPath: string;
}

const NAV_ITEMS: ReadonlyArray<{ path: string; label: string }> = [
  { path: "/", label: "首页" },
  { path: "/decision", label: "决策推演" },
  { path: "/hexagrams", label: "卦象详情" },
];

function isActive(currentPath: string, target: string): boolean {
  if (target === "/") return currentPath === "/";
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

/** 顶部导航：观变 · 易经 logo + 三个链接（preact-router 全局拦截 a 标签点击） */
export function NavBar({ currentPath }: NavBarProps) {
  return (
    <header class="sticky top-0 z-10 bg-paper/90 backdrop-blur border-b border-ink/10">
      <nav class="max-w-md md:max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" class="font-serif text-lg font-bold no-underline">
          <span class="text-cinnabar">观变</span>
          <span class="mx-1 text-ink">·</span>
          <span class="text-ink">易经</span>
        </a>
        <div class="flex items-center gap-3 md:gap-4 font-sans text-sm">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.path}
              href={item.path}
              class={`no-underline transition-colors ${
                isActive(currentPath, item.path)
                  ? "text-cinnabar font-bold"
                  : "text-ink hover:text-cinnabar"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
