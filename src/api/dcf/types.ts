
/**
 * Enum for DCF calculation types
 */
export enum DCFType {
  STANDARD = "standard",
  LEVERED = "levered",
  CUSTOM_ADVANCED = "advanced",
  CUSTOM_LEVERED = "custom-levered"
}

/**
 * Interface for DCF API Response
 */
export interface DCFResponse {
  symbol: string;
  date: string;
  dcf: number;
  price: number;
  [key: string]: any;
}
