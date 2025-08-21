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
  DollarSign, Users, MessageCircle, CheckCircle, Loader2, AlertCircle 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSupabaseCandidate } from "@/hooks/useSupabaseCandidate";

const CandidateProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const { data: candidate, isLoading, error } = useSupabaseCandidate(id);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading candidate profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/candidates" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </Link>
          </div>
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
              <p className="text-muted-foreground mb-4">
                We encountered an error while loading the candidate profile.
              </p>
              <Button asChild>
                <Link to="/candidates">Return to Candidates</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Candidate not found
  if (!candidate) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/candidates" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </Link>
          </div>
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Candidate Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The candidate profile you're looking for could not be found.
              </p>
              <Button asChild>
                <Link to="/candidates">Browse All Candidates</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Get candidate's manifesto sections
  const manifestoSections = Array.isArray(candidate.manifestos?.[0]?.sections) 
    ? candidate.manifestos[0].sections 
    : (candidate.manifestos?.[0]?.sections ? [candidate.manifestos[0].sections] : []);
  
  // Get candidate's race information
  const race = candidate.races;
  
  // Get fact checks related to this candidate
  const relatedFactChecks = candidate.fact_checks || [];

  // Create key issues from manifesto or fallback
  const keyIssues = manifestoSections.length > 0 
    ? manifestoSections.slice(0, 4).map((section: any) => ({
        issue: section.heading || section.topic || 'Policy Area',
        stance: section.content?.substring(0, 200) || 'Policy details available',
        details: section.content || 'Full policy details in manifesto'
      }))
    : [
        {
          issue: "Governance & Leadership",
          stance: "Committed to transparent and accountable governance",
          details: "Full policy details will be available in the official manifesto"
        }
      ];

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
                  {candidate.avatar_url ? (
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={candidate.avatar_url} alt={candidate.name} />
                      <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <span>👤</span>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-3xl font-bold text-foreground">{candidate.name}</h1>
                      {!candidate.pending_verification && (
                        <Shield className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">
                      {candidate.office || race?.name || 'Political Candidate'}
                    </p>
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
                  {candidate.age && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Age: {candidate.age}</span>
                    </div>
                  )}
                  {(candidate.state || race?.state) && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{candidate.state || race?.state}</span>
                    </div>
                  )}
                  {candidate.education && (
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span>{candidate.education}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-muted-foreground mt-4">
                  {candidate.experience || candidate.manifesto || 'Detailed biography and policy positions available below.'}
                </p>
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
                    <p className="text-muted-foreground mb-4">{candidate.experience || 'Experience details will be available soon.'}</p>
                    <p className="text-foreground">{candidate.occupation || 'Professional background information available.'}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Key Policy Positions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {keyIssues.slice(0, 2).map((issue, index) => (
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
                      <span className="font-medium">{candidate.experience ? 'Available' : 'TBA'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manifestos</span>
                      <span className="font-medium">{candidate.manifestos?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fact Checks</span>
                      <span className="font-medium">{relatedFactChecks.length}</span>
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
              {keyIssues.map((issue, index) => (
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
                    Fact Checks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedFactChecks.length > 0 ? (
                    relatedFactChecks.map((factCheck, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">{factCheck.claim.substring(0, 60)}...</h3>
                          <p className="text-sm text-muted-foreground">{factCheck.verdict}</p>
                        </div>
                        <CheckCircle className={`w-5 h-5 ${factCheck.rating === 'Verified' ? 'text-green-500' : 'text-yellow-500'}`} />
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No fact checks available yet</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>INEC Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold text-primary">
                      {candidate.pending_verification ? '⏳' : '✅'}
                    </div>
                    <p className="text-muted-foreground">
                      {candidate.pending_verification ? 'Pending Verification' : 'INEC Verified'}
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${candidate.pending_verification ? 'bg-yellow-500 w-1/2' : 'bg-green-500 w-full'}`}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {candidate.pending_verification ? 'Verification in progress' : 'Official INEC candidate'}
                    </p>
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
                  Manifesto & Policy Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {candidate.manifestos?.length || 0}
                  </div>
                  <p className="text-muted-foreground">Policy Documents Available</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Available Manifestos</h3>
                  {candidate.manifestos && candidate.manifestos.length > 0 ? (
                    candidate.manifestos.map((manifesto, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-foreground">{manifesto.source}</span>
                          {manifesto.source_url && (
                            <Button variant="link" size="sm" asChild>
                              <a href={manifesto.source_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Published: {manifesto.published_at ? new Date(manifesto.published_at).toLocaleDateString() : 'Date not available'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No manifestos available yet</p>
                  )}
                </div>
                
                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    All manifesto information is sourced directly from official party websites and verified sources.
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
                    <CardTitle>Manifesto Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {manifestoSections.length > 0 ? (
                      manifestoSections.map((section: any, index: number) => (
                        <div key={index} className="border-b border-border pb-4 last:border-b-0">
                          <h3 className="font-medium text-foreground mb-2">
                            {section.heading || section.topic || `Section ${index + 1}`}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {section.content?.substring(0, 200) || 'Content available in full manifesto'}
                            {section.content && section.content.length > 200 && '...'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No manifesto sections available yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                      Candidate Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-foreground mb-2">External INEC ID</h3>
                        <p className="text-sm text-muted-foreground">
                          {candidate.external_id_inec || 'Not available'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-2">Party Code</h3>
                        <p className="text-sm text-muted-foreground">
                          {candidate.party_code || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-2">Status</h3>
                        <Badge variant={candidate.status === 'active' ? 'default' : 'secondary'}>
                          {candidate.status || 'Active'}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        Last updated: {candidate.updated_at ? new Date(candidate.updated_at).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
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