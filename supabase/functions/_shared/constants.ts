
// API Base URLs
export const API_BASE_URLS = {
  FMP: "https://financialmodelingprep.com/api/v3",
  ALTERNATIVE: "https://alternative-data-api.com/v1",
  NEWS: "https://financial-news-api.com/v1",
  OPENAI: "https://api.openai.com/v1"
};

// API Keys
export const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";
export const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

// OpenAI Models
export const OPENAI_MODELS = {
  DEFAULT: "o3-mini",
  ADVANCED: "o3-mini", 
  LEGACY: "gpt-3.5-turbo"
};

// OpenAI config for better outputs from o3-mini
export const OPENAI_CONFIG = {
  // Default temperature settings
  TEMPERATURE: {
    PRECISE: 0.2,  // For financial calculations and predictions
    BALANCED: 0.5, // For general analysis
    CREATIVE: 0.7  // For text generation with more variation
  },
  // Reasoning effort levels
  REASONING_EFFORT: {
    LOW: "low",      // Quick, basic analysis
    MEDIUM: "medium", // Standard depth analysis
    HIGH: "high"      // Deep, thorough analysis
  }
};
