import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DataSyncButtonProps {
  syncType: 'elections' | 'candidates' | 'polling_units' | 'results';
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function DataSyncButton({ syncType, className = "", size = "default" }: DataSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    
    try {
      console.log(`Starting ${syncType} sync...`);
      
      const { data, error } = await supabase.functions.invoke('sync-inec-data', {
        body: { sync_type: syncType }
      });

      if (error) {
        console.error('Sync error:', error);
        toast({
          title: "Sync Failed",
          description: `Failed to sync ${syncType} data. Please try again.`,
          variant: "destructive",
        });
        return;
      }

      console.log('Sync result:', data);
      setLastSync(new Date());
      
      toast({
        title: "Sync Successful", 
        description: `${syncType} data has been updated successfully. ${data?.created || 0} new items processed.`,
        variant: "default",
      });

    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Error",
        description: `An error occurred while syncing ${syncType} data.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        onClick={handleSync}
        disabled={isLoading}
        size={size}
        variant="outline"
        className="flex items-center space-x-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        <span>Sync {syncType}</span>
      </Button>
      
      {lastSync && (
        <Badge variant="secondary" className="text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          Synced {lastSync.toLocaleTimeString()}
        </Badge>
      )}
    </div>
  );
}