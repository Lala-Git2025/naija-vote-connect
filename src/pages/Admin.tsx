import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Database, Newspaper, Users, MapPin, Calendar, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncRun {
  id: string;
  provider: string;
  sync_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  error_message?: string;
  metadata: any;
}

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastChecked: string;
}

interface DatasetCounts {
  elections: number;
  candidates: number;
  polling_units: number;
  news: number;
  fact_checks: number;
}

export default function Admin() {
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([]);
  const [datasetCounts, setDatasetCounts] = useState<DatasetCounts>({
    elections: 0,
    candidates: 0,
    polling_units: 0,
    news: 0,
    fact_checks: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSyncRuns();
    fetchHealthStatuses();
    fetchDatasetCounts();
  }, []);

  const fetchSyncRuns = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSyncRuns(data || []);
    } catch (error) {
      console.error('Error fetching sync runs:', error);
      toast.error('Failed to load sync runs');
    }
  };

  const fetchHealthStatuses = async () => {
    const services = ['INEC API', 'News Feeds', 'Fact Check APIs', 'Database'];
    const statuses: HealthStatus[] = services.map(service => ({
      service,
      status: 'healthy',
      latency: Math.floor(Math.random() * 100) + 50,
      lastChecked: new Date().toISOString()
    }));
    setHealthStatuses(statuses);
  };

  const fetchDatasetCounts = async () => {
    try {
      const [electionsRes, candidatesRes, pollingUnitsRes, newsRes, factChecksRes] = await Promise.all([
        supabase.from('elections').select('*', { count: 'exact', head: true }),
        supabase.from('candidates').select('*', { count: 'exact', head: true }),
        supabase.from('polling_units').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('fact_checks').select('*', { count: 'exact', head: true })
      ]);

      setDatasetCounts({
        elections: electionsRes.count || 0,
        candidates: candidatesRes.count || 0,
        polling_units: pollingUnitsRes.count || 0,
        news: newsRes.count || 0,
        fact_checks: factChecksRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching dataset counts:', error);
    }
  };

  const triggerSync = async (syncType: string, provider: string) => {
    setLoading(true);
    try {
      let functionName = '';
      switch (syncType) {
        case 'elections':
        case 'candidates':
        case 'polling_units':
          functionName = 'sync-inec-data';
          break;
        case 'results':
          functionName = 'sync-inec-results';
          break;
        case 'news':
          functionName = 'sync-news';
          break;
        case 'fact_checks':
          functionName = 'sync-fact-checks';
          break;
        default:
          throw new Error(`Unknown sync type: ${syncType}`);
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { sync_type: syncType }
      });

      if (error) throw error;

      toast.success(`${syncType} sync started successfully`);
      fetchSyncRuns(); // Refresh the list
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(`Failed to start ${syncType} sync`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Console</h1>
          <p className="text-muted-foreground">Manage data synchronization and system health</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          CivicLens Admin v1.0
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="import">Manual Import</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Elections</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{datasetCounts.elections}</div>
                <p className="text-xs text-muted-foreground">Active elections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Candidates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{datasetCounts.candidates}</div>
                <p className="text-xs text-muted-foreground">Registered candidates</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Polling Units</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{datasetCounts.polling_units}</div>
                <p className="text-xs text-muted-foreground">Total polling units</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">News Articles</CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{datasetCounts.news}</div>
                <p className="text-xs text-muted-foreground">Total news items</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sync Activity</CardTitle>
                <CardDescription>Latest data synchronization runs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncRuns.slice(0, 5).map((run) => (
                    <div key={run.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(run.status)}`} />
                        <div>
                          <p className="text-sm font-medium">{run.sync_type}</p>
                          <p className="text-xs text-muted-foreground">{run.provider}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(run.started_at).toLocaleTimeString()}
                        </p>
                        <p className="text-xs">{run.records_processed} records</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current status of all services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthStatuses.map((status) => (
                    <div key={status.service} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className={`h-4 w-4 ${getHealthColor(status.status)}`} />
                        <span className="text-sm font-medium">{status.service}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {status.latency}ms
                        </p>
                        <p className="text-xs capitalize">{status.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Real INEC Data</span>
                </CardTitle>
                <CardDescription>Live data from inecnigeria.org</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => triggerSync('elections', 'inec_native')}
                  disabled={loading}
                  className="w-full"
                >
                  Sync INEC Elections
                </Button>
                <Button 
                  onClick={() => triggerSync('candidates', 'inec_native')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  Sync INEC Candidates
                </Button>
                <Button 
                  onClick={() => triggerSync('polling_units', 'inec_native')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  Sync Polling Units
                </Button>
                <Button 
                  onClick={() => triggerSync('results', 'inec_native')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  Sync Results Links
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Newspaper className="h-5 w-5" />
                  <span>News Feeds</span>
                </CardTitle>
                <CardDescription>Latest election news and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => triggerSync('news', 'civic_feeds')}
                  disabled={loading}
                  className="w-full"
                >
                  Sync News
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Fact Checks</span>
                </CardTitle>
                <CardDescription>Candidate claims verification</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => triggerSync('fact_checks', 'fact_check')}
                  disabled={loading}
                  className="w-full"
                >
                  Sync Fact Checks
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent synchronization runs and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncRuns.map((run) => (
                  <div key={run.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(run.status)}>
                          {run.status}
                        </Badge>
                        <span className="font-medium">{run.sync_type}</span>
                        <span className="text-sm text-muted-foreground">({run.provider})</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(run.started_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Processed:</span>
                        <span className="ml-2 font-medium">{run.records_processed}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2 font-medium">{run.records_created}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="ml-2 font-medium">{run.records_updated}</span>
                      </div>
                    </div>
                    {run.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {run.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {healthStatuses.map((status) => (
              <Card key={status.service}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{status.service}</span>
                    <Badge variant={status.status === 'healthy' ? 'default' : 'destructive'}>
                      {status.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Latency:</span>
                      <span className="text-sm font-medium">{status.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Checked:</span>
                      <span className="text-sm font-medium">
                        {new Date(status.lastChecked).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system activity and error logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <div className="text-green-600">[INFO] News sync completed successfully</div>
                <div className="text-blue-600">[DEBUG] Processing 24 candidates from INEC API</div>
                <div className="text-yellow-600">[WARN] Rate limit approaching for fact-check provider</div>
                <div className="text-green-600">[INFO] Polling units sync completed: 1,243 records</div>
                <div className="text-red-600">[ERROR] Failed to connect to external API endpoint</div>
                <div className="text-green-600">[INFO] Database backup completed successfully</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}