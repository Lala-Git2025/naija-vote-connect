import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, Filter, MapPin, Users, Calendar, 
  GraduationCap, Briefcase, Star, ArrowRight,
  CheckCircle, Bookmark, Share
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useSupabaseCandidates, useSupabaseRaces } from "@/hooks/useSupabaseElectionData";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const { data: candidates, isLoading } = useSupabaseCandidates();
  const { data: races } = useSupabaseRaces();

  // Get last sync time for display
  const getLastCandidateSync = () => {
    if (!candidates?.length) return null;
    return candidates[0]?.updatedAt;
  };

  // Mock candidates data for fallback
  const mockCandidates = [
    {
      id: "1",
      name: "Dr. Amina Hassan",
      party: "Democratic Progress Party (DPP)",
      position: "Presidential Candidate",
      state: "Lagos",
      image: "👩🏾‍💼",
      age: 52,
      education: "PhD Political Science, University of Lagos",
      experience: "Former Lagos State Commissioner for Education (2015-2019)",
      verified: true,
      keyIssues: ["Education Reform", "Healthcare", "Economic Development"],
      approvalRating: 78,
      endorsements: 12,
      campaignPromise: "Quality education for all Nigerian children and comprehensive healthcare reform"
    },
    {
      id: "2",
      name: "Hon. Kemi Adebayo",
      party: "People's Progressive Party (PPP)",
      position: "Presidential Candidate",
      state: "Ogun",
      image: "👩🏾‍🏫",
      age: 48,
      education: "MBA Business Administration, INSEAD",
      experience: "Former Senator, Ogun Central (2011-2019)",
      verified: true,
      keyIssues: ["Women's Rights", "Agricultural Development", "Youth Empowerment"],
      approvalRating: 72,
      endorsements: 8,
      campaignPromise: "Empowering Nigerian youth and women through inclusive economic policies"
    },
    {
      id: "3",
      name: "Chief Emeka Okafor",
      party: "All Progressives Congress (APC)",
      position: "Lagos State Governorship",
      state: "Lagos",
      image: "👨🏾‍💼",
      age: 55,
      education: "LLB Law, University of Nigeria",
      experience: "Business Executive, Former Local Government Chairman",
      verified: true,
      keyIssues: ["Infrastructure Development", "Business Growth", "Urban Planning"],
      approvalRating: 65,
      endorsements: 15,
      campaignPromise: "Transform Lagos into a world-class megacity with sustainable infrastructure"
    },
    {
      id: "4",
      name: "Dr. Fatima Umar",
      party: "New Nigeria Peoples Party (NNPP)",
      position: "Kano State Governorship",
      state: "Kano",
      image: "👩🏾‍⚕️",
      age: 44,
      education: "MD Medicine, Ahmadu Bello University",
      experience: "Healthcare Administrator, Former Health Commissioner",
      verified: true,
      keyIssues: ["Healthcare Access", "Rural Development", "Education"],
      approvalRating: 69,
      endorsements: 6,
      campaignPromise: "Bringing quality healthcare and education to every corner of Kano State"
    },
    {
      id: "5",
      name: "Engr. David Okonkwo",
      party: "Labour Party (LP)",
      position: "Anambra State Senate",
      state: "Anambra",
      image: "👨🏾‍💻",
      age: 41,
      education: "B.Eng Civil Engineering, University of Nigeria",
      experience: "Infrastructure Development Expert, Former Commissioner",
      verified: false,
      keyIssues: ["Infrastructure", "Technology", "Job Creation"],
      approvalRating: 58,
      endorsements: 4,
      campaignPromise: "Leveraging technology and infrastructure for sustainable development"
    },
    {
      id: "6",
      name: "Mrs. Sarah Abdullahi",
      party: "Social Democratic Party (SDP)",
      position: "FCT House of Representatives",
      state: "FCT",
      image: "👩🏾‍💼",
      age: 38,
      education: "LLM International Law, University of Abuja",
      experience: "Human Rights Lawyer, Civil Society Leader",
      verified: true,
      keyIssues: ["Human Rights", "Gender Equality", "Justice Reform"],
      approvalRating: 73,
      endorsements: 9,
      campaignPromise: "Advocating for justice, equality, and human rights for all citizens"
    }
  ];

  const nigerianStates = [
    "All States", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", 
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  const positions = [
    { value: "all", label: "All Positions" },
    { value: "presidential", label: "Presidential" },
    { value: "governorship", label: "Governorship" },
    { value: "senate", label: "Senate" },
    { value: "house", label: "House of Representatives" },
    { value: "assembly", label: "State Assembly" }
  ];

  // Normalize candidate data to handle both Supabase and mock data types
  const normalizeCandidate = (candidate: any) => ({
    ...candidate,
    position: candidate.position || `${candidate.positions?.[0]?.category || 'Political'} Candidate`,
    state: candidate.state || candidate.races?.[0] || 'Nigeria',
    keyIssues: candidate.keyIssues || candidate.positions?.slice(0, 3).map((p: any) => p.issue) || ['Policy Reform'],
    approvalRating: candidate.approvalRating || 70,
    endorsements: candidate.endorsements?.length || candidate.endorsements || 0,
    image: candidate.image || candidate.photo || '👤',
    verified: candidate.verified !== undefined ? candidate.verified : candidate.inecVerified,
    campaignPromise: candidate.campaignPromise || candidate.biography || 'Working for the people',
    age: candidate.age,
    education: candidate.education || 'Education details available',
    experience: candidate.experience || 'Experience details available'
  });

  const candidatesData = candidates?.map(normalizeCandidate) || mockCandidates.map(normalizeCandidate);
  const filteredCandidates = candidatesData.filter(candidate => {
    const keyIssuesArray = Array.isArray(candidate.keyIssues) ? candidate.keyIssues : [candidate.keyIssues];
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         keyIssuesArray.some((issue: string) => issue.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPosition = filterPosition === "all" || 
                           candidate.position.toLowerCase().includes(filterPosition.toLowerCase());
    
    const matchesState = filterState === "all" || 
                        candidate.state.toLowerCase() === filterState.toLowerCase();
    
    return matchesSearch && matchesPosition && matchesState;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'approval':
        return (b.approvalRating || 0) - (a.approvalRating || 0);
      case 'endorsements':
        const aEndorsements = typeof a.endorsements === 'number' ? a.endorsements : 0;
        const bEndorsements = typeof b.endorsements === 'number' ? b.endorsements : 0;
        return bEndorsements - aEndorsements;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-4">Candidate Profiles</h1>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explore verified profiles of candidates running for various positions across Nigeria. 
                Compare their backgrounds, positions on key issues, and track records.
              </p>
            </div>
            <SyncStatusIndicator 
              lastUpdated={getLastCandidateSync()}
              dataType="candidates"
              sourceUrl="https://www.inecnigeria.org/candidates/"
              className="flex-shrink-0 mt-2"
            />
          </div>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map(position => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {nigerianStates.map(state => (
                  <SelectItem key={state} value={state === "All States" ? "all" : state.toLowerCase()}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="approval">Approval Rating</SelectItem>
                <SelectItem value="endorsements">Endorsements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </p>
          <div className="flex space-x-2">
            <Link to="/candidates/compare">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Compare Candidates
              </Button>
            </Link>
          </div>
        </div>

        {/* Candidates Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map(candidate => (
            <Card key={candidate.id} className="shadow-card hover:shadow-elevated transition-all duration-200">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-card rounded-full flex items-center justify-center text-3xl">
                    {candidate.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg leading-tight mb-1">
                          {candidate.name}
                          {candidate.verified && (
                            <CheckCircle className="w-4 h-4 text-primary inline ml-2" />
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{candidate.party}</Badge>
                  {candidate.verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      INEC Verified
                    </Badge>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{candidate.state}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {candidate.age && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Age: {candidate.age}</span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{Array.isArray(candidate.education) ? candidate.education[0] : candidate.education}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{Array.isArray(candidate.experience) ? candidate.experience[0] : candidate.experience}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground mb-2 text-sm">Key Issues:</h3>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(candidate.keyIssues) ? candidate.keyIssues : [candidate.keyIssues]).map((issue, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    "{candidate.campaignPromise}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-warning fill-current" />
                    <span className="font-medium">{candidate.approvalRating || 70}%</span>
                    <span className="text-muted-foreground">approval</span>
                  </div>
                  <div className="text-muted-foreground">
                    {typeof candidate.endorsements === 'number' ? candidate.endorsements : 0} endorsements
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link to={`/candidate/${candidate.id}`} className="flex-1">
                    <Button className="w-full">
                      View Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No candidates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterPosition("all");
              setFilterState("all");
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-12 shadow-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Make an Informed Choice</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Use our comparison tool to analyze candidates side-by-side, or explore our Democracy Hub 
              for guides on making informed voting decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/candidates/compare">
                <Button size="lg">
                  <Users className="w-5 h-5 mr-2" />
                  Compare Candidates
                </Button>
              </Link>
              <Link to="/democracy-hub">
                <Button variant="outline" size="lg">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Voting Guides
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Candidates;