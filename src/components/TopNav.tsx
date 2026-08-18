import { useState, useEffect } from "preact/hooks";

export function TopNav() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      updatePath();
    };
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      updatePath();
    };
    return () => {
      window.removeEventListener("popstate", updatePath);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const navItems = [
    { path: "/", label: "首页" },
    { path: "/daily", label: "今日卦象" },
    { path: "/decision", label: "决策推演" },
    { path: "/hexagrams", label: "卦象详情" },
  ];

  return (
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-ink/10">
  <div class="max-w-2xl mx-auto px-4 h-14 flex items-center">
    <span class="font-serif text-lg font-bold text-cinnabar">观变·易经</span>
    <div class="ml-auto flex items-center gap-6">
      {navItems.map((item) => {
        const active = currentPath === item.path;
        return (
          <a
            href={item.path}
            class={`text-sm font-sans transition-colors ${
              active
                ? "text-cinnabar font-semibold"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  </div>
</nav>
  );
}