import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Search, Filter, ArrowRight, 
  GraduationCap, Briefcase, DollarSign, 
  Heart, CheckCircle, XCircle, Minus 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const CandidateComparison = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [compareView, setCompareView] = useState<'select' | 'compare'>('select');

  // Mock candidates data
  const candidates = [
    {
      id: "1",
      name: "Dr. Amina Hassan",
      party: "DPP",
      position: "Presidential",
      image: "👩🏾‍💼",
      education: "PhD Political Science",
      experience: "Former Commissioner",
      funding: "₦2.5B",
      keyIssues: ["Education", "Healthcare", "Economy"],
      stances: {
        education: "Free education for all",
        healthcare: "Universal healthcare",
        economy: "Job creation through tech",
        security: "Community policing"
      },
      endorsements: 12,
      approvalRating: 78
    },
    {
      id: "2",
      name: "Hon. Kemi Adebayo",
      party: "PPP",
      position: "Presidential",
      image: "👩🏾‍🏫",
      education: "MBA Business Administration",
      experience: "Former Senator",
      funding: "₦1.8B",
      keyIssues: ["Women's Rights", "Agriculture", "Youth"],
      stances: {
        education: "Technology integration in schools",
        healthcare: "Private-public partnerships",
        economy: "Agricultural development",
        security: "Border security focus"
      },
      endorsements: 8,
      approvalRating: 72
    },
    {
      id: "3",
      name: "Chief Emeka Okafor",
      party: "APC",
      position: "Governorship",
      image: "👨🏾‍💼",
      education: "LLB Law",
      experience: "Business Executive",
      funding: "₦900M",
      keyIssues: ["Infrastructure", "Business", "Trade"],
      stances: {
        education: "Private sector partnerships",
        healthcare: "Insurance-based system",
        economy: "Business-friendly policies",
        security: "Technology-driven security"
      },
      endorsements: 15,
      approvalRating: 65
    },
    {
      id: "4",
      name: "Dr. Fatima Umar",
      party: "NNPP",
      position: "Governorship",
      image: "👩🏾‍⚕️",
      education: "MD Medicine",
      experience: "Healthcare Administrator",
      funding: "₦650M",
      keyIssues: ["Healthcare", "Education", "Rural Development"],
      stances: {
        education: "Rural education focus",
        healthcare: "Primary healthcare emphasis",
        economy: "Rural economic development",
        security: "Community engagement"
      },
      endorsements: 6,
      approvalRating: 69
    }
  ];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.party.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === "all" || candidate.position.toLowerCase() === filterPosition;
    return matchesSearch && matchesPosition;
  });

  const handleCandidateSelect = (candidateId: string) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else if (selectedCandidates.length < 3) {
      setSelectedCandidates([...selectedCandidates, candidateId]);
    }
  };

  const selectedCandidateData = selectedCandidates.map(id => 
    candidates.find(c => c.id === id)
  ).filter(Boolean);

  const getStanceComparison = (issue: string) => {
    return selectedCandidateData.map(candidate => ({
      id: candidate!.id,
      name: candidate!.name,
      stance: candidate!.stances[issue as keyof typeof candidate.stances]
    }));
  };

  if (compareView === 'compare' && selectedCandidates.length >= 2) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Candidate Comparison</h1>
            <Button 
              variant="outline" 
              onClick={() => setCompareView('select')}
            >
              Change Selection
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">Policy Issues</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedCandidateData.length}, 1fr)` }}>
                {selectedCandidateData.map(candidate => (
                  <Card key={candidate!.id} className="shadow-card">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 bg-gradient-card rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                        {candidate!.image}
                      </div>
                      <CardTitle className="text-xl">{candidate!.name}</CardTitle>
                      <Badge variant="outline">{candidate!.party}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>Education</span>
                        </div>
                        <p className="text-foreground">{candidate!.education}</p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Experience</span>
                        </div>
                        <p className="text-foreground">{candidate!.experience}</p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <Heart className="w-4 h-4" />
                          <span>Key Issues</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {candidate!.keyIssues.map((issue, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Link to={`/candidate/${candidate!.id}`}>
                        <Button variant="outline" className="w-full">
                          View Full Profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="issues">
              <div className="space-y-6">
                {['education', 'healthcare', 'economy', 'security'].map(issue => (
                  <Card key={issue} className="shadow-card">
                    <CardHeader>
                      <CardTitle className="capitalize">{issue}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCandidateData.length}, 1fr)` }}>
                        {getStanceComparison(issue).map(comparison => (
                          <div key={comparison.id} className="space-y-2">
                            <h3 className="font-medium text-foreground">{comparison.name}</h3>
                            <p className="text-muted-foreground text-sm">{comparison.stance}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="funding">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary" />
                    Campaign Funding Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedCandidateData.length}, 1fr)` }}>
                    {selectedCandidateData.map(candidate => (
                      <div key={candidate!.id} className="text-center space-y-2">
                        <h3 className="font-medium text-foreground">{candidate!.name}</h3>
                        <div className="text-2xl font-bold text-primary">{candidate!.funding}</div>
                        <p className="text-sm text-muted-foreground">Total Raised</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Endorsements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedCandidateData.map(candidate => (
                        <div key={candidate!.id} className="flex items-center justify-between">
                          <span className="text-foreground">{candidate!.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{candidate!.endorsements}</span>
                            <span className="text-sm text-muted-foreground">endorsements</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Approval Ratings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedCandidateData.map(candidate => (
                        <div key={candidate!.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">{candidate!.name}</span>
                            <span className="font-medium">{candidate!.approvalRating}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${candidate!.approvalRating}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Compare Candidates</h1>
          <p className="text-muted-foreground mb-6">
            Select 2-3 candidates to compare their positions, funding, and endorsements
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="presidential">Presidential</SelectItem>
                <SelectItem value="governorship">Governorship</SelectItem>
                <SelectItem value="senate">Senate</SelectItem>
                <SelectItem value="house">House of Reps</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selection Status */}
          {selectedCandidates.length > 0 && (
            <div className="flex items-center justify-center space-x-4 mb-6">
              <span className="text-muted-foreground">
                Selected: {selectedCandidates.length}/3
              </span>
              {selectedCandidates.length >= 2 && (
                <Button onClick={() => setCompareView('compare')}>
                  Compare Selected
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Candidate Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map(candidate => (
            <Card 
              key={candidate.id} 
              className={`shadow-card cursor-pointer transition-all duration-200 ${
                selectedCandidates.includes(candidate.id) 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-elevated'
              }`}
              onClick={() => handleCandidateSelect(candidate.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-card rounded-full flex items-center justify-center text-2xl">
                      {candidate.image}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    </div>
                  </div>
                  <Checkbox 
                    checked={selectedCandidates.includes(candidate.id)}
                    disabled={!selectedCandidates.includes(candidate.id) && selectedCandidates.length >= 3}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{candidate.party}</Badge>
                  <span className="text-sm text-muted-foreground">{candidate.funding}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{candidate.education}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{candidate.experience}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Key Issues:</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.keyIssues.slice(0, 3).map((issue, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Approval: {candidate.approvalRating}%</span>
                  <span className="text-muted-foreground">{candidate.endorsements} endorsements</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No candidates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CandidateComparison;