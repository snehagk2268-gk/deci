"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS: Record<string, string> = {
  approved: "#10b981",
  rejected: "#f43f5e",
  flagged: "#f59e0b",
  pending: "#B1CFEB",
  overridden: "#BFBBCB",
};

export function OutcomeChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={3}
          stroke="#fbfcff"
          strokeWidth={2}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] || "#3b82f6"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#5A85A9",
            border: "none",
            borderRadius: 10,
            color: "#ffffff",
            fontSize: 12,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(v: string) => v[0].toUpperCase() + v.slice(1)}
          wrapperStyle={{ fontSize: 12, color: "#2c3e52" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
