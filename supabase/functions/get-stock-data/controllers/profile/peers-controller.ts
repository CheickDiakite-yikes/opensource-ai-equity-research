
import { makeApiRequest } from "../../../_shared/api-utils.ts";
import { FMP_API_KEY } from "../../../_shared/constants.ts";
import { BaseProfileController } from "./base-profile-controller.ts";

/**
 * Controller for company peers related endpoints
 */
export class PeersController extends BaseProfileController {
  /**
   * Fetch company peers
   */
  async fetchPeers(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/stock-peers?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "peers", symbol);
      
      const data = await makeApiRequest<any[]>(url);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return [{ symbol, peers: [] }];
      }
      
      return data;
    } catch (error) {
      console.warn(`Peers data fetch failed: ${error.message}`);
      return [{ symbol, peers: [] }];
    }
  }
}
