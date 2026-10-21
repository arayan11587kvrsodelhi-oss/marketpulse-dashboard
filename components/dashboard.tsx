"use client";

import { useEffect, useMemo, useState } from "react";
import { PriceChart } from "@/components/price-chart";
import { DemandValidation } from "@/components/demand-validation";
import { categoryLabels, formatChange, formatPrice, formatTimestamp } from "@/lib/market-data/formatters";
import { MockMarketDataAdapter } from "@/lib/market-data/mock-adapter";
import { readWatchlist, writeWatchlist } from "@/lib/watchlist-storage";
import type { MarketCategory, Quote } from "@/lib/market-data/types";

const adapter = new MockMarketDataAdapter();
const categories: Array<MarketCategory | "all"> = ["all", "stocks", "indices", "crypto", "forex", "commodities"];
const summaryCategories: MarketCategory[] = ["stocks", "indices", "crypto", "forex", "commodities"];
const navItems = [
  { id: "overview", label: "Overview" },
  { id: "directory", label: "Markets" },
  { id: "watchlist", label: "Watchlist" },
  { id: "plans", label: "Plans" },
  { id: "methodology", label: "Methodology" },
];

function readLocalWatchlist(): string[] {
  if (typeof window === "undefined") return [];

  try {
    return readWatchlist(window.localStorage);
  } catch {
    return [];
  }
}

