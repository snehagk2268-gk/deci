"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface TrendPoint {
  date: string;
  approved: number;
  flagged: number;
  rejected: number;
  other: number;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="approvedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A85A9" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#5A85A9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="flaggedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="rejectedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#D7DEF1" vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          stroke="#5A85A9"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#5A85A9"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: "#5A85A9",
            border: "none",
            borderRadius: 10,
            color: "#ffffff",
            fontSize: 12,
          }}
          itemStyle={{ color: "#ffffff" }}
          labelStyle={{ color: "#D7DEF1" }}
        />
        <Area
          type="monotone"
          dataKey="approved"
          stroke="#5A85A9"
          strokeWidth={2}
          fill="url(#approvedFill)"
        />
        <Area
          type="monotone"
          dataKey="flagged"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#flaggedFill)"
        />
        <Area
          type="monotone"
          dataKey="rejected"
          stroke="#f43f5e"
          strokeWidth={2}
          fill="url(#rejectedFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
