import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Bell, Clock, MapPin, Users, AlertCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useSupabaseElections, useSupabaseCandidates, useSupabaseDeadlines, useSupabaseNews } from "@/hooks/useSupabaseElectionData";
import FaceAwareHero from "@/components/FaceAwareHero";

const PersonalizedDashboard = () => {
  const navigate = useNavigate();
  const { data: elections } = useSupabaseElections();
  const { data: candidates } = useSupabaseCandidates();
  const { data: deadlines } = useSupabaseDeadlines();
  const { data: news } = useSupabaseNews(3);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Election Registration Reminder", message: "Last 3 days to register for Lagos State elections", type: "urgent", time: "2 hours ago" },
    { id: 2, title: "Candidate Debate Tonight", message: "Presidential debate at 8 PM on NTA", type: "info", time: "4 hours ago" },
    { id: 3, title: "Polling Unit Change", message: "Your polling unit has been updated", type: "warning", time: "1 day ago" }
  ]);

  const upcomingElections = elections?.filter(election => 
    election.status === 'upcoming'
  ).slice(0, 3).map(election => ({
    ...election,
    title: election.name,
    daysLeft: Math.ceil((new Date(election.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    location: "Your registered location"
  })) || [
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

  const featuredCandidates = candidates?.slice(0, 3) || [];
  const upcomingDeadlines = deadlines?.slice(0, 3).map(deadline => ({
    ...deadline,
    daysLeft: Math.ceil((new Date(deadline.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    priority: deadline.importance
  })) || [
    { id: "1", title: "Voter Registration Closes", date: "Jan 15, 2027", daysLeft: 90, priority: "high" }
  ];

  const candidateHighlights = featuredCandidates.length > 0 ? featuredCandidates.map(candidate => ({
    name: candidate.name,
    party: candidate.party,
    office: `${candidate.positions[0]?.category || 'Political'} Candidate`,
    image: candidate.photo || "/placeholder.svg",
    verified: candidate.inecVerified,
    keyPolicies: candidate.positions.slice(0, 2).map(p => p.issue) || ["Policy Reform"],
    recentUpdate: news?.[0]?.title || "Campaign updates available"
  })) : [
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
      <FaceAwareHero
        imageSrc="/lovable-uploads/3d96de39-d837-4049-acb9-fe13c009ca8b.png"
        title="Your Democratic Voice Matters"
        subtitle="Stay informed, stay engaged. Track upcoming elections, compare candidates, and make informed decisions."
        cta={[
          {
            text: "Explore Candidates",
            onClick: () => navigate('/candidates'),
            className: "bg-white text-[#1E4D91] hover:bg-white/90 font-semibold"
          },
          {
            text: "View Election Calendar", 
            onClick: () => navigate('/calendar'),
            variant: "outline" as const,
            className: "border-white text-white hover:bg-white/10"
          }
        ]}
        badge={{
          icon: "🗳️",
          title: "INEC Verified",
          subtitle: "Official election data"
        }}
        preferSide="left"
        enableFaceAware={true}
      />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-hero text-primary-foreground">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{upcomingElections.length}</div>
                <div className="text-sm opacity-90">Upcoming Elections</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary text-secondary-foreground">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{upcomingElections[0]?.daysLeft || 0}</div>
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
                <div className="text-2xl font-bold">{candidates?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Candidates Available</div>
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