export function Dashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("SPX");
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [candles, setCandles] = useState<Awaited<ReturnType<MockMarketDataAdapter["getHistoricalCandles"]>>>([]);
  const [watchlist, setWatchlist] = useState<string[]>(readLocalWatchlist);
  const [storageNotice, setStorageNotice] = useState("");

  useEffect(() => {
    adapter.getInstruments().then(async (instruments) => {
      const loadedQuotes = await Promise.all(instruments.map((instrument) => adapter.getQuote(instrument.symbol)));
      setQuotes(loadedQuotes.filter((quote): quote is Quote => quote !== null));
    });
    adapter.getHistoricalCandles("SPX", "1M").then(setCandles);
  }, []);

  useEffect(() => {
    if (!selectedSymbol) return;
    adapter.getHistoricalCandles(selectedSymbol, "1M").then(setCandles);
  }, [selectedSymbol]);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);
    if (!sections.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find((entry) => entry.isIntersecting);
        if (visibleSection) setActiveSection(visibleSection.target.id);
      },
      { rootMargin: "-18% 0px -65% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const visibleQuotes = useMemo(() => quotes.filter((quote) => {
    const matchesCategory = selectedCategory === "all" || quote.instrument.category === selectedCategory;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || `${quote.instrument.symbol} ${quote.instrument.name}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  }), [query, quotes, selectedCategory]);

  const selectedQuote = quotes.find((quote) => quote.instrument.symbol === selectedSymbol) ?? null;
  const topMovers = [...quotes]
    .sort((first, second) => Math.abs(second.percentageChange ?? 0) - Math.abs(first.percentageChange ?? 0))
    .slice(0, 3);
  const hasFilters = query.trim().length > 0 || selectedCategory !== "all";

  function scrollToDirectory() {
    const directory = document.getElementById("directory");
    if (directory && typeof directory.scrollIntoView === "function") directory.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectCategory(category: MarketCategory | "all") {
    setSelectedCategory(category);
    scrollToDirectory();
  }

  function resetFilters() {
    setQuery("");
    setSelectedCategory("all");
  }

  function toggleWatchlist(symbol: string) {
    const nextWatchlist = watchlist.includes(symbol) ? watchlist.filter((item) => item !== symbol) : [...watchlist, symbol];
    setWatchlist(nextWatchlist);
    try {
      if (writeWatchlist(window.localStorage, nextWatchlist)) {
        setStorageNotice("");
        return;
      }
    } catch {
      setStorageNotice("Local watchlist storage is unavailable in this browser.");
      return;
    }

    setStorageNotice("Local watchlist storage is unavailable in this browser.");
  }

  return (
    <main>
      <div className="demo-banner" role="status" aria-live="polite">
        <span className="status-dot" aria-hidden="true" />
        <strong>DEMO MODE — SIMULATED MARKET DATA — NO LIVE FEED CONNECTED</strong>
        <span>Every value and timestamp is a local fixture.</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#overview" aria-label="MarketPulse overview">
          <span className="brand-mark" aria-hidden="true">MP</span>
          <span>Market<span>Pulse</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a className={activeSection === item.id ? "active" : ""} href={`#${item.id}`} aria-current={activeSection === item.id ? "page" : undefined} key={item.id}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-meta"><span className="live-indicator" aria-hidden="true" /> Fixture-only catalog</div>
      </header>

      <div className="page-frame">
        <section className="hero" id="overview">
          <div>
            <p className="eyebrow">Market intelligence workspace / 21 OCT 2026</p>
            <h1>A clearer read on the markets.</h1>
            <p className="hero-copy">A calm command center for comparing selected instruments across five market categories. Built on a provider-neutral foundation.</p>
          </div>
          <div className="hero-note">
            <span className="mini-label">Data boundary</span>
            <strong>Static simulated fixtures</strong>
            <span>No provider connection is active or implied.</span>
          </div>
        </section>

        <section className="summary-grid" aria-label="Market category summary">
          {summaryCategories.map((category) => {
            const categoryQuotes = quotes.filter((quote) => quote.instrument.category === category);
            const averageChange = categoryQuotes.length ? categoryQuotes.reduce((sum, quote) => sum + (quote.percentageChange ?? 0), 0) / categoryQuotes.length : null;
            const isSelected = selectedCategory === category;
            return (
              <button className={`summary-card ${isSelected ? "selected" : ""}`} key={category} onClick={() => selectCategory(category)} aria-pressed={isSelected}>
                <span className="summary-label">{categoryLabels[category]}</span>
                <strong>{categoryQuotes.length ? `${categoryQuotes.length} instruments` : "Unavailable"}</strong>
                <span className={averageChange !== null && averageChange >= 0 ? "positive" : "negative"}>
                  <span aria-hidden="true">{averageChange !== null && averageChange >= 0 ? "↑" : "↓"} </span>
                  {averageChange === null ? "No fixture data" : `${averageChange >= 0 ? "+" : ""}${averageChange.toFixed(2)}% average move`}
                </span>
              </button>
            );
          })}
        </section>

        <section className="content-grid">
          <div className="primary-column">
            <div className="section-heading">
              <div><p className="eyebrow">Selected instrument</p><h2>{selectedQuote?.instrument.name ?? "Instrument unavailable"}</h2></div>
              <button className={`watch-button ${selectedQuote && watchlist.includes(selectedQuote.instrument.symbol) ? "selected" : ""}`} onClick={() => selectedQuote && toggleWatchlist(selectedQuote.instrument.symbol)} disabled={!selectedQuote}>
                <span aria-hidden="true">{selectedQuote && watchlist.includes(selectedQuote.instrument.symbol) ? "−" : "+"}</span>
                {selectedQuote && watchlist.includes(selectedQuote.instrument.symbol) ? " Remove from watchlist" : " Add to watchlist"}
              </button>
            </div>
            <div className="detail-panel">
              {selectedQuote ? (
                <>
                  <div className="quote-head">
                    <div>
                      <span className="symbol">{selectedQuote.instrument.symbol}</span>
                      <span className="instrument-meta">{categoryLabels[selectedQuote.instrument.category]} / {selectedQuote.instrument.exchange}</span>
                    </div>
                    <div className="quote-value">
                      <strong>{formatPrice(selectedQuote)}</strong>
                      <span className={selectedQuote.percentageChange !== null && selectedQuote.percentageChange >= 0 ? "positive" : "negative"}>
                        <span aria-hidden="true">{selectedQuote.percentageChange !== null && selectedQuote.percentageChange >= 0 ? "↑" : "↓"} </span>
                        {formatChange(selectedQuote.percentageChange)}
                      </span>
                    </div>
                  </div>
                  <div className="chart-heading"><span>Simulated historical close</span><span>1 month fixture range</span></div>
                  <PriceChart candles={candles} symbol={selectedQuote.instrument.symbol} />
                  <div className="source-row">
                    <span>Source: {selectedQuote.sourceLabel}</span>
                    <span>Simulated fixture timestamp: {formatTimestamp(selectedQuote.sourceTimestamp)}</span>
                    <span className="freshness-badge">{selectedQuote.freshness.label}</span>
                  </div>
                </>
              ) : <div className="empty-state">Select an available fixture to inspect its simulated history.</div>}
            </div>
          </div>

          <aside className="side-column" id="watchlist">
            <div className="section-heading"><div><p className="eyebrow">Personal view</p><h2>Watchlist</h2></div><span className="count-badge" aria-label={`${watchlist.length} watchlist items`}>{watchlist.length}</span></div>
            <div className="watchlist-panel">
              {storageNotice && <p className="notice" role="alert">{storageNotice}</p>}
              {watchlist.length ? watchlist.map((symbol) => {
                const quote = quotes.find((item) => item.instrument.symbol === symbol);
                return quote ? (
                  <div className="watch-row" key={symbol}>
                    <button className="watch-select" onClick={() => setSelectedSymbol(symbol)}>
                      <span><strong>{symbol}</strong><small>{quote.instrument.name}</small></span>
                      <span className={quote.percentageChange !== null && quote.percentageChange >= 0 ? "positive" : "negative"}>{formatChange(quote.percentageChange)}</span>
                    </button>
                    <button className="icon-button" onClick={() => toggleWatchlist(symbol)} aria-label={`Remove ${symbol} from watchlist`} title={`Remove ${symbol}`}><span aria-hidden="true">×</span></button>
                  </div>
                ) : null;
              }) : <div className="empty-state"><strong>Your watchlist is empty.</strong><span>Add an instrument from the directory to keep it close.</span></div>}
            </div>
            <div className="mover-panel">
              <div className="panel-title"><span>Largest fixture moves</span><span className="muted">Simulated</span></div>
              {topMovers.map((quote) => <button className="mover-row" key={quote.instrument.symbol} onClick={() => setSelectedSymbol(quote.instrument.symbol)}><span><strong>{quote.instrument.symbol}</strong><small>{categoryLabels[quote.instrument.category]}</small></span><span className={quote.percentageChange !== null && quote.percentageChange >= 0 ? "positive" : "negative"}><span aria-hidden="true">{quote.percentageChange !== null && quote.percentageChange >= 0 ? "↑" : "↓"} </span>{formatChange(quote.percentageChange)}</span></button>)}
            </div>
          </aside>
        </section>

        <section className="directory-section" id="directory">
          <div className="directory-heading">
            <div><p className="eyebrow">Instrument directory</p><h2>Explore the catalog</h2></div>
            <label className="search-field"><span className="sr-only">Search instruments by symbol or name</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbol or name" /></label>
          </div>
          <div className="filter-row" role="group" aria-label="Market category filters">
            {categories.map((category) => <button className={selectedCategory === category ? "filter active" : "filter"} key={category} onClick={() => setSelectedCategory(category)} aria-pressed={selectedCategory === category}>{category === "all" ? "All markets" : categoryLabels[category]}</button>)}
            {hasFilters && <button className="reset-button" onClick={resetFilters}>Clear filters <span aria-hidden="true">×</span></button>}
          </div>
          <div className="result-meta"><span>{visibleQuotes.length} of {quotes.length} fixture instruments</span><span>All values are simulated</span></div>
          <div className="instrument-table" role="table" aria-label="Market instrument directory">
            <div className="table-row table-header" role="row"><span>Instrument</span><span>Last price</span><span>Change</span><span>Data status</span><span /></div>
            {visibleQuotes.map((quote) => <button className={`table-row ${selectedSymbol === quote.instrument.symbol ? "selected" : ""}`} role="row" key={quote.instrument.symbol} onClick={() => setSelectedSymbol(quote.instrument.symbol)} aria-label={`Select ${quote.instrument.symbol}, ${quote.instrument.name}`}>
              <span><strong>{quote.instrument.symbol}</strong><small>{quote.instrument.name} / {categoryLabels[quote.instrument.category]}</small></span>
              <span>{formatPrice(quote)}</span>
              <span className={quote.percentageChange !== null && quote.percentageChange >= 0 ? "positive" : "negative"}><span aria-hidden="true">{quote.percentageChange !== null && quote.percentageChange >= 0 ? "↑" : "↓"} </span>{formatChange(quote.percentageChange)}</span>
              <span><span className="freshness-badge">{quote.freshness.label}</span><small>{formatTimestamp(quote.sourceTimestamp)}</small></span>
              <span className="row-arrow" aria-hidden="true">→</span>
            </button>)}
            {!visibleQuotes.length && <div className="empty-state search-empty"><strong>No fixture instruments match this view.</strong><span>Try another symbol, name, or category.</span>{hasFilters && <button className="reset-button" onClick={resetFilters}>Reset search and filters</button>}</div>}
          </div>
        </section>

        <DemandValidation />

        <footer id="methodology">
          <div><strong>MarketPulse</strong><span>Fixture catalog v0.1</span></div>
          <span>Static simulated fixtures only. Live-provider integration has not been approved or connected.</span>
        </footer>
      </div>
    </main>
  );
}
