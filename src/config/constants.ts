
// API Base URLs
export const API_BASE_URLS = {
  FMP: "https://financialmodelingprep.com/api/v3",
  ALTERNATIVE: "https://alternative-data-api.com/v1",
  NEWS: "https://financial-news-api.com/v1",
  OPENAI: "https://api.openai.com/v1"
};

// API Keys - Use environment variables for frontend
// Using optional chaining for safer access to environment variables
export const FMP_API_KEY = import.meta.env?.VITE_FMP_API_KEY || "";
export const OPENAI_API_KEY = import.meta.env?.VITE_OPENAI_API_KEY || "";

// For development/demo purposes, you can set a demo API key here if the env variable is not available
// This should be removed or replaced with your actual API key in production
if (!FMP_API_KEY) {
  console.warn("FMP API key is not set. Some features may not work properly.");
  // You can add a demo key here for development: export const FMP_API_KEY = "your-demo-key";
}

// OpenAI Models
export const OPENAI_MODELS = {
  DEFAULT: "gpt-4o-mini",
  ADVANCED: "gpt-4o",
  LEGACY: "gpt-3.5-turbo"
};
