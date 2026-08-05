import { useState } from "preact/hooks";
import Router from "preact-router";
import { NavBar } from "./components/NavBar.tsx";
import { Home } from "./routes/Home.tsx";
import { Decision } from "./routes/Decision.tsx";
import { Hexagrams } from "./routes/Hexagrams.tsx";
import { HexagramDetail } from "./routes/HexagramDetail.tsx";
import "./app.css";

export function App() {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  return (
    <div class="min-h-screen bg-paper text-ink font-sans">
      <NavBar currentPath={currentPath} />
      <Router
        onChange={(args) => setCurrentPath(args.url)}
      >
        <Home path="/" />
        <Decision path="/decision" />
        <Hexagrams path="/hexagrams" />
        <HexagramDetail path="/hexagrams/:index" />
      </Router>
    </div>
  );
}
