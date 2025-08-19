import Header from "@/components/Header";
import Hero from "@/components/Hero";
import VotingInfo from "@/components/VotingInfo";
import CandidateProfiles from "@/components/CandidateProfiles";
import ElectoralNews from "@/components/ElectoralNews";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <VotingInfo />
        <CandidateProfiles />
        <ElectoralNews />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
