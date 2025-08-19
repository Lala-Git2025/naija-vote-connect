import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Users, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  const features = [
    {
      icon: Shield,
      title: "Trusted Information",
      description: "Verified political data and candidate profiles"
    },
    {
      icon: Users,
      title: "All Candidates",
      description: "Comprehensive coverage of federal and state elections"
    },
    {
      icon: Calendar,
      title: "Election Dates",
      description: "Never miss important voting deadlines"
    }
  ];

  return (
    <section className="relative min-h-[80vh] flex items-center py-12 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-[2px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Your Voice,
            <span className="block text-secondary-light">Your Democracy</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Access reliable political information, candidate profiles, and voting guides for Nigerian elections. Stay informed, vote smart.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/candidates">
                Explore Candidates
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="civic" size="lg" className="text-lg px-8 py-4 bg-background/10 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/democracy-hub">
                Voting Guide
              </Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="bg-background/10 backdrop-blur-sm border-primary-foreground/20 text-center p-6 hover:bg-background/20 transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-secondary-light" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-primary-foreground/80 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;