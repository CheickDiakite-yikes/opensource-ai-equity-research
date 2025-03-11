
/**
 * Database utilities - Main entry point
 * This file exports all database utility functions for easier imports
 */

// Export all database utilities
export { tableExists, addTableExistsFunction } from "./table-utils.ts";
export { createCacheTable } from "./cache-utils.ts";
export { optimizeTranscriptsTable } from "./transcript-utils.ts";
export { optimizeFilingsTable } from "./filing-utils.ts";
export { executeStoredProcedure, executeDBFunction, scheduleCacheCleanup, runSemanticSearch, getRelatedDocuments, extractFinancialMetrics } from "./procedure-utils.ts";
