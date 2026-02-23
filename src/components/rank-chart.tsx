"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentProfile } from "@/lib/db-queries"

interface RankChartProps {
  history: StudentProfile["history"]
}

export function RankChart({ history }: RankChartProps) {
  const [filterType, setFilterType] = useState<string>("All")

  const filteredHistory = useMemo(() => {
    if (filterType === "All") return history;
    return history.filter(h => h.contest.classification === filterType)
  }, [history, filterType])

  const chartData = useMemo(() => {
    return [...filteredHistory]
      .sort((a, b) => a.contest.startTimeSeconds - b.contest.startTimeSeconds)
      .map(h => ({
        name: h.contest.name.replace('Codeforces Round ', 'CF '),
        rank: h.rank,
        date: new Date(h.contest.startTimeSeconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
  }, [filteredHistory])

  const filterOptions = ["All", "Div. 2", "Div. 3"]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Rank History</CardTitle>
        <div className="flex gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterType(opt)}
              className={`px-2 py-1 text-xs rounded transition-colors ${filterType === opt
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  reversed
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                  formatter={(value, name) => [`#${value}`, 'Rank']}
                />
                <Area
                  type="monotone"
                  dataKey="rank"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth={1.5}
                  fill="url(#rankFill)"
                  dot={{ r: 3, fill: 'rgba(255,255,255,0.6)', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-white/30 text-sm">
              No data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
