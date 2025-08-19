import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Candidates from "./pages/Candidates";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateComparison from "./pages/CandidateComparison";
import ElectionCalendar from "./pages/ElectionCalendar";
import DemocracyHub from "./pages/DemocracyHub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidate/:id" element={<CandidateProfile />} />
          <Route path="/candidates/compare" element={<CandidateComparison />} />
          <Route path="/calendar" element={<ElectionCalendar />} />
          <Route path="/democracy-hub" element={<DemocracyHub />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
