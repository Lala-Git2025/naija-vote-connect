import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Users, Bell, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    state: '',
    lga: '',
    ward: '',
    interests: [] as string[],
    notifications: true,
    language: 'english'
  });

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", 
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  const interestOptions = [
    "Presidential Elections", "Governorship Elections", "Senate Elections", 
    "House of Representatives", "State Assembly", "Local Government", 
    "Political Parties", "Candidate Debates", "Election News", "Civic Education"
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hausa', label: 'Hausa' },
    { value: 'yoruba', label: 'Yorùbá' },
    { value: 'igbo', label: 'Igbo' },
    { value: 'pidgin', label: 'Nigerian Pidgin' }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      console.log('Completing onboarding, setting localStorage items');
      localStorage.setItem('civicLensOnboarded', 'true');
      localStorage.setItem('userPreferences', JSON.stringify(formData));
      console.log('Onboarding completed, navigating to home');
      console.log('localStorage civicLensOnboarded:', localStorage.getItem('civicLensOnboarded'));
      navigate('/');
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return true; // Welcome step
      case 2: return formData.state && formData.language;
      case 3: return formData.interests.length > 0;
      case 4: return true; // Notifications step
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto">
              <Users className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to CivicLens</h2>
              <p className="text-muted-foreground">
                Your trusted companion for Nigerian elections. Get personalized information 
                about candidates, elections, and civic processes in your area.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-accent-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Location-based info</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Candidate profiles</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6 text-accent-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Election reminders</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-3">Your Location</h2>
              <p className="text-muted-foreground">
                Help us provide relevant election information for your area
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">State</label>
                <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({...prev, state: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map(state => (
                      <SelectItem key={state} value={state.toLowerCase()}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Local Government Area</label>
                <Input 
                  placeholder="Enter your LGA"
                  value={formData.lga}
                  onChange={(e) => setFormData(prev => ({...prev, lga: e.target.value}))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Ward (Optional)</label>
                <Input 
                  placeholder="Enter your ward"
                  value={formData.ward}
                  onChange={(e) => setFormData(prev => ({...prev, ward: e.target.value}))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Preferred Language</label>
                <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({...prev, language: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-3">Your Interests</h2>
              <p className="text-muted-foreground">
                Choose what you'd like to follow. You can change this anytime.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map(interest => (
                <div 
                  key={interest}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.interests.includes(interest) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                    />
                    <span className="text-sm font-medium text-foreground">{interest}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-3">Stay Updated</h2>
              <p className="text-muted-foreground">
                Get timely notifications about elections, deadlines, and important updates
              </p>
            </div>
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    checked={formData.notifications}
                    onChange={() => setFormData(prev => ({...prev, notifications: !prev.notifications}))}
                  />
                  <div>
                    <h3 className="font-medium text-foreground">Election Notifications</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Registration deadlines, election dates, and candidate updates
                    </p>
                  </div>
                </div>
              </Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">You're all set!</h3>
                <p className="text-sm text-muted-foreground">
                  CivicLens is ready to provide you with personalized election information
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of 4</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-hero h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={!isStepComplete()}
            className="ml-auto"
          >
            {currentStep === 4 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;