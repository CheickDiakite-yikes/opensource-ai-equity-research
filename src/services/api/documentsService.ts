
// Re-export everything from the documents folder
export * from './documents';

// Export the main document APIs
export {
  // Transcript APIs
  fetchEarningsTranscripts,
  fetchTranscriptDates,
  fetchSymbolsWithTranscripts,
  fetchLatestTranscripts,
  generateTranscriptHighlights,
  downloadEarningsTranscript,
  
  // SEC Filings APIs
  fetchSECFilings,
  fetchSECFilingsByFormType,
  fetchLatestSECFilings,
  fetchLatest8KFilings,
  fetchSECCompanyProfile,
  getSECFilingDownloadLink,
  
  // Caching API
  triggerDocumentCaching
} from './documents';
