import { describe, expect, it } from "vitest";
import { fixtureInstruments, fixtureQuotes, FIXTURE_SOURCE } from "./fixtures";
import { formatChange, formatPrice, formatTimestamp } from "./formatters";
import { MockMarketDataAdapter } from "./mock-adapter";

describe("MarketPulse fixture data", () => {
  const adapter = new MockMarketDataAdapter();

  it("searches by symbol, name, and category", async () => {
    await expect(adapter.searchInstruments("apple")).resolves.toEqual([fixtureInstruments[0]]);
    await expect(adapter.searchInstruments("usd", "forex")).resolves.toHaveLength(2);
    await expect(adapter.searchInstruments("usd", "stocks")).resolves.toEqual([]);
  });

  it("returns an explicit unavailable quote without inventing values", async () => {
    const quote = await adapter.getQuote("MISSING");
    expect(quote?.availability).toBe("unavailable");
    expect(quote?.price).toBeNull();
    expect(quote?.sourceTimestamp).toBeNull();
    expect(quote?.freshness.label).toBe("Unavailable");
  });

  it("labels every fixture quote as simulated", async () => {
    const status = await adapter.getProviderStatus();
    expect(status.isSimulated).toBe(true);
    expect(status.message).toContain("No live provider connection");
    expect(fixtureQuotes.every((quote) => quote.instrument.isSimulated && quote.freshness.isSimulated)).toBe(true);
    expect(fixtureQuotes.every((quote) => quote.sourceLabel === FIXTURE_SOURCE)).toBe(true);
  });

  it("returns historical fixture candles through the adapter", async () => {
    const candles = await adapter.getHistoricalCandles("SPX", "1M");
    expect(candles).toHaveLength(8);
    expect(candles.every((candle) => candle.isSimulated)).toBe(true);
    await expect(adapter.getHistoricalCandles("MISSING", "1M")).resolves.toEqual([]);
  });

  it("formats available and unavailable values clearly", () => {
    const quote = fixtureQuotes[0];
    expect(formatPrice(quote)).toBe("$228.42");
    expect(formatChange(quote.percentageChange)).toBe("+0.96%");
    expect(formatChange(null)).toBe("Unavailable");
    expect(formatTimestamp(quote.sourceTimestamp)).toContain("UTC");
    expect(formatTimestamp(null)).toBe("No source timestamp");
  });
});
