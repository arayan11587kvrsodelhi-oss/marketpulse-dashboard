import type { HistoricalCandle, MarketInstrument, Quote } from "./types";
import { simulatedFreshness } from "./freshness";

export const FIXTURE_SOURCE = "MarketPulse simulated fixture catalog";
export const FIXTURE_TIMESTAMP = "2026-10-21T12:00:00.000Z";

export const fixtureInstruments: MarketInstrument[] = [
  { symbol: "AAPL", name: "Apple Inc.", category: "stocks", exchange: "NASDAQ", currency: "USD", provider: FIXTURE_SOURCE, isSimulated: true },
  { symbol: "MSFT", name: "Microsoft Corporation", category: "stocks", exchange: "NASDAQ", currency: "USD", provider: FIXTURE_SOURCE, isSimulated: true },
  { symbol: "SPX", name: "S&P 500", category: "indices", exchange: "CBOE", currency: "USD", provider: FIXTURE_SOURCE, isSimulated: true },
  { symbol: "NDX", name: "Nasdaq 100", category: "indices", exchange: "NASDAQ", currency: "USD", provider: FIXTURE_SOURCE, isSimulated: true },
  { symbol: "BTC-USD", name: "Bitcoin / US Dollar", category: "crypto", exchange: "Aggregated fixture", currency: "USD", provider: FIXTURE_SOURCE, isSimulated: true },
  { symbol: "ETH-USD", name: "Ethereum / US Dollar", category: "crypto", exchange: "Aggregated fixture", currency: "USD", provider: FIXTURE_SOURCE, isSimulated: true },
  { symbol: "EURUSD", name: "Euro / US Dollar", category: "forex", exchange: "OTC fixture", currency: "USD", provider: FIXTURE_SOURCE, isSimulated: true },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", category: "forex", exchange: "OTC fixture", currency: "JPY", provider: FIXTURE_SOURCE, isSimulated: true },
  { symbol: "XAUUSD", name: "Gold / US Dollar", category: "commodities", exchange: "Indicative fixture", currency: "USD", unit: "per troy ounce", provider: FIXTURE_SOURCE, isSimulated: true },
  { symbol: "XAGUSD", name: "Silver / US Dollar", category: "commodities", exchange: "Indicative fixture", currency: "USD", unit: "per troy ounce", provider: FIXTURE_SOURCE, isSimulated: true },
];

const fixtureNumbers: Record<string, { price: number; absoluteChange: number; percentageChange: number }> = {
  AAPL: { price: 228.42, absoluteChange: 2.18, percentageChange: 0.96 },
  MSFT: { price: 511.08, absoluteChange: -1.34, percentageChange: -0.26 },
  SPX: { price: 5842.11, absoluteChange: 31.42, percentageChange: 0.54 },
  NDX: { price: 20428.17, absoluteChange: 94.32, percentageChange: 0.46 },
  "BTC-USD": { price: 68420.5, absoluteChange: 812.3, percentageChange: 1.2 },
  "ETH-USD": { price: 2640.18, absoluteChange: -18.42, percentageChange: -0.69 },
  EURUSD: { price: 1.0874, absoluteChange: 0.0021, percentageChange: 0.19 },
  USDJPY: { price: 149.62, absoluteChange: -0.38, percentageChange: -0.25 },
  XAUUSD: { price: 2742.8, absoluteChange: 14.6, percentageChange: 0.53 },
  XAGUSD: { price: 32.48, absoluteChange: -0.22, percentageChange: -0.67 },
};

export const fixtureQuotes: Quote[] = fixtureInstruments.map((instrument) => ({
  instrument,
  ...fixtureNumbers[instrument.symbol],
  sourceTimestamp: FIXTURE_TIMESTAMP,
  retrievedAt: FIXTURE_TIMESTAMP,
  availability: "available",
  freshness: simulatedFreshness(),
  sourceLabel: FIXTURE_SOURCE,
}));

export const fixtureCandles: Record<string, HistoricalCandle[]> = Object.fromEntries(
  fixtureInstruments.map((instrument, instrumentIndex) => [
    instrument.symbol,
    Array.from({ length: 8 }, (_, index) => {
      const base = fixtureNumbers[instrument.symbol].price;
      const offset = (index - 4) * (base * 0.004);
      const close = Number((base + offset).toFixed(instrument.category === "forex" ? 4 : 2));
      return {
        timestamp: `2026-10-${String(14 + index).padStart(2, "0")}T12:00:00.000Z`,
        open: close - instrumentIndex * 0.02,
        high: close + instrumentIndex * 0.03 + 0.1,
        low: close - instrumentIndex * 0.03 - 0.1,
        close,
        volume: instrumentIndex % 2 === 0 ? 1000000 + index * 18000 : undefined,
        isSimulated: true as const,
      };
    }),
  ]),
);
