"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

const ORDER = ["low", "medium", "high", "critical"];
const COLORS: Record<string, string> = {
  low: "#B1CFEB",
  medium: "#5A85A9",
  high: "#f59e0b",
  critical: "#f43f5e",
};

export function RiskChart({ data }: { data: { name: string; value: number }[] }) {
  const ordered = ORDER.map((k) => data.find((d) => d.name === k) ?? { name: k, value: 0 });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ordered} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#D7DEF1" vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#5A85A9" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis stroke="#5A85A9" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
        <Tooltip
          contentStyle={{
            background: "#5A85A9",
            border: "none",
            borderRadius: 10,
            color: "#ffffff",
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {ordered.map((d) => (
            <Cell key={d.name} fill={COLORS[d.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
