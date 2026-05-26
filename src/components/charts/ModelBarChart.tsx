"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function ModelBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid stroke="#D7DEF1" horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" stroke="#5A85A9" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#5A85A9"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <Tooltip
          contentStyle={{
            background: "#5A85A9",
            border: "none",
            borderRadius: 10,
            color: "#ffffff",
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" fill="#5A85A9" radius={[0, 8, 8, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
