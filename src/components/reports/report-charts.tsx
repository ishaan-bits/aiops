"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, LayoutGrid } from "lucide-react";
import type { Chart } from "@/services/reports";

const CHART_COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-[#0d0f16]/90 backdrop-blur border border-white/10 px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-white/40">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-white/80">
          {entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  );
}

function LineChartCard({ chart }: { chart: Chart }) {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-3">
        <TrendingUp className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-medium text-foreground">{chart.title}</span>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.06)" />
            <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.06)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BarChartCard({ chart }: { chart: Chart }) {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-3">
        <BarChart3 className="h-4 w-4 text-teal-400" />
        <span className="text-sm font-medium text-foreground">{chart.title}</span>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.06)" />
            <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.3)" }} stroke="rgba(255,255,255,0.06)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chart.data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DonutChartCard({ chart }: { chart: Chart }) {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-3">
        <PieChartIcon className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-medium text-foreground">{chart.title}</span>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {chart.data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => <span className="text-xs text-white/40">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HorizontalBarChartCard({ chart }: { chart: Chart }) {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-3">
        <LayoutGrid className="h-4 w-4 text-rose-400" />
        <span className="text-sm font-medium text-foreground">{chart.title}</span>
      </div>
      <div className="p-5">
        <div className="space-y-3">
          {chart.data.map((d, i) => {
            const maxVal = Math.max(...chart.data.map((item) => item.value));
            return (
              <div key={d.name} className="flex items-center gap-3">
                <div className="w-32 shrink-0 truncate text-sm text-white/40" title={d.name}>
                  {d.name}
                </div>
                <div className="flex-1">
                  <div className="relative h-7 rounded-md bg-white/[0.04]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                      style={{
                        width: `${Math.max((d.value / maxVal) * 100, 2)}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    <span className="relative z-10 flex h-full items-center px-2.5 text-xs font-medium text-white mix-blend-difference">
                      ${d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ReportChart({ chart }: { chart: Chart }) {
  switch (chart.type) {
    case "line":
      return <LineChartCard chart={chart} />;
    case "bar":
      return <BarChartCard chart={chart} />;
    case "donut":
      return <DonutChartCard chart={chart} />;
    case "horizontalBar":
      return <HorizontalBarChartCard chart={chart} />;
    default:
      return null;
  }
}
