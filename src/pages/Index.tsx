import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PersonalizedDashboard from "@/components/PersonalizedDashboard";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingStatus = localStorage.getItem('civicLensOnboarded');
    if (!onboardingStatus) {
      navigate('/onboarding');
    } else {
      setHasOnboarded(true);
    }
  }, [navigate]);

  // Show loading state while checking onboarding status
  if (hasOnboarded === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 text-primary-foreground">🗳️</div>
          </div>
          <p className="text-muted-foreground">Loading CivicLens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {hasOnboarded ? <PersonalizedDashboard /> : <Hero />}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
