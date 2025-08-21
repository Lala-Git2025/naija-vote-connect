// Sync status indicator for existing UI components
// Shows "INEC last updated X time ago" with source links
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusIndicatorProps {
  lastUpdated?: string | null;
  sourceUrl?: string;
  dataType: 'elections' | 'candidates' | 'deadlines' | 'results';
  isStale?: boolean;
  className?: string;
}

export function SyncStatusIndicator({ 
  lastUpdated, 
  sourceUrl, 
  dataType, 
  isStale = false,
  className = "" 
}: SyncStatusIndicatorProps) {
  if (!lastUpdated) {
    return (
      <Badge variant="secondary" className={`text-xs ${className}`}>
        <Clock className="w-3 h-3 mr-1" />
        INEC sync pending
      </Badge>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(lastUpdated), { addSuffix: true });
  const variant = isStale ? "destructive" : "secondary";
  
  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <Badge variant={variant} className="text-xs">
        <Clock className="w-3 h-3 mr-1" />
        INEC updated {timeAgo}
      </Badge>
      
      {sourceUrl && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => window.open(sourceUrl, '_blank')}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Source
        </Button>
      )}
    </div>
  );
}