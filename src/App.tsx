import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import "./services/election-service"; // Initialize data providers
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Admin from "./pages/Admin";
import Candidates from "./pages/Candidates";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateComparison from "./pages/CandidateComparison";
import ElectionCalendar from "./pages/ElectionCalendar";
import DemocracyHub from "./pages/DemocracyHub";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/candidate/:id" element={<CandidateProfile />} />
        <Route path="/candidates/compare" element={<CandidateComparison />} />
        <Route path="/calendar" element={<ElectionCalendar />} />
        <Route path="/democracy-hub" element={<DemocracyHub />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
