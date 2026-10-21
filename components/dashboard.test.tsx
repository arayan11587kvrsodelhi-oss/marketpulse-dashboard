// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dashboard } from "./dashboard";
import { PriceChart } from "./price-chart";

function renderDashboard() {
  return render(<Dashboard />);
}

function getInstrumentTable() {
  return screen.getByRole("table", { name: "Market instrument directory" });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("Dashboard interactions", () => {
  it("keeps the demo banner visible and renders a simulated chart", async () => {
    renderDashboard();

    expect(screen.getByText("DEMO MODE — SIMULATED MARKET DATA — NO LIVE FEED CONNECTED")).toBeTruthy();
    expect(screen.getByText("Every value and timestamp is a local fixture.")).toBeTruthy();
    await waitFor(() => expect(screen.getByRole("img", { name: /simulated historical close prices for SPX/i })).toBeTruthy());
    expect(screen.getByRole("img", { name: /shown in index points/i })).toBeTruthy();
    expect(screen.getByText(/Simulated fixture timestamp:/)).toBeTruthy();
  });

  it("filters search results by symbol or name", async () => {
    renderDashboard();
    await waitFor(() => expect(within(getInstrumentTable()).getByText("AAPL", { selector: "strong" })).toBeTruthy());

    fireEvent.change(screen.getByPlaceholderText("Search symbol or name"), { target: { value: "apple" } });

    expect(within(getInstrumentTable()).getByText("AAPL", { selector: "strong" })).toBeTruthy();
    expect(within(getInstrumentTable()).queryByText("Microsoft Corporation")).toBeNull();
  });

  it("filters the directory by category", async () => {
    renderDashboard();
    await waitFor(() => expect(within(getInstrumentTable()).getByText("AAPL", { selector: "strong" })).toBeTruthy());

    const filters = screen.getByRole("group", { name: "Market category filters" });
    fireEvent.click(within(filters).getByRole("button", { name: "Crypto" }));

    expect(within(getInstrumentTable()).getByText("BTC-USD", { selector: "strong" })).toBeTruthy();
    expect(within(getInstrumentTable()).queryByText("AAPL", { selector: "strong" })).toBeNull();
  });

  it("shows an empty state and clears combined search and category filters", async () => {
    renderDashboard();
    await waitFor(() => expect(within(getInstrumentTable()).getByText("AAPL", { selector: "strong" })).toBeTruthy());

    fireEvent.change(screen.getByPlaceholderText("Search symbol or name"), { target: { value: "not-a-fixture" } });
    expect(screen.getByText("No fixture instruments match this view.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Reset search and filters/i }));
    expect(within(getInstrumentTable()).getByText("AAPL", { selector: "strong" })).toBeTruthy();
  });

  it("updates the selected instrument and chart when a directory row is selected", async () => {
    renderDashboard();
    await waitFor(() => expect(within(getInstrumentTable()).getByText("AAPL", { selector: "strong" })).toBeTruthy());

    fireEvent.click(within(getInstrumentTable()).getByText("AAPL", { selector: "strong" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Apple Inc." })).toBeTruthy());
    expect(screen.getByRole("img", { name: /simulated historical close prices for AAPL/i })).toBeTruthy();
  });

  it("shows an explicit empty state when historical data is unavailable", () => {
    render(<PriceChart candles={[]} symbol="MISSING" />);

    expect(screen.getByText("Historical series unavailable for this fixture.")).toBeTruthy();
  });

  it("rejects invalid historical fixture values", () => {
    render(<PriceChart candles={[{ timestamp: "invalid", open: 1, high: 1, low: 1, close: Number.NaN, isSimulated: true }]} symbol="MISSING" />);

    expect(screen.getByText("Historical series unavailable for this fixture.")).toBeTruthy();
  });

  it("survives malformed watchlist data and read failures", () => {
    window.localStorage.setItem("marketpulse-watchlist", "{not-json");
    const { unmount } = renderDashboard();
    expect(screen.getByText("Your watchlist is empty.")).toBeTruthy();
    unmount();

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    renderDashboard();
    expect(screen.getByText("Your watchlist is empty.")).toBeTruthy();
  });

  it("reports a storage write failure without crashing", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    renderDashboard();
    await waitFor(() => expect(screen.getByRole("button", { name: "Add to watchlist" })).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "Add to watchlist" }));

    expect(screen.getByText("Local watchlist storage is unavailable in this browser.")).toBeTruthy();
  });
});
