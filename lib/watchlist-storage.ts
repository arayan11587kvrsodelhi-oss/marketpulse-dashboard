export const WATCHLIST_STORAGE_KEY = "marketpulse-watchlist";
const SYMBOL_PATTERN = /^[A-Z0-9]+(?:[-./][A-Z0-9]+)*$/;

export function isValidWatchlistSymbol(value: unknown): value is string {
  return typeof value === "string" && value.length <= 20 && SYMBOL_PATTERN.test(value);
}

export function parseWatchlist(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return [...new Set(parsed.filter(isValidWatchlistSymbol))];
  } catch {
    return [];
  }
}

export function readWatchlist(storage: Storage | null): string[] {
  if (!storage) return [];

  try {
    return parseWatchlist(storage.getItem(WATCHLIST_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function writeWatchlist(storage: Storage | null, symbols: string[]): boolean {
  if (!storage) return false;

  try {
    storage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(symbols.filter(isValidWatchlistSymbol)));
    return true;
  } catch {
    return false;
  }
}
