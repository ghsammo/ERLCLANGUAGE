import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";

function App() {
  return (
    <TooltipProvider>
      <Home />
    </TooltipProvider>
  );
}

export default App;