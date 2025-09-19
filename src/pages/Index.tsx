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
    console.log('Index useEffect triggered:', { user: !!user, loading, hasOnboarded });
    
    // Redirect to auth if not logged in
    if (!loading && !user) {
      console.log('Not authenticated, redirecting to /auth');
      navigate('/auth');
      return;
    }

    // Check if user has completed onboarding
    if (user && !loading) {
      const onboardingStatus = localStorage.getItem('civicLensOnboarded');
      console.log('Onboarding status check:', onboardingStatus);
      console.log('Current hasOnboarded state:', hasOnboarded);
      
      if (!onboardingStatus) {
        console.log('No onboarding status, redirecting to /onboarding');
        setHasOnboarded(false);
        navigate('/onboarding');
      } else {
        console.log('User has onboarded, setting hasOnboarded to true');
        setHasOnboarded(true);
      }
    }
  }, [navigate, user, loading]);

  // Additional useEffect to check localStorage changes
  useEffect(() => {
    const checkOnboardingStatus = () => {
      const status = localStorage.getItem('civicLensOnboarded');
      console.log('Checking onboarding status on mount/change:', status);
      if (status && user && !loading) {
        console.log('Setting hasOnboarded to true from storage check');
        setHasOnboarded(true);
      }
    };

    checkOnboardingStatus();
    
    // Listen for storage changes
    window.addEventListener('storage', checkOnboardingStatus);
    return () => window.removeEventListener('storage', checkOnboardingStatus);
  }, [user, loading]);

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

  console.log('Rendering Index with hasOnboarded:', hasOnboarded);
  
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
