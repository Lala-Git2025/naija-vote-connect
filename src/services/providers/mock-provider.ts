// Mock Data Provider for CivicLens Development
// Provides realistic Nigerian election data for testing and development

import { 
  BaseDataProvider, 
  DataProviderConfig
} from '@/services/data-provider';
import { 
  Election, 
  Race, 
  Candidate, 
  BallotByDistrict, 
  Deadline, 
  PollingUnit, 
  ElectionResult, 
  NewsItem, 
  FactCheck,
  SearchFilters,
  DataProviderResponse 
} from '@/types/election';

export class MockProvider extends BaseDataProvider {
  readonly name = 'MOCK_DATA';
  readonly version = '1.0.0';
  
  constructor(config: DataProviderConfig = { name: 'MOCK_DATA' }) {
    super(config);
  }
  
  get isAvailable(): boolean {
    return true;
  }
  
  async getElections(filters?: SearchFilters): Promise<DataProviderResponse<Election>> {
    const elections: Election[] = [
      {
        id: 'ng-2027-presidential',
        name: '2027 Nigerian Presidential Election',
        type: 'Presidential',
        date: '2027-02-25T00:00:00.000Z',
        registrationDeadline: '2026-06-30T23:59:59.000Z',
        earlyVotingStart: '2027-02-22T08:00:00.000Z',
        earlyVotingEnd: '2027-02-24T18:00:00.000Z',
        status: 'upcoming',
        description: 'Presidential and National Assembly elections for the Federal Republic of Nigeria',
        officialUrl: 'https://inecnigeria.org/2027-elections',
        sourceId: this.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ng-2027-governorship',
        name: '2027 Nigerian Governorship Elections',
        type: 'Gubernatorial',
        date: '2027-03-11T00:00:00.000Z',
        registrationDeadline: '2026-06-30T23:59:59.000Z',
        status: 'upcoming',
        description: 'Governorship and State Assembly elections across Nigerian states',
        officialUrl: 'https://inecnigeria.org/2027-elections',
        sourceId: this.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    let filteredElections = elections;
    
    if (filters?.date) {
      const fromDate = new Date(filters.date.from);
      const toDate = new Date(filters.date.to);
      filteredElections = elections.filter(e => {
        const electionDate = new Date(e.date);
        return electionDate >= fromDate && electionDate <= toDate;
      });
    }
    
    return {
      data: filteredElections,
      meta: {
        total: filteredElections.length,
        source: this.name,
        version: this.version,
        lastSync: new Date().toISOString()
      },
      success: true
    };
  }
  
  async getRaces(electionId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Race>> {
    const races: Race[] = [
      {
        id: 'ng-2027-pres-race',
        electionId: 'ng-2027-presidential',
        name: 'President of Nigeria',
        office: 'President',
        district: 'Federal Republic of Nigeria',
        state: 'All States',
        candidates: ['candidate-tinubu', 'candidate-atiku', 'candidate-obi', 'candidate-kwankwaso'],
        pollingUnits: ['pu-lagos-1', 'pu-abuja-1', 'pu-kano-1'],
        sourceId: this.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ng-2027-lagos-gov',
        electionId: 'ng-2027-governorship',
        name: 'Governor of Lagos State',
        office: 'Governor',
        district: 'Lagos State',
        state: 'Lagos',
        candidates: ['candidate-sanwo-olu', 'candidate-jandor'],
        pollingUnits: ['pu-lagos-1', 'pu-lagos-2'],
        sourceId: this.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    let filteredRaces = races;
    
    if (electionId) {
      filteredRaces = races.filter(r => r.electionId === electionId);
    }
    
    if (filters?.state) {
      filteredRaces = filteredRaces.filter(r => r.state.toLowerCase().includes(filters.state!.toLowerCase()));
    }
    
    return {
      data: filteredRaces,
      meta: {
        total: filteredRaces.length,
        source: this.name,
        version: this.version,
        lastSync: new Date().toISOString()
      },
      success: true
    };
  }
  
  async getCandidates(raceId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Candidate>> {
    const candidates: Candidate[] = [
      {
        id: 'candidate-tinubu',
        name: 'Bola Ahmed Tinubu',
        party: 'All Progressives Congress',
        partyAbbreviation: 'APC',
        photo: '/api/placeholder/150/150',
        biography: 'Former Governor of Lagos State and National Leader of the APC.',
        experience: ['Governor of Lagos State (1999-2007)', 'Senator (1993-1999)'],
        education: ['Chicago State University', 'Richard J. Daley College'],
        positions: [
          {
            issue: 'Economy',
            category: 'Economy',
            stance: 'Pro-business policies and economic diversification',
            details: 'Focus on infrastructure development and job creation',
            verified: true
          }
        ],
        endorsements: [
          {
            organization: 'Lagos State APC',
            type: 'Organization',
            description: 'Full party endorsement',
            date: '2026-10-01T00:00:00.000Z',
            verified: true
          }
        ],
        funding: [
          {
            source: 'APC Party Funds',
            amount: 50000000,
            currency: 'NGN',
            type: 'Party',
            date: '2026-10-01T00:00:00.000Z',
            verified: true
          }
        ],
        socialMedia: {
          twitter: '@officialABAT',
          facebook: 'BolaAhmedTinubu',
          website: 'https://tinubu2027.ng'
        },
        verified: true,
        sourceId: this.name,
        races: ['ng-2027-pres-race'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'candidate-atiku',
        name: 'Atiku Abubakar',
        party: 'Peoples Democratic Party',
        partyAbbreviation: 'PDP',
        photo: '/api/placeholder/150/150',
        biography: 'Former Vice President of Nigeria and businessman.',
        experience: ['Vice President (1999-2007)', 'Customs Officer'],
        education: ['Ahmadu Bello University'],
        positions: [
          {
            issue: 'Economy',
            category: 'Economy',
            stance: 'Economic restructuring and privatization',
            details: 'Believes in market-driven economic policies',
            verified: true
          }
        ],
        endorsements: [
          {
            organization: 'PDP National Executive',
            type: 'Organization',
            description: 'Party nomination',
            date: '2026-09-15T00:00:00.000Z',
            verified: true
          }
        ],
        funding: [
          {
            source: 'PDP Campaign Fund',
            amount: 45000000,
            currency: 'NGN',
            type: 'Party',
            date: '2026-09-15T00:00:00.000Z',
            verified: true
          }
        ],
        socialMedia: {
          twitter: '@atiku',
          website: 'https://atiku2027.com'
        },
        verified: true,
        sourceId: this.name,
        races: ['ng-2027-pres-race'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'candidate-obi',
        name: 'Peter Obi',
        party: 'Labour Party',
        partyAbbreviation: 'LP',
        photo: '/api/placeholder/150/150',
        biography: 'Former Governor of Anambra State and businessman.',
        experience: ['Governor of Anambra State (2006-2014)', 'Businessman'],
        education: ['University of Nigeria, Nsukka'],
        positions: [
          {
            issue: 'Youth Employment',
            category: 'Economy',
            stance: 'Focus on job creation for young Nigerians',
            details: 'Technology and agriculture-driven economic growth',
            verified: true
          }
        ],
        endorsements: [
          {
            organization: 'Labour Party',
            type: 'Organization',
            description: 'Party candidate',
            date: '2026-08-20T00:00:00.000Z',
            verified: true
          }
        ],
        funding: [
          {
            source: 'Grassroots Donations',
            amount: 30000000,
            currency: 'NGN',
            type: 'Individual',
            date: '2026-08-20T00:00:00.000Z',
            verified: true
          }
        ],
        socialMedia: {
          twitter: '@PeterObi',
          facebook: 'PeterObi',
          website: 'https://peterobi2027.ng'
        },
        verified: true,
        sourceId: this.name,
        races: ['ng-2027-pres-race'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    let filteredCandidates = candidates;
    
    if (raceId) {
      filteredCandidates = candidates.filter(c => c.races.includes(raceId));
    }
    
    if (filters?.candidateParty) {
      filteredCandidates = filteredCandidates.filter(c => 
        c.partyAbbreviation.toLowerCase().includes(filters.candidateParty!.toLowerCase())
      );
    }
    
    return {
      data: filteredCandidates,
      meta: {
        total: filteredCandidates.length,
        source: this.name,
        version: this.version,
        lastSync: new Date().toISOString()
      },
      success: true
    };
  }
  
  async getBallotByDistrict(state: string, lga: string, ward?: string): Promise<DataProviderResponse<BallotByDistrict>> {
    // Mock ballot data
    const elections = await this.getElections();
    const races = await this.getRaces();
    const pollingUnits = await this.getPollingUnits({ state, lga });
    
    const ballot: BallotByDistrict = {
      id: `ballot-${state}-${lga}${ward ? `-${ward}` : ''}`,
      state,
      lga,
      ward,
      elections: elections.data,
      races: races.data.filter(r => r.state === state || r.state === 'All States'),
      pollingUnits: pollingUnits.data,
      registrationInfo: {
        deadline: '2026-06-30T23:59:59.000Z',
        requirements: [
          'Valid National ID Card',
          'Proof of residence',
          'Age 18 and above'
        ],
        locations: [
          {
            name: 'INEC Office ' + lga,
            address: `123 Main Street, ${lga}, ${state}`,
            hours: 'Monday-Friday 8AM-5PM',
            contact: '+234-800-123-4567'
          }
        ],
        onlineUrl: 'https://cvr.inecnigeria.org'
      },
      sourceId: this.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      data: [ballot],
      meta: {
        total: 1,
        source: this.name,
        version: this.version,
        lastSync: new Date().toISOString()
      },
      success: true
    };
  }
  
  async getPollingUnits(filters?: SearchFilters): Promise<DataProviderResponse<PollingUnit>> {
    const pollingUnits: PollingUnit[] = [
      {
        id: 'pu-lagos-1',
        name: 'Victoria Island Primary School',
        code: 'LA/VI/001',
        address: '123 Akin Adesola Street, Victoria Island, Lagos',
        ward: 'Victoria Island',
        lga: 'Lagos Island',
        state: 'Lagos',
        latitude: 6.4281,
        longitude: 3.4219,
        registeredVoters: 1250,
        accessibility: true,
        sourceId: this.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return {
      data: pollingUnits,
      meta: {
        total: pollingUnits.length,
        source: this.name,
        version: this.version,
        lastSync: new Date().toISOString()
      },
      success: true
    };
  }
  
  async getDeadlines(filters?: SearchFilters): Promise<DataProviderResponse<Deadline>> {
    const deadlines: Deadline[] = [
      {
        id: 'deadline-registration-2026',
        title: 'Voter Registration Deadline',
        date: '2026-06-30T23:59:59.000Z',
        type: 'Registration',
        description: 'Last day to register to vote in 2027 elections',
        importance: 'high',
        notificationSent: false,
        sourceId: this.name,
        createdAt: new Date().toISOString()
      },
      {
        id: 'deadline-election-day-2027',
        title: '2027 Presidential Election Day',
        date: '2027-02-25T08:00:00.000Z',
        type: 'Election Day',
        description: 'Presidential and National Assembly elections',
        electionId: 'ng-2027-presidential',
        importance: 'high',
        notificationSent: false,
        sourceId: this.name,
        createdAt: new Date().toISOString()
      }
    ];
    
    return {
      data: deadlines,
      meta: {
        total: deadlines.length,
        source: this.name,
        version: this.version,
        lastSync: new Date().toISOString()
      },
      success: true
    };
  }
  
  async getResults(raceId?: string, pollingUnitId?: string): Promise<DataProviderResponse<ElectionResult>> {
    // Results not available for future elections
    return {
      data: [],
      meta: {
        total: 0,
        source: this.name,
        version: this.version
      },
      success: true
    };
  }
  
  async getNews(filters?: SearchFilters): Promise<DataProviderResponse<NewsItem>> {
    return {
      data: [],
      meta: {
        total: 0,
        source: this.name,
        version: this.version
      },
      success: true
    };
  }
  
  async getFactChecks(candidateId?: string, topic?: string): Promise<DataProviderResponse<FactCheck>> {
    return {
      data: [],
      meta: {
        total: 0,
        source: this.name,
        version: this.version
      },
      success: true
    };
  }
  
  async getLastSync(): Promise<string | null> {
    return new Date().toISOString();
  }
  
  async sync(): Promise<{ success: boolean; changes: number; error?: string }> {
    return { success: true, changes: 0 };
  }
  
  async checkHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    return { healthy: true, latency: 10 };
  }
}