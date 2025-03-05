
/**
 * DCF Types Enum
 */
export enum DCFType {
  STANDARD = "standard",
  LEVERED = "levered",
  CUSTOM_ADVANCED = "advanced",
  CUSTOM_LEVERED = "custom-levered"
}

/**
 * DCF API Parameters interface
 */
export interface DCFApiParams {
  symbol: string;
  type: DCFType;
  params?: Record<string, any>;
  limit?: number;
}
