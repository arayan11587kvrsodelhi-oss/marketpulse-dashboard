"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoricalCandle } from "@/lib/market-data/types";

export function PriceChart({ candles, symbol }: { candles: HistoricalCandle[]; symbol: string }) {
  const data = candles.filter((candle) => Number.isFinite(candle.close) && !Number.isNaN(Date.parse(candle.timestamp))).map((candle) => ({
    date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(candle.timestamp)),
    close: candle.close,
  }));

  if (!data.length) {
    return <div className="chart-empty" role="status">Historical series unavailable for this fixture.</div>;
  }

  return (
    <div className="chart-wrap" aria-label={`Simulated historical close prices for ${symbol}`} role="img">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#263341" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#8091a3", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8091a3", fontSize: 11 }} width={64} domain={["dataMin", "dataMax"]} />
          <Tooltip
            contentStyle={{ background: "#17212b", border: "1px solid #314354", borderRadius: 4, color: "#f4f8fb", fontSize: 12 }}
            formatter={(value) => [Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 }), "Simulated close"]}
          />
          <Line type="monotone" dataKey="close" stroke="#55d6e8" strokeWidth={2.5} dot={{ r: 3, fill: "#55d6e8", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#f4f8fb" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
