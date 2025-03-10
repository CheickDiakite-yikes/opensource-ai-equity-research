
export interface EarningsCalendarEntry {
  date: string;
  epsActual: number;
  epsEstimate: number;
  hour: string;
  quarter: number;
  revenueActual: number;
  revenueEstimate: number;
  symbol: string;
  year: number;
}

export interface EarningsCalendarResponse {
  earningsCalendar: EarningsCalendarEntry[];
}
