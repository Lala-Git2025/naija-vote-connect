import Header from "@/components/Header";
import PersonalizedDashboard from "@/components/PersonalizedDashboard";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PersonalizedDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
