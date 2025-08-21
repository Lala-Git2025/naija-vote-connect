import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { dataOrchestrator } from '@/services/data-orchestrator';
import { ragService } from '@/services/rag-service';

export const DataIntegrationDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<any[]>([]);

  const handleFullSync = async () => {
    setIsLoading(true);
    try {
      const reports = await dataOrchestrator.performFullSync();
      setLastSync(reports);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRAGQuery = async () => {
    const query = "What are the economic policies?";
    const response = await ragService.generateResponse(query);
    console.log('RAG Response:', response);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Data Integration Dashboard</h2>
        <div className="space-x-2">
          <Button onClick={handleFullSync} disabled={isLoading}>
            {isLoading ? 'Syncing...' : 'Full Sync'}
          </Button>
          <Button variant="outline" onClick={handleRAGQuery}>
            Test RAG
          </Button>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          Comprehensive data integration from INEC, Manifesto.NG, Dubawa, and official party websites with explicit source precedence and RAG capabilities.
        </AlertDescription>
      </Alert>

      {lastSync.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Last Sync Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastSync.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <Badge variant={report.status === 'success' ? 'default' : 'destructive'}>
                      {report.source}
                    </Badge>
                    <span className="ml-2">{report.sync_type}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created: {report.created} | Updated: {report.updated} | Duration: {report.duration_ms}ms
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};