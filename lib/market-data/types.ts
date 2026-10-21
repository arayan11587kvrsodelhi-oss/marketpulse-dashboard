export type MarketCategory =
  | "stocks"
  | "indices"
  | "crypto"
  | "forex"
  | "commodities";

export type QuoteAvailability = "available" | "unavailable";
export type FreshnessStatus = "simulated" | "unavailable";

export interface DataFreshness {
  status: FreshnessStatus;
  label: string;
  isLive: false;
  isSimulated: boolean;
}

export interface MarketInstrument {
  symbol: string;
  name: string;
  category: MarketCategory;
  exchange: string;
  currency?: string;
  unit?: string;
  provider: string;
  isSimulated: true;
}

export interface Quote {
  instrument: MarketInstrument;
  price: number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  sourceTimestamp: string | null;
  retrievedAt: string;
  availability: QuoteAvailability;
  freshness: DataFreshness;
  sourceLabel: string;
}

export interface HistoricalCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  isSimulated: true;
}

export interface ProviderStatus {
  provider: string;
  status: "simulated" | "unavailable";
  checkedAt: string;
  message: string;
  isSimulated: true;
}

export interface MarketDataAdapter {
  getInstruments(): Promise<MarketInstrument[]>;
  searchInstruments(query: string, category?: MarketCategory): Promise<MarketInstrument[]>;
  getQuote(symbol: string): Promise<Quote | null>;
  getHistoricalCandles(symbol: string, range: string): Promise<HistoricalCandle[]>;
  getProviderStatus(): Promise<ProviderStatus>;
}
