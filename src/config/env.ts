// Typed configuration for CivicLens environment variables
// All secrets are managed through Supabase for security

export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  inec: {
    timetableUrls: string[];
    candidateFiles: string[];
    resultsLinks: string[];
  };
  feeds: {
    factcheckRss: string[];
    civicRss: string[];
  };
  mapping: {
    mapboxToken?: string;
    googleMapsKey?: string;
  };
  replit: {
    apiBase?: string;
    apiKey?: string;
  };
}

// Client-safe configuration (no secrets)
export const clientConfig: Pick<AppConfig, 'supabase'> = {
  supabase: {
    url: "https://cjyjfxeeyumstsfsknyb.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424"
  }
};

// Type for server configuration (used in edge functions)
export type ServerConfigBuilder = () => AppConfig;

// Validation helpers
export function validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.supabase.url) {
    errors.push('SUPABASE_URL is required');
  }
  
  if (!config.supabase.serviceRoleKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required for server operations');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}