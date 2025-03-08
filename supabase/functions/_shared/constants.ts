
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
    // Check if we're in a Deno environment safely
    // Approach that works in both TypeScript compilation and runtime
    const hasDeno = typeof globalThis !== 'undefined' && 
                    'Deno' in globalThis && 
                    typeof globalThis.Deno?.env?.get === 'function';
    
    if (hasDeno) {
      // @ts-ignore - Access Deno from globalThis
      return globalThis.Deno?.env?.get("FMP_API_KEY") || "";
    }
    return "";
  } catch {
    return "";
  }
})();

export const OPENAI_API_KEY = (() => {
  try {
    // Check if we're in a Deno environment safely
    // Approach that works in both TypeScript compilation and runtime
    const hasDeno = typeof globalThis !== 'undefined' && 
                    'Deno' in globalThis && 
                    typeof globalThis.Deno?.env?.get === 'function';
    
    if (hasDeno) {
      // @ts-ignore - Access Deno from globalThis
      return globalThis.Deno?.env?.get("OPENAI_API_KEY") || "";
    }
    return "";
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
