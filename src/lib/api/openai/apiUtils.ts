
/**
 * OpenAI API Utilities
 */

import { toast } from "sonner";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

type ReasoningEffort = "low" | "medium" | "high";

/**
 * Call OpenAI API with proper error handling and retries
 */
export async function callOpenAI(
  messages: Message[],
  reasoningEffort: ReasoningEffort = "medium",
  maxRetries: number = 3
): Promise<any> {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      console.log(`Calling OpenAI API (attempt ${retries + 1}/${maxRetries})...`);
      
      // For o3-mini model, we need to use the new reasoning-oriented parameters
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Use gpt-4o-mini as it's available and supported
          messages: messages,
          temperature: 0.2, // Lower temperature for more factual responses
          reasoning: { effort: reasoningEffort }, // Use reasoning effort parameter
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API returned ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("OpenAI API response received successfully");
      return data;
    } catch (error) {
      console.error(`OpenAI API call failed (attempt ${retries + 1}/${maxRetries}):`, error);
      lastError = error;
      retries++;
      if (retries < maxRetries) {
        // Exponential backoff with jitter
        const delay = Math.floor(Math.random() * 1000 + 1000 * Math.pow(2, retries));
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // We've exhausted our retries, show an error notification and throw the last error
  toast.error("Failed to generate AI content after multiple attempts");
  throw lastError;
}
