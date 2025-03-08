
// API Base URLs
export const API_BASE_URLS = {
  FMP: "https://financialmodelingprep.com/api/v3",
  ALTERNATIVE: "https://alternative-data-api.com/v1",
  NEWS: "https://financial-news-api.com/v1",
  OPENAI: "https://api.openai.com/v1"
};

// API Keys - Use environment variables for frontend
export const FMP_API_KEY = import.meta.env.VITE_FMP_API_KEY || "";
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

// OpenAI Models
export const OPENAI_MODELS = {
  DEFAULT: "gpt-4o-mini",
  ADVANCED: "gpt-4o",
  LEGACY: "gpt-3.5-turbo"
};
