import { Router } from "preact-router";
import { Home } from "./routes/Home.tsx";
import { Daily } from "./routes/Daily.tsx";
import { Hexagrams } from "./routes/Hexagrams.tsx";
import { Decision } from "./routes/Decision.tsx";
import { HexagramDetail } from "./routes/HexagramDetail.tsx";
import { TopNav } from "./components/TopNav.tsx";

export function App() {
  return (
    <div class="min-h-screen bg-paper">
      <TopNav />
      <div class="pt-20"> 
       <Router>
          <Home path="/" />
          <Daily path="/daily" />
          <Hexagrams path="/hexagrams" />
          <Decision path="/decision" />
          <HexagramDetail path="/hexagrams/:index" />
       </Router>
     </div>
   </div>
  );
}