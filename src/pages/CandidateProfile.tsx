import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, Shield, ExternalLink, Flag, Share, Bookmark, 
  Calendar, MapPin, GraduationCap, Briefcase, Heart, 
  DollarSign, Users, MessageCircle, CheckCircle 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CandidateProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock candidate data - in real app this would come from API
  const candidate = {
    id: "1",
    name: "Dr. Amina Hassan",
    party: "Democratic Progress Party (DPP)",
    position: "Presidential Candidate",
    image: "👩🏾‍💼",
    age: 52,
    education: "PhD Political Science, University of Lagos",
    experience: "Former Lagos State Commissioner for Education (2015-2019)",
    location: "Lagos State",
    verified: true,
    bio: "Dr. Amina Hassan is a seasoned educator and policy maker with over 20 years of experience in public service. She has championed education reform and youth empowerment throughout her career.",
    keyIssues: [
      {
        issue: "Education Reform",
        stance: "Proposes free quality education from primary to tertiary level with improved teacher training and infrastructure development.",
        details: "Plans to increase education budget to 25% of total government spending, establish technology centers in rural areas, and implement teacher incentive programs."
      },
      {
        issue: "Healthcare",
        stance: "Universal healthcare coverage for all Nigerians with focus on preventive medicine and rural healthcare access.",
        details: "Aims to build 500 new primary healthcare centers, train 10,000 community health workers, and establish telemedicine programs."
      },
      {
        issue: "Economic Development",
        stance: "Job creation through technology and agriculture, supporting small businesses and youth entrepreneurship.",
        details: "Plans to create 2 million jobs in 4 years, establish technology hubs in all states, and provide low-interest loans to young entrepreneurs."
      },
      {
        issue: "Security",
        stance: "Community-based security approach with improved intelligence gathering and youth engagement programs.",
        details: "Proposes community policing, youth corps programs, and investment in border security technology."
      }
    ],
    endorsements: [
      { organization: "Nigeria Labour Congress", type: "Union" },
      { organization: "Academic Staff Union of Universities", type: "Professional" },
      { organization: "National Association of Women Judges", type: "Professional" },
      { organization: "Nigeria Medical Association", type: "Professional" }
    ],
    funding: {
      totalRaised: "₦2.5 billion",
      sources: [
        { source: "Individual Donations", amount: "₦1.2 billion", percentage: 48 },
        { source: "Party Funding", amount: "₦800 million", percentage: 32 },
        { source: "Corporate Donations", amount: "₦500 million", percentage: 20 }
      ]
    },
    recentNews: [
      {
        title: "Dr. Hassan Unveils Comprehensive Education Policy",
        outlet: "The Guardian Nigeria",
        date: "2 days ago",
        summary: "Presidential candidate outlines plan for educational transformation including technology integration and teacher development programs."
      },
      {
        title: "Town Hall Meeting in Kano Addresses Security Concerns",
        outlet: "Daily Trust",
        date: "1 week ago",
        summary: "Candidate discusses community-based security solutions with traditional rulers and youth leaders."
      },
      {
        title: "Healthcare Initiative Gains Support from Medical Professionals",
        outlet: "Punch Newspapers",
        date: "2 weeks ago",
        summary: "Nigeria Medical Association endorses universal healthcare proposals, citing detailed implementation strategy."
      }
    ],
    qna: [
      {
        question: "How do you plan to address youth unemployment?",
        answer: "My administration will create 2 million jobs through strategic investments in technology, agriculture, and manufacturing. We'll establish technology hubs in all 36 states, provide low-interest loans to young entrepreneurs, and partner with private sector for skills development programs.",
        date: "1 week ago"
      },
      {
        question: "What is your stance on restructuring Nigeria?",
        answer: "I support constitutional reforms that promote true federalism while maintaining our unity. This includes fiscal federalism, devolution of powers to states, and strengthening local governments to bring governance closer to the people.",
        date: "2 weeks ago"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/candidates" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Link>
        </div>

        {/* Candidate Header */}
        <Card className="shadow-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-card rounded-full flex items-center justify-center text-6xl">
                  {candidate.image}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-3xl font-bold text-foreground">{candidate.name}</h1>
                      {candidate.verified && (
                        <Shield className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">{candidate.position}</p>
                    <Badge variant="outline" className="mb-2">{candidate.party}</Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="w-4 h-4" />
                      Report
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Age: {candidate.age}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.education}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mt-4">{candidate.bio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="endorsements">Support</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="news">News & Q&A</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-primary" />
                      Background & Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{candidate.experience}</p>
                    <p className="text-foreground">{candidate.bio}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Key Policy Positions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {candidate.keyIssues.slice(0, 2).map((issue, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h3 className="font-semibold text-foreground mb-2">{issue.issue}</h3>
                        <p className="text-muted-foreground text-sm">{issue.stance}</p>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Policy Positions
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium">20+ years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Endorsements</span>
                      <span className="font-medium">{candidate.endorsements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Funds Raised</span>
                      <span className="font-medium">{candidate.funding.totalRaised}</span>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    This profile is verified by our fact-checking team. 
                    <Button variant="link" className="p-0 h-auto text-primary">
                      View sources
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="issues">
            <div className="space-y-6">
              {candidate.keyIssues.map((issue, index) => (
                <Card key={index} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-xl">{issue.issue}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Position</h3>
                      <p className="text-muted-foreground">{issue.stance}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Implementation Plan</h3>
                      <p className="text-muted-foreground">{issue.details}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="endorsements">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Organizational Endorsements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {candidate.endorsements.map((endorsement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <h3 className="font-medium text-foreground">{endorsement.organization}</h3>
                        <p className="text-sm text-muted-foreground">{endorsement.type}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Public Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold text-primary">78%</div>
                    <p className="text-muted-foreground">Approval Rating</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Based on recent polls</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="funding">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-primary" />
                  Campaign Funding Transparency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-2">{candidate.funding.totalRaised}</div>
                  <p className="text-muted-foreground">Total Funds Raised</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Funding Sources</h3>
                  {candidate.funding.sources.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-foreground">{source.source}</span>
                        <span className="font-medium">{source.amount}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    All funding information is verified and updated monthly in compliance with INEC regulations.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Recent News</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {candidate.recentNews.map((news, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-b-0">
                        <h3 className="font-medium text-foreground mb-2">{news.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{news.summary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{news.outlet}</span>
                          <span>{news.date}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                      Q&A Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {candidate.qna.map((qa, index) => (
                      <div key={index} className="space-y-3">
                        <div>
                          <h3 className="font-medium text-foreground mb-2">Q: {qa.question}</h3>
                          <p className="text-sm text-muted-foreground">{qa.answer}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">{qa.date}</div>
                        {index < candidate.qna.length - 1 && <Separator />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateProfile;