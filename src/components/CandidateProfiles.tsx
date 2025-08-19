import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Award, MapPin, Eye } from "lucide-react";

const CandidateProfiles = () => {
  const candidates = [
    {
      name: "Dr. Amina Hassan",
      party: "Democratic Progress Party",
      position: "Presidential Candidate",
      state: "Kano State",
      experience: "Former Minister of Education",
      keyPolicies: ["Education Reform", "Healthcare Access", "Youth Empowerment"],
      image: "👩🏾‍💼"
    },
    {
      name: "Eng. Chidi Okafor",
      party: "National Unity Alliance",
      position: "Presidential Candidate", 
      state: "Anambra State",
      experience: "Infrastructure Development Expert",
      keyPolicies: ["Infrastructure", "Economic Growth", "Technology"],
      image: "👨🏾‍💼"
    },
    {
      name: "Prof. Kemi Adebayo",
      party: "Progressive People's Party",
      position: "Governorship Candidate",
      state: "Lagos State",
      experience: "University Professor & Policy Expert",
      keyPolicies: ["Urban Planning", "Environmental Policy", "Innovation"],
      image: "👩🏾‍🏫"
    }
  ];

  return (
    <section id="candidates" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet the Candidates
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about the candidates running for office and their policy positions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate, index) => (
            <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader className="text-center">
                {/* Profile Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-card rounded-full flex items-center justify-center text-4xl border-4 border-primary/10">
                    {candidate.image}
                  </div>
                </div>
                
                <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                  {candidate.name}
                </CardTitle>
                
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-sm">
                    {candidate.party}
                  </Badge>
                  <p className="text-sm text-muted-foreground font-medium">
                    {candidate.position}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Location & Experience */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{candidate.state}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <Award className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{candidate.experience}</span>
                  </div>
                </div>

                {/* Key Policies */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Key Policies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.keyPolicies.map((policy, policyIndex) => (
                      <Badge key={policyIndex} variant="outline" className="text-xs">
                        {policy}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" className="w-full mt-4">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="default" size="lg" className="px-8">
            View All Candidates
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CandidateProfiles;