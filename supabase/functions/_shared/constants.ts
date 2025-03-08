
// API Base URLs
export const API_BASE_URLS = {
  FMP: "https://financialmodelingprep.com/api/v3",
  ALTERNATIVE: "https://alternative-data-api.com/v1",
  NEWS: "https://financial-news-api.com/v1",
  OPENAI: "https://api.openai.com/v1"
};

// API Keys
export const FMP_API_KEY = (() => {
  try {
    // @ts-ignore - Deno will exist at runtime in Supabase Edge Functions
    return Deno?.env?.get("FMP_API_KEY") || "";
  } catch {
    return "";
  }
})();

export const OPENAI_API_KEY = (() => {
  try {
    // @ts-ignore - Deno will exist at runtime in Supabase Edge Functions
    return Deno?.env?.get("OPENAI_API_KEY") || "";
  } catch {
    return "";
  }
})();

// OpenAI Models
export const OPENAI_MODELS = {
  DEFAULT: "gpt-4o-mini",
  ADVANCED: "gpt-4o",
  LEGACY: "gpt-3.5-turbo"
};
