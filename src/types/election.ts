// Core election data types for CivicLens Nigeria

export interface Election {
  id: string;
  name: string;
  type: 'Presidential' | 'Gubernatorial' | 'House of Assembly' | 'Senate' | 'Local Government';
  date: string;
  registrationDeadline?: string;
  earlyVotingStart?: string;
  earlyVotingEnd?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'postponed';
  description?: string;
  officialUrl?: string;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Race {
  id: string;
  electionId: string;
  name: string;
  office: string;
  district: string;
  state: string;
  lga?: string;
  ward?: string;
  candidates: string[]; // candidate IDs
  pollingUnits: string[];
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyAbbreviation: string;
  photo?: string;
  biography?: string;
  experience: string[];
  education: string[];
  positions: PolicyPosition[];
  endorsements: Endorsement[];
  funding: FundingSource[];
  socialMedia: SocialMediaLinks;
  verified: boolean;
  inecVerified: boolean;
  sourceUrl?: string;
  lastSyncedAt?: string;
  sourceId: string;
  races: string[]; // race IDs
  createdAt: string;
  updatedAt: string;
}

export interface PolicyPosition {
  issue: string;
  category: 'Economy' | 'Education' | 'Healthcare' | 'Infrastructure' | 'Security' | 'Environment' | 'Other';
  stance: string;
  details?: string;
  sourceUrl?: string;
  verified: boolean;
}

export interface Endorsement {
  organization: string;
  type: 'Individual' | 'Organization' | 'Newspaper' | 'Union' | 'Religious';
  description?: string;
  date: string;
  sourceUrl?: string;
  verified: boolean;
}

export interface FundingSource {
  source: string;
  amount?: number;
  currency: 'NGN' | 'USD';
  type: 'Individual' | 'Corporate' | 'Party' | 'Other';
  date: string;
  verified: boolean;
  sourceUrl?: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  youtube?: string;
}

export interface PollingUnit {
  id: string;
  name: string;
  code: string;
  address: string;
  ward: string;
  lga: string;
  state: string;
  latitude?: number;
  longitude?: number;
  registeredVoters?: number;
  accessibility: boolean;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BallotByDistrict {
  id: string;
  state: string;
  lga: string;
  ward?: string;
  elections: Election[];
  races: Race[];
  pollingUnits: PollingUnit[];
  registrationInfo: RegistrationInfo;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationInfo {
  deadline: string;
  requirements: string[];
  locations: RegistrationLocation[];
  onlineUrl?: string;
}

export interface RegistrationLocation {
  name: string;
  address: string;
  hours: string;
  contact?: string;
  latitude?: number;
  longitude?: number;
}

export interface ElectionResult {
  id: string;
  raceId: string;
  pollingUnitId?: string;
  candidateResults: CandidateResult[];
  totalVotes: number;
  registeredVoters: number;
  accreditedVoters: number;
  invalidVotes: number;
  status: 'preliminary' | 'final' | 'disputed';
  timestamp: string;
  sourceId: string;
  verified: boolean;
}

export interface CandidateResult {
  candidateId: string;
  votes: number;
  percentage: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  author?: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
  category: 'General' | 'Candidate' | 'Election' | 'Policy' | 'Results' | 'Politics' | 'Civic Education';
  tags: string[];
  verified: boolean;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FactCheck {
  id: string;
  claim: string;
  verdict: 'True' | 'Mostly True' | 'Half True' | 'Mostly False' | 'False' | 'Unverified' | 'Partly False';
  explanation: string;
  topic: string;
  candidateId?: string;
  checkedAt: string;
  sourceUrl: string;
  organization: string;
  methodology?: string;
  trustScore: number;
  tags: string[];
  verified: boolean;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deadline {
  id: string;
  title: string;
  date: string;
  type: 'Registration' | 'Early Voting' | 'Election Day' | 'Candidate Filing' | 'Campaign Finance';
  description: string;
  electionId?: string;
  state?: string;
  lga?: string;
  importance: 'high' | 'medium' | 'low';
  notificationSent: boolean;
  sourceId: string;
  createdAt: string;
}

// API Response types
export interface DataProviderResponse<T> {
  data: T[];
  meta: {
    total: number;
    page?: number;
    pageSize?: number;
    lastSync?: string;
    source: string;
    version: string;
  };
  success: boolean;
  error?: string;
}

// Search and filter types
export interface SearchFilters {
  state?: string;
  lga?: string;
  ward?: string;
  electionType?: string;
  candidateParty?: string;
  date?: {
    from: string;
    to: string;
  };
  verified?: boolean;
}

export interface ComparisonCandidate extends Candidate {
  comparisonKey: string;
  selectedRace?: Race;
}