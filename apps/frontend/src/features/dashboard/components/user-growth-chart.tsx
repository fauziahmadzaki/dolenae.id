"use client";

import { useId } from "react";
import { cn } from "~/lib/cn";
import type { UserGrowthPoint } from "../schema";

const WIDTH = 760;
const HEIGHT = 260;
const PAD = { top: 18, right: 16, bottom: 30, left: 44 };

const RANGES = [
  { value: 6, label: "6 bulan" },
  { value: 12, label: "12 bulan" },
];

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
  months: number;
  onMonthsChange: (months: number) => void;
  isLoading: boolean;
}

export function UserGrowthChart({
  data,
  months,
  onMonthsChange,
  isLoading,
}: UserGrowthChartProps) {
  const gradientId = useId().replaceAll(":", "");
  const latest = data.at(-1);
  const maxTotal = Math.max(1, ...data.map((point) => point.totalUsers));
  const chartWidth = WIDTH - PAD.left - PAD.right;
  const chartHeight = HEIGHT - PAD.top - PAD.bottom;

  const x = (index: number) =>
    PAD.left +
    (data.length <= 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
  const y = (value: number) => PAD.top + (1 - value / maxTotal) * chartHeight;

  const linePath = data
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${x(index).toFixed(1)} ${y(point.totalUsers).toFixed(1)}`,
    )
    .join(" ");
  const areaPath =
    data.length > 0
      ? `${linePath} L ${x(data.length - 1).toFixed(1)} ${PAD.top + chartHeight} L ${x(0).toFixed(1)} ${PAD.top + chartHeight} Z`
      : "";

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
    Math.round(maxTotal * ratio),
  );

  return (
    <section className="rounded-xl border border-hairline bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">
            Pertumbuhan pengguna
          </h2>
          <p className="text-xs text-body">
            Total pengguna terdaftar dan pendaftar baru per bulan.
          </p>
        </div>
        <div
          role="group"
          aria-label="Rentang waktu grafik"
          className="inline-flex rounded-full border border-hairline bg-canvas p-0.5"
        >
          {RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              aria-pressed={months === range.value}
              onClick={() => onMonthsChange(range.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                months === range.value
                  ? "bg-primary text-on-primary"
                  : "text-body hover:text-ink",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs text-body">Total pengguna</span>
            <span className="font-display text-sm font-bold text-ink">
              {isLoading ? "—" : (latest?.totalUsers ?? 0).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="text-xs text-body">Pendaftar bulan ini</span>
            <span className="font-display text-sm font-bold text-ink">
              {isLoading ? "—" : `+${(latest?.newUsers ?? 0).toLocaleString("id-ID")}`}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[220px] animate-pulse rounded-lg bg-canvas-subtle" />
        ) : data.length === 0 ? (
          <p className="py-16 text-center text-sm text-body">
            Belum ada data pengguna.
          </p>
        ) : (
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={`Grafik pertumbuhan pengguna ${months} bulan terakhir. Total terakhir ${latest?.totalUsers ?? 0} pengguna, ${latest?.newUsers ?? 0} pendaftar baru bulan ini.`}
            className="w-full"
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            {gridValues.map((value) => (
              <g key={value}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y(value)}
                  y2={y(value)}
                  stroke="var(--color-hairline)"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y(value) + 3}
                  textAnchor="end"
                  fontSize={10}
                  fill="var(--color-body)"
                >
                  {value}
                </text>
              </g>
            ))}

            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {data.map((point, index) => {
              const showLabel =
                data.length <= 6 ||
                index % 2 === 0 ||
                index === data.length - 1;
              return (
                <g key={point.month}>
                  <circle
                    cx={x(index)}
                    cy={y(point.totalUsers)}
                    r={3.5}
                    fill="var(--color-surface)"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                  >
                    <title>
                      {`${point.label}: ${point.totalUsers} total, +${point.newUsers} baru`}
                    </title>
                  </circle>
                  {showLabel && (
                    <text
                      x={x(index)}
                      y={HEIGHT - 8}
                      textAnchor="middle"
                      fontSize={10}
                      fill="var(--color-body)"
                    >
                      {point.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        <p className="text-[11px] text-body">
          Angka total bersifat kumulatif; pendaftar baru dihitung dari akun
          yang dibuat pada bulan tersebut.
        </p>
      </div>
    </section>
  );
}
