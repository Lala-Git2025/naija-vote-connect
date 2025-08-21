// INEC Configuration - loads from Supabase secrets
export interface INECConfig {
  timetableUrls: string[];
  candidateFeeds: string[];
  factcheckRss: string[];
  civicRss: string[];
}

// These will be loaded from Supabase secrets in edge functions
export const DEFAULT_INEC_URLS = [
  // INEC official timetable pages
  'https://www.inecnigeria.org/election-timetable/',
  'https://www.inecnigeria.org/wp-content/uploads/2023/01/2023-GENERAL-ELECTION-TIMETABLE-AND-SCHEDULE-OF-ACTIVITIES.pdf',
];

export const DEFAULT_CANDIDATE_FEEDS = [
  // INEC candidate list URLs (these would be updated with actual INEC feeds)
  'https://www.inecnigeria.org/candidates-list/',
];

export const DEFAULT_FACTCHECK_RSS = [
  'https://africacheck.org/feed/',
  'https://dubawa.org/feed/',
  'https://factcheck.afp.com/api/rss/rss.xml',
];

export const DEFAULT_CIVIC_RSS = [
  'https://www.premiumtimesng.com/news/headlines/feed',
  'https://www.channelstv.com/feed',
  'https://guardian.ng/feed/',
  'https://punchng.com/feed/',
];

export type ElectionType = 'presidential' | 'gubernatorial' | 'senatorial' | 'house_of_representatives' | 'state_assembly' | 'local_government';

export type RaceType = 'presidential' | 'gubernatorial' | 'senatorial' | 'federal_house' | 'state_house' | 'local_government';

export type ElectionStatus = 'upcoming' | 'ongoing' | 'completed' | 'postponed';

export type CandidateStatus = 'active' | 'disqualified' | 'withdrawn';

export type ResultStatus = 'pending' | 'collating' | 'announced' | 'disputed';

export type SyncProvider = 'inec' | 'manual' | 'rss' | 'external';

export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed';