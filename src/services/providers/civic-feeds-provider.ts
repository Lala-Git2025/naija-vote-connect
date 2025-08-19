// Civic Feeds Provider for CivicLens
// Aggregates news and civic education content from reputable Nigerian sources

import { 
  BaseDataProvider, 
  DataProviderConfig,
  DataProviderResponse 
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
  SearchFilters 
} from '@/types/election';

export interface CivicFeedsConfig extends DataProviderConfig {
  feedUrls: {
    rss: string[];
    atom: string[];
  };
  sources: {
    name: string;
    url: string;
    type: 'news' | 'civic' | 'government';
    trustLevel: 'high' | 'medium' | 'low';
    lastChecked?: string;
  }[];
  refreshIntervalHours: number;
}

export class CivicFeedsProvider extends BaseDataProvider {
  readonly name = 'CIVIC_FEEDS';
  readonly version = '1.0.0';
  
  private feedsConfig: CivicFeedsConfig;
  private cache: Map<string, { data: NewsItem[]; timestamp: number }> = new Map();
  
  constructor(config: CivicFeedsConfig) {
    super(config);
    this.feedsConfig = config;
  }
  
  get isAvailable(): boolean {
    return this.feedsConfig.feedUrls.rss.length > 0 || 
           this.feedsConfig.feedUrls.atom.length > 0;
  }

