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

export function PriceChart({ candles, symbol, valueFormatter, valueLabel = "simulated units" }: { candles: HistoricalCandle[]; symbol: string; valueFormatter?: (value: number) => string; valueLabel?: string }) {
  const data = candles.filter((candle) => Number.isFinite(candle.close) && !Number.isNaN(Date.parse(candle.timestamp))).map((candle) => ({
    date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(candle.timestamp)),
    close: candle.close,
  }));

  if (!data.length) {
    return <div className="chart-empty" role="status">Historical series unavailable for this fixture.</div>;
  }

  const formatValue = valueFormatter ?? ((value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 }));

  return (
    <div className="chart-wrap" aria-label={`Simulated historical close prices for ${symbol}, shown in ${valueLabel}`} role="img">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#263341" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#8091a3", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8091a3", fontSize: 11 }} tickFormatter={formatValue} width={82} domain={["dataMin", "dataMax"]} />
          <Tooltip
            contentStyle={{ background: "#17212b", border: "1px solid #314354", borderRadius: 4, color: "#f4f8fb", fontSize: 12 }}
            formatter={(value) => [formatValue(Number(value)), `Simulated close (${valueLabel})`]}
          />
          <Line type="monotone" dataKey="close" stroke="#55d6e8" strokeWidth={2.5} dot={{ r: 3, fill: "#55d6e8", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#f4f8fb" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
