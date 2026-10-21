# MarketPulse Dashboard

A responsive, provider-independent market dashboard foundation built with Next.js and TypeScript.

## Current status

This is an approved technical foundation and UI prototype. It contains **simulated fixture data only**. The persistent banner `DEMO MODE — SIMULATED MARKET DATA — NO LIVE FEED CONNECTED` is intentional and must remain until an approved provider integration is implemented and verified.

There are no network calls, API keys, paid services, user accounts, database, or live market feeds in this repository.

## Demand validation preview

The dashboard includes proposed pricing for discovery only:

- Free: ₹0 for the simulated dashboard, basic exploration, and local-device watchlists.
- Pro: proposed ₹199–₹299/month for planned advanced watchlists, alerts, and enhanced analysis.
- Business / Custom Dashboard: individually scoped requirements and pricing.

These are not launched subscriptions. There is no payment, account activation, or purchase flow.

The Individual Early Access and Business Dashboard Inquiry forms are local validation previews. They validate input in the browser but do not transmit, store, or log personal information because no submission endpoint exists yet.

## Setup

Requirements:

- Node.js 22 or a currently supported LTS release
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Available checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Architecture

- `app/` contains the Next.js App Router entry points and global styling.
- `components/` contains the responsive dashboard, chart, search, filters, navigation, and watchlist UI.
- `lib/market-data/types.ts` defines the provider-independent domain contracts.
- `lib/market-data/mock-adapter.ts` implements those contracts using local fixtures only.
- `lib/market-data/fixtures.ts` contains clearly labeled simulated instruments, quotes, and candles.
- `lib/market-data/freshness.ts` defines simulated and unavailable freshness states.
- `lib/market-data/formatters.ts` centralizes display formatting.

The dashboard depends on `MarketDataAdapter`, not on a provider SDK. An approved provider should be added as a separate adapter that validates and normalizes upstream responses before returning these types.

## Demo-data limitations

- Prices, changes, candles, timestamps, and provider status are simulated and have no trading value.
- Simulated timestamps must not be described as source timestamps from a real exchange.
- Fixture data must not be used for investment decisions, backtesting, performance claims, or production monitoring.
- Missing instruments return explicit unavailable values; the UI does not infer replacements.
- Historical charts reject invalid fixture timestamps or values and show an explicit unavailable state.
- The local watchlist is optional browser storage only. It contains symbols, not credentials or personal information. Storage failures degrade to an empty watchlist.

## Future provider integration requirements

Before adding a provider:

1. Obtain client approval and confirm the exact instruments, exchanges, delay requirements, traffic target, and budget.
2. Verify commercial public-display and redistribution rights in writing.
3. Confirm historical-data storage, caching, quotas, concurrent requests, and WebSocket terms.
4. Keep credentials server-side and out of browser bundles and source control.
5. Validate provider payloads at runtime and normalize timestamps, currencies, units, and symbols.
6. Preserve source timestamps, retrieval timestamps, provider identity, and freshness state for every quote.
7. Add timeout, retry, throttling, provider-health, stale-data, and unavailable-data handling.
8. Add adapter tests using approved fixtures before enabling the provider in the UI.

Live integrations, authentication, synchronized watchlists, alerts, news, portfolio tracking, and public deployment remain outside this foundation and require separate approval.