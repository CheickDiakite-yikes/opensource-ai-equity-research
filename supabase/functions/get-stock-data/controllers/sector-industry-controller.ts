
import { BaseController } from "./base-controller.ts";

export class SectorIndustryController extends BaseController {
  /**
   * Fetch sector performance snapshot
   */
  async fetchSectorPerformance(date: string, exchange?: string, sector?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { date };
      if (exchange) params.exchange = exchange;
      if (sector) params.sector = sector;
      
      const url = this.buildStableUrl(`sector-performance-snapshot`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching sector performance:`, error);
      return [];
    }
  }

  /**
   * Fetch industry performance snapshot
   */
  async fetchIndustryPerformance(date: string, exchange?: string, industry?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { date };
      if (exchange) params.exchange = exchange;
      if (industry) params.industry = industry;
      
      const url = this.buildStableUrl(`industry-performance-snapshot`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching industry performance:`, error);
      return [];
    }
  }

  /**
   * Fetch historical sector performance
   */
  async fetchHistoricalSectorPerformance(sector: string, exchange?: string, from?: string, to?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { sector };
      if (exchange) params.exchange = exchange;
      if (from) params.from = from;
      if (to) params.to = to;
      
      const url = this.buildStableUrl(`historical-sector-performance`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching historical sector performance:`, error);
      return [];
    }
  }

  /**
   * Fetch historical industry performance
   */
  async fetchHistoricalIndustryPerformance(industry: string, exchange?: string, from?: string, to?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { industry };
      if (exchange) params.exchange = exchange;
      if (from) params.from = from;
      if (to) params.to = to;
      
      const url = this.buildStableUrl(`historical-industry-performance`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching historical industry performance:`, error);
      return [];
    }
  }

  /**
   * Fetch sector PE snapshot
   */
  async fetchSectorPE(date: string, exchange?: string, sector?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { date };
      if (exchange) params.exchange = exchange;
      if (sector) params.sector = sector;
      
      const url = this.buildStableUrl(`sector-pe-snapshot`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching sector PE:`, error);
      return [];
    }
  }

  /**
   * Fetch industry PE snapshot
   */
  async fetchIndustryPE(date: string, exchange?: string, industry?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { date };
      if (exchange) params.exchange = exchange;
      if (industry) params.industry = industry;
      
      const url = this.buildStableUrl(`industry-pe-snapshot`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching industry PE:`, error);
      return [];
    }
  }

  /**
   * Fetch historical sector PE
   */
  async fetchHistoricalSectorPE(sector: string, exchange?: string, from?: string, to?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { sector };
      if (exchange) params.exchange = exchange;
      if (from) params.from = from;
      if (to) params.to = to;
      
      const url = this.buildStableUrl(`historical-sector-pe`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching historical sector PE:`, error);
      return [];
    }
  }

  /**
   * Fetch historical industry PE
   */
  async fetchHistoricalIndustryPE(industry: string, exchange?: string, from?: string, to?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { industry };
      if (exchange) params.exchange = exchange;
      if (from) params.from = from;
      if (to) params.to = to;
      
      const url = this.buildStableUrl(`historical-industry-pe`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching historical industry PE:`, error);
      return [];
    }
  }
}
