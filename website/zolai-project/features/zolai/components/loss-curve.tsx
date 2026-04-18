"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { step: number; loss: number }[];
}

export function LossCurve({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="step" tick={{ fontSize: 11 }} label={{ value: "Step", position: "insideBottom", offset: -2, fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={48} />
        <Tooltip
          contentStyle={{ fontSize: 12 }}
          formatter={(v) => [typeof v === 'number' ? v.toFixed(4) : String(v), "Loss"]}
          labelFormatter={(l) => `Step ${l}`}
        />
        <Line type="monotone" dataKey="loss" dot={false} strokeWidth={2} className="stroke-primary" />
      </LineChart>
    </ResponsiveContainer>
  );
}
