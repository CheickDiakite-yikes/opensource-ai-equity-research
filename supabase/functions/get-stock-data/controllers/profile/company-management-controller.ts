
import { makeApiRequest } from "../../_shared/api-utils.ts";
import { FMP_API_KEY } from "../../_shared/constants.ts";
import { BaseProfileController } from "./base-profile-controller.ts";

/**
 * Controller for company management related endpoints
 */
export class CompanyManagementController extends BaseProfileController {
  /**
   * Fetch company executives
   */
  async fetchExecutives(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/key-executives/${symbol}?apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "executives", symbol);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Executives data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch executive compensation
   */
  async fetchExecutiveCompensation(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/governance-executive-compensation/${symbol}?apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "executive compensation", symbol);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Executive compensation data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch company notes
   */
  async fetchCompanyNotes(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/company-notes?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "company notes", symbol);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Company notes data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch employee count
   */
  async fetchEmployeeCount(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/employee-count?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "employee count", symbol);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Employee count data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch historical employee count
   */
  async fetchHistoricalEmployeeCount(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/historical-employee-count?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "historical employee count", symbol);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Historical employee count data fetch failed: ${error.message}`);
      return [];
    }
  }
}
