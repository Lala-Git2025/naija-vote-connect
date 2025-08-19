import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, Search, Filter, Play, Download, 
  GraduationCap, Users, Scale, FileText, 
  Video, Headphones, ExternalLink, Clock,
  Star, ThumbsUp, Eye, Share
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DemocracyHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Mock content data
  const content = [
    {
      id: "1",
      title: "Understanding Your Voting Rights",
      description: "A comprehensive guide to voting rights and responsibilities in Nigeria",
      type: "guide",
      category: "voting",
      duration: "15 min read",
      rating: 4.8,
      views: 12500,
      difficulty: "beginner",
      tags: ["voting", "rights", "constitution"],
      content: {
        summary: "Learn about your fundamental voting rights as a Nigerian citizen",
        sections: [
          "Constitutional basis of voting rights",
          "Who can vote and registration process",
          "Voting procedures and ballot privacy",
          "Protection against voter intimidation",
          "Reporting violations and seeking help"
        ]
      },
      author: "Electoral Institute of Nigeria",
      publishDate: "2024-01-10"
    },
    {
      id: "2",
      title: "How Elections Work in Nigeria",
      description: "Step-by-step explanation of the Nigerian electoral process",
      type: "video",
      category: "elections",
      duration: "12 minutes",
      rating: 4.6,
      views: 8900,
      difficulty: "intermediate",
      tags: ["elections", "INEC", "process"],
      content: {
        summary: "Visual guide to Nigeria's electoral system and processes",
        videoId: "example-video-id"
      },
      author: "Civic Education Initiative",
      publishDate: "2024-01-05"
    },
    {
      id: "3",
      title: "Political Parties and Ideologies",
      description: "Understanding different political parties and their core beliefs",
      type: "article",
      category: "parties",
      duration: "20 min read",
      rating: 4.5,
      views: 6700,
      difficulty: "intermediate",
      tags: ["parties", "ideology", "platforms"],
      content: {
        summary: "Explore the political landscape and party differences in Nigeria"
      },
      author: "Centre for Democratic Studies",
      publishDate: "2023-12-28"
    },
    {
      id: "4",
      title: "Youth Participation in Democracy",
      description: "How young Nigerians can engage in the democratic process",
      type: "podcast",
      category: "participation",
      duration: "25 minutes",
      rating: 4.7,
      views: 4200,
      difficulty: "beginner",
      tags: ["youth", "participation", "engagement"],
      content: {
        summary: "Inspiring stories and practical tips for youth political engagement"
      },
      author: "Youth Democratic Forum",
      publishDate: "2024-01-08"
    },
    {
      id: "5",
      title: "Understanding Campaign Finance",
      description: "How political campaigns are funded and regulated",
      type: "guide",
      category: "transparency",
      duration: "18 min read",
      rating: 4.4,
      views: 3800,
      difficulty: "advanced",
      tags: ["finance", "transparency", "regulation"],
      content: {
        summary: "Deep dive into campaign finance laws and transparency requirements"
      },
      author: "Transparency Nigeria",
      publishDate: "2024-01-03"
    }
  ];

  const faqs = [
    {
      question: "How do I register to vote?",
      answer: "To register to vote in Nigeria, you must be 18 years or older and a Nigerian citizen. Visit your local INEC office with valid identification (National ID, driver's license, or international passport). You can also register during special registration periods announced by INEC. The process is free and typically takes 15-30 minutes."
    },
    {
      question: "What documents do I need to vote?",
      answer: "You need your Permanent Voter Card (PVC) to vote. This is issued after successful voter registration. On election day, you may also be asked to provide additional identification for verification purposes."
    },
    {
      question: "How do I find my polling unit?",
      answer: "You can find your polling unit by visiting the INEC website and using their polling unit locator tool. Enter your voter registration details or address to find your assigned polling unit. You can also check your PVC which contains this information."
    },
    {
      question: "What is the voting process on election day?",
      answer: "On election day: (1) Arrive at your polling unit early, (2) Join the queue with your PVC, (3) Present your PVC for verification, (4) Receive your ballot paper, (5) Mark your choice in private, (6) Place your ballot in the ballot box, (7) Your finger will be marked with ink to prevent multiple voting."
    },
    {
      question: "Can I vote if I'm not in my registered location?",
      answer: "Generally, you must vote at your registered polling unit. However, INEC sometimes makes special provisions for certain groups like security personnel, INEC staff, and observers. Check with INEC for current policies on absentee voting."
    },
    {
      question: "What happens if there are problems at my polling unit?",
      answer: "If you encounter problems such as voter intimidation, malfunctioning equipment, or irregularities, immediately report to the presiding officer at your polling unit. You can also contact INEC through their hotlines or report to security personnel present at the polling unit."
    }
  ];

  const categories = [
    { value: "all", label: "All Topics", icon: BookOpen },
    { value: "voting", label: "Voting Rights", icon: Scale },
    { value: "elections", label: "Elections", icon: Users },
    { value: "parties", label: "Political Parties", icon: Users },
    { value: "participation", label: "Civic Participation", icon: GraduationCap },
    { value: "transparency", label: "Transparency", icon: FileText }
  ];

  const contentTypes = [
    { value: "all", label: "All Types" },
    { value: "guide", label: "Guides" },
    { value: "video", label: "Videos" },
    { value: "article", label: "Articles" },
    { value: "podcast", label: "Podcasts" }
  ];

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'podcast': return <Headphones className="w-4 h-4" />;
      case 'guide': return <BookOpen className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success text-success-foreground';
      case 'intermediate': return 'bg-warning text-warning-foreground';
      case 'advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Democracy Hub</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your comprehensive resource for civic education, election guides, and democratic participation in Nigeria
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for guides, articles, videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      <category.icon className="w-4 h-4" />
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="resources" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="guides">Quick Guides</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="resources">
            {/* Featured Categories */}
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {categories.slice(1).map(category => (
                <Card 
                  key={category.value} 
                  className={`shadow-card cursor-pointer transition-all duration-200 hover:shadow-elevated ${
                    selectedCategory === category.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  <CardContent className="p-4 text-center">
                    <category.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium text-sm text-foreground">{category.label}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map(item => (
                <Card key={item.id} className="shadow-card hover:shadow-elevated transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(item.type)}
                        <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                      </div>
                      <Badge className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{item.views.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current text-warning" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button className="flex-1">
                        {item.type === 'video' ? <Play className="w-4 h-4 mr-2" /> : 
                         item.type === 'podcast' ? <Headphones className="w-4 h-4 mr-2" /> :
                         <BookOpen className="w-4 h-4 mr-2" />}
                        {item.type === 'video' ? 'Watch' : 
                         item.type === 'podcast' ? 'Listen' : 'Read'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No resources found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="guides">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Quick Reference Guides</h2>
                <p className="text-muted-foreground">Essential information for Nigerian voters</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Scale className="w-5 h-5 mr-2 text-primary" />
                      Voting Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">Before Election Day:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Register to vote and collect your PVC</li>
                        <li>• Verify your polling unit location</li>
                        <li>• Research candidates and their positions</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">On Election Day:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Arrive early with your PVC</li>
                        <li>• Queue for accreditation</li>
                        <li>• Cast your vote in private</li>
                        <li>• Stay for counting if possible</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" />
                      Required Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">For Registration:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• National ID Card</li>
                        <li>• Driver's License</li>
                        <li>• International Passport</li>
                        <li>• Birth Certificate (with photo ID)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">For Voting:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Permanent Voter Card (PVC) - Required</li>
                        <li>• Additional ID for verification</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-primary" />
                      Election Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium text-foreground">Federal Elections:</h3>
                        <p className="text-sm text-muted-foreground">President, Senate, House of Representatives</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">State Elections:</h3>
                        <p className="text-sm text-muted-foreground">Governor, State House of Assembly</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Local Elections:</h3>
                        <p className="text-sm text-muted-foreground">Local Government Chairmen, Councillors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-primary" />
                      Voter Rights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Right to register and vote</li>
                      <li>• Right to vote in secret</li>
                      <li>• Right to vote without intimidation</li>
                      <li>• Right to report irregularities</li>
                      <li>• Right to observe counting</li>
                      <li>• Right to equal treatment</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">Common questions about voting and elections in Nigeria</p>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium text-foreground">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Card className="mt-8 shadow-card">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-foreground mb-2">Still have questions?</h3>
                  <p className="text-muted-foreground mb-4">
                    Contact INEC or visit their official website for more information
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit INEC Website
                    </Button>
                    <Button variant="outline">
                      Contact Support
                    </Button>
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
};

export default DemocracyHub;