  // Core methods (return empty for non-news data)
  async getElections(): Promise<DataProviderResponse<Election>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getRaces(): Promise<DataProviderResponse<Race>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getCandidates(): Promise<DataProviderResponse<Candidate>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getBallotByDistrict(): Promise<DataProviderResponse<BallotByDistrict>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getPollingUnits(): Promise<DataProviderResponse<PollingUnit>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getDeadlines(): Promise<DataProviderResponse<Deadline>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getResults(): Promise<DataProviderResponse<ElectionResult>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getFactChecks(): Promise<DataProviderResponse<FactCheck>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  // News implementation
  async getNews(filters?: SearchFilters): Promise<DataProviderResponse<NewsItem>> {
    await this.rateLimit();
    
    try {
      const allNews = await this.fetchAllFeeds();
      const filteredNews = this.applyFilters(allNews, filters);
      
      return {
        data: filteredNews,
        meta: {
          total: filteredNews.length,
          source: this.name,
          version: this.version,
          lastSync: await this.getLastSync()
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch news'
      };
    }
  }

  async sync(): Promise<{ success: boolean; changes: number; error?: string }> {
    try {
      const before = this.cache.size;
      await this.fetchAllFeeds(true); // Force refresh
      const after = this.cache.size;
      
      // Update last sync
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${this.name}_lastSync`, new Date().toISOString());
      }
      
      return { success: true, changes: Math.abs(after - before) };
    } catch (error) {
      return { 
        success: false, 
        changes: 0, 
        error: error instanceof Error ? error.message : 'Sync failed' 
      };
    }
  }

  async getLastSync(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`${this.name}_lastSync`);
  }

  async checkHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const start = Date.now();
    
    try {
      // Test a few feed endpoints
      const testUrls = [
        ...this.feedsConfig.feedUrls.rss.slice(0, 2),
        ...this.feedsConfig.feedUrls.atom.slice(0, 2)
      ];
      
      const healthChecks = await Promise.allSettled(
        testUrls.map(url => this.testFeedUrl(url))
      );
      
      const successCount = healthChecks.filter(check => check.status === 'fulfilled').length;
      const healthy = successCount > 0;
      const latency = Date.now() - start;
      
      return { 
        healthy, 
        latency,
        error: healthy ? undefined : 'All feed endpoints failed'
      };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Health check failed' 
      };
    }
  }

  // Private methods
  private async fetchAllFeeds(forceRefresh = false): Promise<NewsItem[]> {
    const cacheKey = 'all_feeds';
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    const cacheValidUntil = now - (this.feedsConfig.refreshIntervalHours * 60 * 60 * 1000);
    
    if (!forceRefresh && cached && cached.timestamp > cacheValidUntil) {
      return cached.data;
    }

    const allNews: NewsItem[] = [];
    
    // Fetch RSS feeds
    for (const rssUrl of this.feedsConfig.feedUrls.rss) {
      try {
        const items = await this.fetchRSSFeed(rssUrl);
        allNews.push(...items);
      } catch (error) {
        console.warn(`Failed to fetch RSS feed ${rssUrl}:`, error);
      }
    }
    
    // Fetch Atom feeds
    for (const atomUrl of this.feedsConfig.feedUrls.atom) {
      try {
        const items = await this.fetchAtomFeed(atomUrl);
        allNews.push(...items);
      } catch (error) {
        console.warn(`Failed to fetch Atom feed ${atomUrl}:`, error);
      }
    }
    
    // Deduplicate and sort by date
    const uniqueNews = this.deduplicateNews(allNews);
    uniqueNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    // Cache the results
    this.cache.set(cacheKey, { data: uniqueNews, timestamp: now });
    
    return uniqueNews;
  }

  private async fetchRSSFeed(url: string): Promise<NewsItem[]> {
    // In a real implementation, this would parse RSS/XML
    // For now, return mock data based on known Nigerian news sources
    return this.getMockNewsForSource(url);
  }

  private async fetchAtomFeed(url: string): Promise<NewsItem[]> {
    // In a real implementation, this would parse Atom/XML
    // For now, return mock data based on known Nigerian news sources
    return this.getMockNewsForSource(url);
  }

  private async testFeedUrl(url: string): Promise<boolean> {
    try {
      // Simple fetch test - in real implementation would validate feed format
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private getMockNewsForSource(sourceUrl: string): NewsItem[] {
    const sourceName = this.getSourceNameFromUrl(sourceUrl);
    const now = new Date();
    
    return [
      {
        id: `news_${Date.now()}_1`,
        title: `${sourceName}: Latest Election Updates`,
        summary: 'Recent developments in the upcoming elections and candidate preparations.',
        content: 'Full article content would be here...',
        author: `${sourceName} Editorial Team`,
        publishedAt: new Date(now.getTime() - Math.random() * 86400000 * 7).toISOString(), // Within last week
        url: sourceUrl,
        imageUrl: undefined,
        tags: ['election', 'politics', 'INEC'],
        category: 'Politics',
        verified: true,
        sourceId: this.name,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: `news_${Date.now()}_2`,
        title: `${sourceName}: Voter Education Initiative`,
        summary: 'Ongoing efforts to educate voters about the democratic process.',
        content: 'Full article content would be here...',
        author: `${sourceName} Correspondent`,
        publishedAt: new Date(now.getTime() - Math.random() * 86400000 * 3).toISOString(), // Within last 3 days
        url: sourceUrl,
        imageUrl: undefined,
        tags: ['voter-education', 'democracy', 'civic-engagement'],
        category: 'Civic Education',
        verified: true,
        sourceId: this.name,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
  }

  private getSourceNameFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      
      // Map known Nigerian news sources
      const sourceMap: Record<string, string> = {
        'punchng.com': 'Punch Newspapers',
        'vanguardngr.com': 'Vanguard',
        'thenationonlineng.net': 'The Nation',
        'premiumtimesng.com': 'Premium Times',
        'dailytrust.com': 'Daily Trust',
        'guardian.ng': 'The Guardian Nigeria',
        'channelstv.com': 'Channels TV',
        'leadership.ng': 'Leadership Newspaper'
      };
      
      return sourceMap[domain] || domain;
    } catch {
      return 'Unknown Source';
    }
  }

  private deduplicateNews(news: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    const unique: NewsItem[] = [];
    
    for (const item of news) {
      // Create a hash based on title and published date
      const hash = `${item.title.toLowerCase().trim()}_${item.publishedAt}`;
      
      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(item);
      }
    }
    
    return unique;
  }

  private applyFilters(news: NewsItem[], filters?: SearchFilters): NewsItem[] {
    if (!filters) return news;

    return news.filter(item => {
      if (filters.date) {
        const publishedDate = new Date(item.publishedAt);
        const fromDate = new Date(filters.date.from);
        const toDate = new Date(filters.date.to);
        
        if (publishedDate < fromDate || publishedDate > toDate) {
          return false;
        }
      }
      
      if (filters.verified !== undefined && item.verified !== filters.verified) {
        return false;
      }
      
      return true;
    });
  }
}