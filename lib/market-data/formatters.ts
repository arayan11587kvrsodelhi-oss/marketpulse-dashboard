import type { MarketCategory, MarketInstrument, Quote } from "./types";

export const categoryLabels: Record<MarketCategory, string> = {
  stocks: "Stocks",
  indices: "Indices",
  crypto: "Crypto",
  forex: "Forex",
  commodities: "Commodities",
};

export function formatPrice(quote: Quote): string {
  if (quote.price === null) return "Unavailable";
  return formatChartValue(quote.price, quote.instrument);
}

export function formatChartValue(value: number, instrument: MarketInstrument): string {
  const maximumFractionDigits = instrument.category === "forex" ? 4 : 2;
  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
  if (instrument.unit === "index points") return `${number} pts`;
  if (instrument.unit) {
    const currencyValue = instrument.currency ? new Intl.NumberFormat("en-US", { style: "currency", currency: instrument.currency, maximumFractionDigits }).format(value) : number;
    return `${currencyValue} / ${instrument.unit.replace(/^per /, "")}`;
  }
  if (!instrument.currency) return number;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: instrument.currency, maximumFractionDigits }).format(value);
}

export function formatUnitLabel(instrument: MarketInstrument): string {
  if (instrument.unit === "index points") return "index points";
  if (instrument.unit) return `${instrument.currency ?? "simulated units"} ${instrument.unit}`;
  return instrument.currency ? `${instrument.currency} quoted value` : "simulated units";
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
