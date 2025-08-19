import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, TrendingUp } from "lucide-react";

const ElectoralNews = () => {
  const newsItems = [
    {
      title: "INEC Announces New Voter Registration Centers",
      excerpt: "Independent National Electoral Commission opens additional centers across 36 states to facilitate voter registration ahead of upcoming elections.",
      category: "Registration",
      timestamp: "2 hours ago",
      priority: "high",
      readTime: "3 min read"
    },
    {
      title: "Candidate Debate Schedule Released",
      excerpt: "Presidential and governorship candidates will participate in televised debates starting next month. Full schedule and broadcast details announced.",
      category: "Debates",
      timestamp: "5 hours ago",
      priority: "medium",
      readTime: "2 min read"
    },
    {
      title: "Election Security Measures Enhanced",
      excerpt: "Security agencies collaborate to ensure peaceful and credible elections. New protocols implemented for polling unit protection.",
      category: "Security",
      timestamp: "1 day ago",
      priority: "medium",
      readTime: "4 min read"
    },
    {
      title: "Youth Voter Education Campaign Launched",
      excerpt: "Civil society organizations launch nationwide campaign to educate first-time voters on the electoral process and civic responsibilities.",
      category: "Education",
      timestamp: "2 days ago",
      priority: "low",
      readTime: "3 min read"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <section id="news" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Electoral News & Updates
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest election news, announcements, and important updates
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {newsItems.map((item, index) => (
            <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300 group cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.timestamp}
                  </div>
                </div>
                
                <CardTitle className="text-xl leading-tight text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {item.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {item.readTime}
                  </span>
                  
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                    Read More
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trending Topics */}
        <div className="mt-12 bg-gradient-card rounded-lg p-6 border border-border/50">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-foreground">Trending Topics</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['Voter Registration', 'Campaign Finance', 'Electoral Reform', 'Youth Participation', 'Digital Voting'].map((topic, index) => (
              <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                #{topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* View All News Button */}
        <div className="text-center mt-8">
          <Button variant="default" size="lg" className="px-8">
            View All News
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ElectoralNews;