
// API Base URLs
export const API_BASE_URLS = {
  FMP: "https://financialmodelingprep.com/api/v3",
  ALTERNATIVE: "https://alternative-data-api.com/v1",
  NEWS: "https://financial-news-api.com/v1",
  OPENAI: "https://api.openai.com/v1"
};

// API Keys
export const FMP_API_KEY = 
  typeof Deno !== 'undefined' ? Deno.env.get("FMP_API_KEY") || "" : "";
export const OPENAI_API_KEY = 
  typeof Deno !== 'undefined' ? Deno.env.get("OPENAI_API_KEY") || "" : "";

// OpenAI Models
export const OPENAI_MODELS = {
  DEFAULT: "gpt-4o-mini",
  ADVANCED: "gpt-4o",
  LEGACY: "gpt-3.5-turbo"
};
