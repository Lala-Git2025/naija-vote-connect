import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, FileText, CheckCircle } from "lucide-react";

const VotingInfo = () => {
  const votingSteps = [
    {
      icon: FileText,
      title: "Check Registration",
      description: "Verify your voter registration status and polling unit details",
      action: "Check Status"
    },
    {
      icon: MapPin,
      title: "Find Your Polling Unit",
      description: "Locate your designated polling station and get directions",
      action: "Find Location"
    },
    {
      icon: Clock,
      title: "Know the Dates",
      description: "Stay updated on election dates and voting hours",
      action: "View Calendar"
    },
    {
      icon: CheckCircle,
      title: "Required Documents",
      description: "Learn what you need to bring on election day",
      action: "View Requirements"
    }
  ];

  return (
    <section id="voting" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How to Vote
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know to participate in Nigeria's democratic process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {votingSteps.map((step, index) => (
            <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {step.description}
                </p>
                <Button variant="outline" className="w-full">
                  {step.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-12 bg-gradient-accent rounded-lg p-6 border border-secondary/20">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <CheckCircle className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-accent-foreground mb-2">
                Election Day Reminder
              </h3>
              <p className="text-accent-foreground/80 leading-relaxed">
                Polling units open at 8:30 AM and close at 2:30 PM. Make sure to arrive early with your PVC and valid identification. 
                Your vote is secret and valuable – exercise your democratic right responsibly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VotingInfo;