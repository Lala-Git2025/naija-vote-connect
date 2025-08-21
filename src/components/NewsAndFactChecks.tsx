import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ExternalLink, Clock, CheckCircle, AlertTriangle, 
  Info, TrendingUp, User, Calendar
} from "lucide-react";
import { useSupabaseNews, useSupabaseFactChecks } from "@/hooks/useSupabaseElectionData";

interface NewsAndFactChecksProps {
  candidateId?: string;
  className?: string;
  limit?: number;
}

const NewsAndFactChecks = ({ candidateId, className, limit = 6 }: NewsAndFactChecksProps) => {
  const { data: news, isLoading: newsLoading } = useSupabaseNews(limit);
  const { data: factChecks, isLoading: factChecksLoading } = useSupabaseFactChecks(candidateId, limit);

  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'true':
        return 'bg-success text-success-foreground';
      case 'mostly true':
        return 'bg-success/80 text-success-foreground';
      case 'half true':
      case 'partly false':
        return 'bg-warning text-warning-foreground';
      case 'mostly false':
        return 'bg-destructive/80 text-destructive-foreground';
      case 'false':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'true':
      case 'mostly true':
        return <CheckCircle className="w-4 h-4" />;
      case 'half true':
      case 'partly false':
        return <AlertTriangle className="w-4 h-4" />;
      case 'mostly false':
      case 'false':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (newsLoading || factChecksLoading) {
    return (
      <div className={className}>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid md:grid-cols-2 gap-6">
        {/* News Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Latest News
            </h2>
            {news && news.length > 0 && (
              <Badge variant="outline" className="text-xs">
                Updated {formatTimeAgo(news[0].createdAt)}
              </Badge>
            )}
          </div>

          {news && news.length > 0 ? (
            <div className="space-y-4">
              {news.slice(0, Math.ceil(limit / 2)).map(item => (
                <Card key={item.id} className="shadow-card hover:shadow-elevated transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                          {item.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant={item.category === 'Election' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {item.category}
                          </Badge>
                          {item.verified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(item.publishedAt)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        External Source
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent news available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  News updates will appear here when available
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fact Checks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary" />
              Fact Checks
            </h2>
            {factChecks && factChecks.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {factChecks.length} verified
              </Badge>
            )}
          </div>

          {factChecks && factChecks.length > 0 ? (
            <div className="space-y-4">
              {factChecks.slice(0, Math.ceil(limit / 2)).map(check => (
                <Card key={check.id} className="shadow-card hover:shadow-elevated transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getVerdictColor(check.verdict)}>
                            {getVerdictIcon(check.verdict)}
                            <span className="ml-1">{check.verdict}</span>
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(check.trustScore * 100)}% confidence
                          </div>
                        </div>
                        <CardTitle className="text-sm leading-tight group-hover:text-primary transition-colors">
                          {check.claim}
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(check.checkedAt)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {check.explanation.slice(0, 120)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        By {check.organization}
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Full Check
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No fact checks available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {candidateId 
                    ? "Fact checks for this candidate will appear here"
                    : "Recent fact checks will appear here when available"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Call to Action */}
      {((news && news.length > limit/2) || (factChecks && factChecks.length > limit/2)) && (
        <div className="mt-6 text-center">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Want to see more news and fact checks? Visit our Democracy Hub for comprehensive coverage.
              <Button variant="link" className="p-0 ml-2 h-auto text-primary">
                View Democracy Hub
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default NewsAndFactChecks;