/**
 * Stock Index symbols
 */
export const STOCK_INDICES = {
  // US Indices
  SP500: "^GSPC",
  DOW: "^DJI",
  NASDAQ: "^IXIC",
  RUSSELL: "^RUT",
  VIX: "^VIX",
  
  // European Indices
  FTSE: "^FTSE",
  DAX: "^GDAXI",
  CAC: "^FCHI",
  STOXX50: "^STOXX50E",
  
  // Asian Indices
  NIKKEI: "^N225",
  HANGSENG: "^HSI",
  SHANGHAI: "^SSEC",
  
  // Other Global Indices
  TSX: "^GSPTSE",
  ASX: "^AXJO"
};

/**
 * Common time periods
 */
export const TIME_PERIODS = {
  ANNUAL: "annual",
  QUARTERLY: "quarter",
  TTM: "ttm"
};

/**
 * Common limits
 */
export const LIMITS = {
  DEFAULT: 10,
  MAX: 50
};
