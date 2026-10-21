import type { MarketCategory, Quote } from "./types";

export const categoryLabels: Record<MarketCategory, string> = {
  stocks: "Stocks",
  indices: "Indices",
  crypto: "Crypto",
  forex: "Forex",
  commodities: "Commodities",
};

export function formatPrice(quote: Quote): string {
  if (quote.price === null) return "Unavailable";
  const maximumFractionDigits = quote.instrument.category === "forex" ? 4 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: quote.instrument.currency,
    maximumFractionDigits,
  }).format(quote.price);
}

export function formatChange(value: number | null): string {
  if (value === null) return "Unavailable";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return "No source timestamp";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(timestamp)) + " UTC";
}
