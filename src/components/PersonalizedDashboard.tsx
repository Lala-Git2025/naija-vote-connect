import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Bell, Clock, MapPin, Users, AlertCircle, ChevronRight } from "lucide-react";
import { useState } from "react";

const PersonalizedDashboard = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Election Registration Reminder", message: "Last 3 days to register for Lagos State elections", type: "urgent", time: "2 hours ago" },
    { id: 2, title: "Candidate Debate Tonight", message: "Presidential debate at 8 PM on NTA", type: "info", time: "4 hours ago" },
    { id: 3, title: "Polling Unit Change", message: "Your polling unit has been updated", type: "warning", time: "1 day ago" }
  ]);

  const upcomingElections = [
    {
      title: "Presidential Election",
      date: "February 25, 2024",
      daysLeft: 12,
      location: "Ward 5, Surulere LGA",
      type: "Federal",
      status: "registered"
    },
    {
      title: "Governorship Election", 
      date: "March 11, 2024",
      daysLeft: 26,
      location: "Ward 5, Surulere LGA",
      type: "State",
      status: "registered"
    },
    {
      title: "House of Assembly",
      date: "March 11, 2024", 
      daysLeft: 26,
      location: "Ward 5, Surulere LGA",
      type: "State",
      status: "pending"
    }
  ];

  const keyDeadlines = [
    { title: "Voter Registration Closes", date: "Jan 15, 2024", daysLeft: 3, priority: "high" },
    { title: "Campaign Period Ends", date: "Feb 23, 2024", daysLeft: 10, priority: "medium" },
    { title: "Election Day", date: "Feb 25, 2024", daysLeft: 12, priority: "high" }
  ];

  const candidateHighlights = [
    {
      name: "Dr. Amina Hassan",
      party: "DPP",
      position: "Presidential",
      recentUpdate: "Released education policy framework",
      image: "👩🏾‍💼"
    },
    {
      name: "Hon. Kemi Adebayo", 
      party: "PPP",
      position: "Lagos Governor",
      recentUpdate: "Town hall meeting scheduled for tomorrow",
      image: "👩🏾‍🏫"
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Citizen!</h1>
        <p className="text-muted-foreground">Here's your personalized political overview</p>
      </div>

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
            <div className="text-2xl font-bold">12</div>
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
                      <h3 className="font-semibold text-foreground">{election.title}</h3>
                      <Badge variant={election.type === 'Federal' ? 'default' : 'secondary'} className="text-xs">
                        {election.type}
                      </Badge>
                      <Badge variant={election.status === 'registered' ? 'default' : 'outline'} className="text-xs">
                        {election.status === 'registered' ? 'Registered' : 'Action Needed'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {election.date}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {election.location}
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
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/candidates">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidateHighlights.map((candidate, index) => (
                <Link 
                  key={index} 
                  to={`/candidate/${candidate.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-card rounded-full flex items-center justify-center text-2xl">
                    {candidate.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                      <Badge variant="outline" className="text-xs">{candidate.party}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{candidate.position}</p>
                    <p className="text-sm text-primary">{candidate.recentUpdate}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
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

          {/* Key Deadlines */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Key Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {keyDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{deadline.title}</h4>
                    <p className="text-xs text-muted-foreground">{deadline.date}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getPriorityColor(deadline.priority)}`}>
                      {deadline.daysLeft}
                    </div>
                    <div className="text-xs text-muted-foreground">days</div>
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
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/democracy-hub">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Polling Unit
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/candidates/compare">
                  <Users className="w-4 h-4 mr-2" />
                  Compare Candidates
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/calendar">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full Calendar
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;