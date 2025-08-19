import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Bell, Clock, MapPin, Users, AlertCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useElections, useCandidates, useDeadlines } from "@/hooks/useElectionData";

const PersonalizedDashboard = () => {
  const navigate = useNavigate();
  const { data: elections } = useElections();
  const { data: candidates } = useCandidates();
  const { data: deadlines } = useDeadlines();

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Election Registration Reminder", message: "Last 3 days to register for Lagos State elections", type: "urgent", time: "2 hours ago" },
    { id: 2, title: "Candidate Debate Tonight", message: "Presidential debate at 8 PM on NTA", type: "info", time: "4 hours ago" },
    { id: 3, title: "Polling Unit Change", message: "Your polling unit has been updated", type: "warning", time: "1 day ago" }
  ]);

  const upcomingElections = elections?.data?.filter(election => 
    election.status === 'upcoming'
  ).slice(0, 3) || [
    {
      id: "ng-2027-pres",
      title: "Presidential Election",
      date: "February 25, 2027",
      name: "2027 Presidential Election",
      type: "Presidential" as const,
      status: "upcoming" as const,
      daysLeft: 365,
      location: "Ward 5, Surulere LGA"
    }
  ];

  const featuredCandidates = candidates?.data?.slice(0, 3) || [];
  const upcomingDeadlines = deadlines?.data?.slice(0, 3) || [
    { id: "1", title: "Voter Registration Closes", date: "Jan 15, 2027", daysLeft: 90, priority: "high" }
  ];

  const candidateHighlights = [
    {
      name: "Dr. Amina Hassan",
      party: "Progressive Alliance",
      office: "Governor - Lagos State",
      image: "/placeholder.svg",
      verified: true,
      keyPolicies: ["Healthcare Reform", "Education Investment"],
      recentUpdate: "Released education policy framework"
    },
    {
      name: "Engr. Kemi Adebayo",
      party: "People's Democratic Movement", 
      office: "House of Representatives",
      image: "/placeholder.svg",
      verified: true,
      keyPolicies: ["Infrastructure Development", "Youth Employment"],
      recentUpdate: "Town hall meeting scheduled for tomorrow"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent': return 'text-destructive';
      case 'warning': return 'text-warning';
      default: return 'text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Civic Image */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/lovable-uploads/3d96de39-d837-4049-acb9-fe13c009ca8b.png')`,
            objectFit: 'cover',
            objectPosition: 'center',
            backgroundBlendMode: 'normal',
            mixBlendMode: 'normal',
            filter: 'none'
          }}
        />
        
        {/* Local text scrim only behind content */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" 
             style={{ height: '45%', top: 'auto', bottom: 0 }} />
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" 
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.35)' }}>
              Your Democratic Voice Matters
            </h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed text-white/92">
              Stay informed, stay engaged. Track upcoming elections, compare candidates, and make informed decisions that shape Nigeria's future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/candidates')}
                className="bg-white text-[#1E4D91] hover:bg-white/90 font-semibold"
              >
                Explore Candidates
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/calendar')}
                className="border-white text-white hover:bg-white/10"
              >
                View Election Calendar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Civic Engagement Stats */}
        <div className="absolute bottom-6 right-6 bg-white/82 backdrop-blur-[8px] rounded-lg p-4 text-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#1E4D91]/10 rounded-full flex items-center justify-center">
              <span className="text-lg">🗳️</span>
            </div>
            <div>
              <p className="font-semibold">INEC Verified</p>
              <p className="text-sm opacity-80">Official election data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-hero text-primary-foreground">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm opacity-90">Upcoming Elections</div>
            </CardContent>
          </Card>
          <Card className="bg-secondary text-secondary-foreground">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">365</div>
              <div className="text-sm opacity-90">Days to Vote</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">✓</div>
              <div className="text-sm text-muted-foreground">Registration Complete</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-muted-foreground">Candidates Tracked</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Elections */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Your Upcoming Elections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingElections.map((election, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground">{election.title || election.name}</h3>
                        <Badge variant={election.type === 'Presidential' ? 'default' : 'secondary'} className="text-xs">
                          {election.type}
                        </Badge>
                        <Badge variant="default" className="text-xs">
                          Registered
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {election.date}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {election.location || "Your registered location"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{election.daysLeft}</div>
                      <div className="text-xs text-muted-foreground">days left</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Candidate Highlights */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center text-foreground">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Candidate Updates
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/candidates')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidateHighlights.map((candidate, index) => (
                  <div 
                    key={index} 
                    onClick={() => navigate(`/candidate/${candidate.name.toLowerCase().replace(/\s+/g, '-')}`)}
                    className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gradient-card rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                        <Badge variant="outline" className="text-xs">{candidate.party}</Badge>
                        {candidate.verified && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">INEC Verified</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{candidate.office}</p>
                      <p className="text-sm text-primary">{candidate.recentUpdate}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Notifications */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notifications
                  {notifications.length > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className={`w-4 h-4 mt-1 ${getNotificationIcon(notification.type)}`} />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/democracy-hub')}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Polling Unit
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/candidates/compare')}>
                  <Users className="w-4 h-4 mr-2" />
                  Compare Candidates
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/calendar')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;