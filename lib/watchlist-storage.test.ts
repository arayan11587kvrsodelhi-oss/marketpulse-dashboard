import { describe, expect, it } from "vitest";
import { isValidWatchlistSymbol, parseWatchlist, readWatchlist, WATCHLIST_STORAGE_KEY, writeWatchlist } from "./watchlist-storage";

describe("watchlist storage", () => {
  it("accepts only valid symbol strings and removes duplicates", () => {
    expect(parseWatchlist(JSON.stringify(["AAPL", "BTC-USD", "AAPL", "bad symbol", 42, null]))).toEqual(["AAPL", "BTC-USD"]);
    expect(parseWatchlist("{}" )).toEqual([]);
    expect(parseWatchlist("not-json")).toEqual([]);
    expect(isValidWatchlistSymbol("EURUSD")).toBe(true);
    expect(isValidWatchlistSymbol("eurusd")).toBe(false);
  });

  it("handles missing and throwing storage safely", () => {
    expect(readWatchlist(null)).toEqual([]);
    expect(writeWatchlist(null, ["AAPL"])).toBe(false);

    const throwingStorage = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("quota"); },
    } as unknown as Storage;
    expect(readWatchlist(throwingStorage)).toEqual([]);
    expect(writeWatchlist(throwingStorage, ["AAPL"])).toBe(false);
  });

  it("writes only validated symbols", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    } as unknown as Storage;

    expect(writeWatchlist(storage, ["AAPL", "bad symbol", "BTC-USD"])).toBe(true);
    expect(values.get(WATCHLIST_STORAGE_KEY)).toBe(JSON.stringify(["AAPL", "BTC-USD"]));
  });
});
