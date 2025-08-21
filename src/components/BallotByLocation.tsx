import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, Search, Users, Calendar, CheckCircle,
  AlertCircle, Loader2, ExternalLink
} from 'lucide-react';
import { geocodingService, LocationLookupResult } from '@/services/geocoding-service';
import { useSupabaseCandidates, useSupabaseRaces } from '@/hooks/useSupabaseElectionData';

interface BallotByLocationProps {
  className?: string;
}

const BallotByLocation = ({ className }: BallotByLocationProps) => {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<LocationLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ballot, setBallot] = useState<any>(null);

  const { data: allCandidates } = useSupabaseCandidates();
  const { data: allRaces } = useSupabaseRaces();

  const handleAddressLookup = async () => {
    if (!address.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geocodingService.resolveAddress(address);
      if (result) {
        setLocation(result);
        
        // Get ballot data for this location
        const ballotData = await geocodingService.getBallotForLocation(
          result.state,
          result.lga,
          result.ward
        );
        setBallot(ballotData);
      } else {
        setError('Could not find location. Please try a more specific address or select your state/LGA manually.');
      }
    } catch (err) {
      setError('Error looking up location. Please try again.');
      console.error('Location lookup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressLookup();
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setBallot(null);
    setAddress('');
    setError(null);
  };

  return (
    <div className={className}>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary" />
            Find Your Ballot
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter your address to see candidates and elections specific to your location
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter your address (e.g., Victoria Island, Lagos)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleAddressLookup} 
              disabled={isLoading || !address.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {location && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Found location: <strong>{location.ward}, {location.lga}, {location.state}</strong>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearLocation}
                  className="ml-2 p-0 h-auto text-primary"
                >
                  Change location
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {location && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Polling Units ({location.pollingUnits.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {location.pollingUnits.slice(0, 3).map(unit => (
                      <div key={unit.id} className="p-2 bg-muted/50 rounded text-sm">
                        <div className="font-medium">{unit.name}</div>
                        <div className="text-muted-foreground text-xs">{unit.code}</div>
                        <div className="text-muted-foreground text-xs">{unit.address}</div>
                      </div>
                    ))}
                    {location.pollingUnits.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{location.pollingUnits.length - 3} more polling units
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Races ({ballot?.races.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ballot?.races.slice(0, 3).map((race: any) => (
                      <div key={race.id} className="p-2 bg-muted/50 rounded text-sm">
                        <div className="font-medium">{race.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {ballot.candidates.filter((c: any) => c.race_id === race.id).length} candidates
                        </div>
                      </div>
                    )) || (
                      <div className="text-sm text-muted-foreground">
                        No races found for this location
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {ballot?.candidates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Your Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {ballot.candidates.slice(0, 4).map((candidate: any) => {
                        const race = ballot.races.find((r: any) => r.id === candidate.race_id);
                        return (
                          <div key={candidate.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-card rounded-full flex items-center justify-center text-lg">
                                👤
                              </div>
                              <div>
                                <div className="font-medium text-sm">{candidate.name}</div>
                                <div className="text-xs text-muted-foreground">{candidate.party}</div>
                                <div className="text-xs text-muted-foreground">{race?.name}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {candidate.inec_verified && (
                                <Badge variant="secondary" className="text-xs">Verified</Badge>
                              )}
                              <Button variant="outline" size="sm">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {ballot.candidates.length > 4 && (
                        <div className="text-center">
                          <Button variant="outline" size="sm">
                            View All {ballot.candidates.length} Candidates
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center">
                <Button onClick={clearLocation} variant="outline">
                  Search Different Location
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BallotByLocation;