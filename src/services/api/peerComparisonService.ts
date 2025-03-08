import { invokeSupabaseFunction } from "./base";
import { fetchCompanyPeers } from "./marketDataService";
import { fetchKeyRatiosTTM } from "./financialService";
import { StockProfile, StockQuote } from "@/types/profile/companyTypes";

export interface PeerCompany {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  evToEbitda: number;
  evToRevenue: number;
  revenueGrowth: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
}

/**
 * Fetch peer comparison data for a given symbol
 */
export const fetchPeerComparisonData = async (
  symbol: string,
  profile: StockProfile,
  quote: StockQuote
): Promise<PeerCompany[]> => {
  try {
    // Get list of peer companies
    const peers = await fetchCompanyPeers(symbol);
    
    // Add the original company to the list of peers for comparison
    const allSymbols = [symbol, ...peers.filter(peer => peer !== symbol)].slice(0, 10);
    
    // Fetch key ratios for all peers in parallel
    const peerDataPromises = allSymbols.map(async (peerSymbol) => {
      try {
        // Get key ratios TTM for the current peer
        const ratios = await fetchKeyRatiosTTM(peerSymbol);
        
        // Fetch basic quote data if this is not the original company
        let peerQuote: StockQuote | null = null;
        let peerProfile: StockProfile | null = null;
        
        if (peerSymbol === symbol) {
          peerQuote = quote;
          peerProfile = profile;
        } else {
          // Use peers-controller from the API for more efficient API usage
          const peersData = await invokeSupabaseFunction<any>('get-stock-data', {
            symbol: peerSymbol,
            endpoint: 'quote'
          });
          
          if (peersData && peersData.length > 0) {
            peerQuote = peersData[0];
          }
          
          const profileData = await invokeSupabaseFunction<any>('get-stock-data', {
            symbol: peerSymbol,
            endpoint: 'profile'
          });
          
          if (profileData && profileData.length > 0) {
            peerProfile = profileData[0];
          }
        }
        
        if (!peerQuote || !ratios) {
          return null;
        }
        
        return {
          symbol: peerSymbol,
          name: peerProfile?.companyName || peerQuote.name || peerSymbol,
          price: peerQuote.price || 0,
          marketCap: peerQuote.marketCap || 0,
          enterpriseValue: ratios.enterpriseValueTTM || 0,
          peRatio: peerQuote.pe || ratios.peRatioTTM || 0,
          evToEbitda: ratios.evToEBITDATTM || 0,
          evToRevenue: ratios.evToSalesTTM || 0,
          revenueGrowth: ratios.revenueGrowthTTMYoy || null,
          grossMargin: ratios.grossProfitMarginTTM || null,
          operatingMargin: ratios.operatingProfitMarginTTM || null,
          netMargin: ratios.netProfitMarginTTM || null
        };
      } catch (error) {
        console.error(`Error fetching peer data for ${peerSymbol}:`, error);
        return null;
      }
    });
    
    const peerResults = await Promise.all(peerDataPromises);
    
    // Filter out any null values and return the valid peer data
    return peerResults.filter(Boolean) as PeerCompany[];
  } catch (error) {
    console.error("Error fetching peer comparison data:", error);
    return [];
  }
};
