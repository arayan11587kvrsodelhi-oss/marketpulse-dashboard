import { unavailableFreshness } from "./freshness";
import { FIXTURE_SOURCE, FIXTURE_TIMESTAMP, fixtureCandles, fixtureInstruments, fixtureQuotes } from "./fixtures";
import type { MarketCategory, MarketDataAdapter, ProviderStatus, Quote } from "./types";

export class MockMarketDataAdapter implements MarketDataAdapter {
  async getInstruments() {
    return fixtureInstruments;
  }

  async searchInstruments(query: string, category?: MarketCategory) {
    const normalizedQuery = query.trim().toLowerCase();
    return fixtureInstruments.filter((instrument) => {
      const matchesCategory = !category || instrument.category === category;
      const matchesQuery = !normalizedQuery || `${instrument.symbol} ${instrument.name}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }

  async getQuote(symbol: string): Promise<Quote | null> {
    return fixtureQuotes.find((quote) => quote.instrument.symbol === symbol) ?? {
      instrument: {
        symbol,
        name: "Unavailable instrument",
        category: "stocks",
        exchange: "Unavailable",
        currency: "USD",
        provider: FIXTURE_SOURCE,
        isSimulated: true,
      },
      price: null,
      absoluteChange: null,
      percentageChange: null,
      sourceTimestamp: null,
      retrievedAt: FIXTURE_TIMESTAMP,
      availability: "unavailable",
      freshness: unavailableFreshness(),
      sourceLabel: FIXTURE_SOURCE,
    };
  }

  async getHistoricalCandles(symbol: string, range: string) {
    if (!range) {
      return [];
    }

    return fixtureCandles[symbol] ?? [];
  }

  async getProviderStatus(): Promise<ProviderStatus> {
    return {
      provider: FIXTURE_SOURCE,
      status: "simulated",
      checkedAt: FIXTURE_TIMESTAMP,
      message: "Fixture data only. No live provider connection exists.",
      isSimulated: true,
    };
  }
}
