import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PersonalizedDashboard from "@/components/PersonalizedDashboard";
import SyncStatus from "@/components/SyncStatus";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    // Check if user has completed onboarding
    if (user) {
      const onboardingStatus = localStorage.getItem('civicLensOnboarded');
      if (!onboardingStatus) {
        navigate('/onboarding');
      } else {
        setHasOnboarded(true);
      }
    }
  }, [navigate, user, loading]);

  // Show loading state while checking auth and onboarding status
  if (loading || (!user && hasOnboarded === null)) {
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

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {hasOnboarded ? <PersonalizedDashboard /> : <Hero />}
        <div className="container mx-auto px-4 py-2">
          <SyncStatus provider="inec_api" className="justify-center" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
