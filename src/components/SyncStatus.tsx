import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusProps {
  provider?: string;
  className?: string;
}

export default function SyncStatus({ provider = 'inec_api', className = '' }: SyncStatusProps) {
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLastSync();
  }, [provider]);

  const fetchLastSync = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_runs')
        .select('completed_at')
        .eq('provider', provider as any)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLastSync(data?.completed_at || null);
    } catch (error) {
      console.error('Error fetching last sync:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center text-xs text-muted-foreground ${className}`}>
        <Clock className="h-3 w-3 mr-1" />
        <span>Checking...</span>
      </div>
    );
  }

  if (!lastSync) {
    return (
      <div className={`inline-flex items-center text-xs text-muted-foreground ${className}`}>
        <Clock className="h-3 w-3 mr-1" />
        <span>No sync data</span>
      </div>
    );
  }

  const relativeTime = formatDistanceToNow(new Date(lastSync), { addSuffix: true });
  const providerName = provider === 'inec_api' ? 'INEC' : 
                      provider === 'civic_feeds' ? 'News' : 
                      provider === 'fact_check' ? 'Fact checks' : provider;

  return (
    <div className={`inline-flex items-center text-xs text-muted-foreground ${className}`}>
      <Clock className="h-3 w-3 mr-1" />
      <span>{providerName} updated {relativeTime}</span>
    </div>
  );
}