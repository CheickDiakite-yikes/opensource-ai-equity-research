
// Re-export indicesService and stockDataService
export * from './indicesService';
// Export stockDataService selectively to avoid duplicates with newsService
export { 
  fetchHistoricalPrices,
  fetchCompanyPeers,
  fetchCompanyLogo 
} from './stockDataService';
export * from './indicesDataService';

// Export newsService without duplicates
export * from './newsService';
