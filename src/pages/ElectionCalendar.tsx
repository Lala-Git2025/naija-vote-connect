import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, Clock, MapPin, Bell, Plus, 
  ChevronLeft, ChevronRight, Filter, List,
  CalendarDays, AlertCircle, CheckCircle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSupabaseElections, useSupabaseDeadlines } from "@/hooks/useSupabaseElectionData";
import { DataSyncButton } from "@/components/DataSyncButton";

const ElectionCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'timeline'>('calendar');
  const [filterType, setFilterType] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'upcoming'>('all');

  const { data: elections, isLoading: electionsLoading } = useSupabaseElections();
  const { data: deadlines, isLoading: deadlinesLoading } = useSupabaseDeadlines();

  // Convert Supabase data to calendar events
  const supabaseEvents = [
    ...(elections || []).map(election => ({
      id: election.id,
      title: election.name,
      date: new Date(election.date),
      time: "8:00 AM",
      type: "election" as const,
      priority: "high" as const,
      location: "Nationwide",
      description: election.description || `${election.type} election`,
      status: election.status as "upcoming" | "completed" | "cancelled"
    })),
    ...(deadlines || []).map(deadline => ({
      id: deadline.id,
      title: deadline.title,
      date: new Date(deadline.date),
      time: "11:59 PM",
      type: "deadline" as const,
      priority: deadline.importance as "high" | "medium" | "low",
      location: "Nationwide",
      description: deadline.description,
      status: "upcoming" as const
    }))
  ];

  // Mock election events data for fallback
  const mockEvents = [
    {
      id: "1",
      title: "Voter Registration Deadline",
      date: new Date(2024, 0, 15), // January 15, 2024
      time: "11:59 PM",
      type: "deadline",
      priority: "high",
      location: "Nationwide",
      description: "Last day to register for the 2024 general elections",
      status: "upcoming"
    },
    {
      id: "2",
      title: "Campaign Period Begins",
      date: new Date(2024, 0, 20), // January 20, 2024
      time: "12:00 AM",
      type: "campaign",
      priority: "medium",
      location: "Nationwide",
      description: "Official campaign period starts for all candidates",
      status: "upcoming"
    },
    {
      id: "3",
      title: "Presidential Debate #1",
      date: new Date(2024, 1, 5), // February 5, 2024
      time: "8:00 PM",
      type: "debate",
      priority: "medium",
      location: "Abuja",
      description: "First presidential candidates debate",
      status: "upcoming"
    },
    {
      id: "4",
      title: "Early Voting Begins",
      date: new Date(2024, 1, 15), // February 15, 2024
      time: "8:00 AM",
      type: "voting",
      priority: "high",
      location: "Select States",
      description: "Early voting period begins for eligible voters",
      status: "upcoming"
    },
    {
      id: "5",
      title: "Presidential Election",
      date: new Date(2024, 1, 25), // February 25, 2024
      time: "8:00 AM",
      type: "election",
      priority: "high",
      location: "Nationwide",
      description: "Presidential and National Assembly elections",
      status: "upcoming"
    },
    {
      id: "6",
      title: "Governorship Elections",
      date: new Date(2024, 2, 11), // March 11, 2024
      time: "8:00 AM",
      type: "election",
      priority: "high",
      location: "Nationwide",
      description: "Governorship and State Assembly elections",
      status: "upcoming"
    }
  ];

  const allEvents = supabaseEvents.length > 0 ? supabaseEvents : mockEvents;
  
  // Apply both type and time filters
  const filteredEvents = allEvents.filter(event => {
    // Type filter
    if (filterType !== 'all' && event.type !== filterType) return false;
    
    // Time filter
    const today = new Date();
    const eventDate = new Date(event.date);
    
    if (timeFilter === 'past' && eventDate >= today) return false;
    if (timeFilter === 'upcoming' && eventDate < today) return false;
    
    return true;
  }).sort((a, b) => {
    // Sort by date - past events in descending order, future in ascending
    if (timeFilter === 'past') {
      return b.date.getTime() - a.date.getTime();
    }
    return a.date.getTime() - b.date.getTime();
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'election': return 'bg-primary text-primary-foreground';
      case 'deadline': return 'bg-destructive text-destructive-foreground';
      case 'debate': return 'bg-secondary text-secondary-foreground';
      case 'campaign': return 'bg-warning text-warning-foreground';
      case 'voting': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'medium': return <Clock className="w-4 h-4 text-warning" />;
      default: return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCurrentMonthEvents = () => {
    return filteredEvents.filter(event => 
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const addToDeviceCalendar = (event: any) => {
    // Create calendar event data
    const startDate = event.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const link = document.createElement('a');
    link.href = encodeURI(calendarUrl);
    link.download = `${event.title}.ics`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Election Calendar</h1>
            <p className="text-muted-foreground">Stay updated with important election dates and deadlines</p>
            <div className="mt-2">
              <DataSyncButton syncType="elections" size="sm" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as 'all' | 'past' | 'upcoming')}>
              <SelectTrigger className="w-36">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Time filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="election">Elections</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="debate">Debates</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="voting">Voting</SelectItem>
              </SelectContent>
            </Select>
            
            <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'timeline')}>
              <TabsList>
                <TabsTrigger value="calendar">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <List className="w-4 h-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {view === 'calendar' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar View */}
            <div className="lg:col-span-2">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }, (_, i) => {
                      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                      const startDate = new Date(firstDay);
                      startDate.setDate(startDate.getDate() - firstDay.getDay() + i);
                      
                      const dayEvents = filteredEvents.filter(event => 
                        event.date.toDateString() === startDate.toDateString()
                      );
                      
                      const isCurrentMonth = startDate.getMonth() === currentDate.getMonth();
                      const isToday = startDate.toDateString() === new Date().toDateString();
                      
                      return (
                        <div 
                          key={i} 
                          className={`p-2 h-20 border border-border rounded-lg ${
                            isCurrentMonth ? 'bg-background' : 'bg-muted/50'
                          } ${isToday ? 'ring-2 ring-primary' : ''}`}
                        >
                          <div className={`text-sm ${
                            isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {startDate.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div 
                                key={event.id} 
                                className={`text-xs px-1 py-0.5 rounded ${getEventTypeColor(event.type)}`}
                              >
                                {event.title.length > 10 ? `${event.title.substring(0, 10)}...` : event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">This Month's Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getCurrentMonthEvents().length > 0 ? (
                    getCurrentMonthEvents().map(event => (
                      <div key={event.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-foreground text-sm">{event.title}</h3>
                          {getPriorityIcon(event.priority)}
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => addToDeviceCalendar(event)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add to Calendar
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No events this month</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Reminders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredEvents.slice(0, 3).map(event => {
                    const daysUntil = getDaysUntil(event.date);
                    return (
                      <div key={event.id} className="flex items-center justify-between p-2 border border-border rounded">
                        <div>
                          <p className="text-sm font-medium text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysUntil > 0 ? `${daysUntil} days away` : daysUntil === 0 ? 'Today' : 'Past'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Bell className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Timeline View */
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {filteredEvents.map((event, index) => {
                const daysUntil = getDaysUntil(event.date);
                return (
                  <Card key={event.id} className="shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getEventTypeColor(event.type)}`}>
                            <Calendar className="w-6 h-6" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground mb-1">{event.title}</h3>
                              <p className="text-muted-foreground">{event.description}</p>
                            </div>
                            <div className="text-right">
                              {getPriorityIcon(event.priority)}
                              <div className="text-sm text-muted-foreground mt-1">
                                {daysUntil > 0 ? `${daysUntil} days` : daysUntil === 0 ? 'Today' : 'Past'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="capitalize">{event.type}</Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addToDeviceCalendar(event)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Calendar
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Bell className="w-4 h-4 mr-2" />
                              Set Reminder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ElectionCalendar;