"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { Check, User, CheckCircle2, Award, Sparkles } from "lucide-react"

export function FeatureChart() {
  const data = [
    { name: "Sen", score: 45 },
    { name: "Sel", score: 58 },
    { name: "Rab", score: 52 },
    { name: "Kam", score: 68 },
    { name: "Jum", score: 75 },
    { name: "Sab", score: 82 },
    { name: "Ahad", score: 90 },
  ]

  return (
    <div className="h-[220px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="landingChartScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '10px',
              boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value} Ayat`, "Hafalan"]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#059669"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
            fillOpacity={1}
            fill="url(#landingChartScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FastRecordingMock() {
  return (
    <div className="space-y-3 pt-2">
      {/* Mock Input Row 1 */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
            AS
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Ahmad Santri</p>
            <p className="text-xs text-muted-foreground">QS. An-Naba&apos; (1-40) • Juz 30</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Mumtaz</span>
        </div>
      </div>

      {/* Mock Input Row 2 */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
            MZ
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Muhammad Zaid</p>
            <p className="text-xs text-muted-foreground">QS. Al-Mulk (1-30) • Juz 29</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-semibold">
          <Check className="h-3.5 w-3.5" />
          <span>Lancar</span>
        </div>
      </div>

      {/* Mock Input Row 3 */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-border/70 bg-muted/20 opacity-75">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
            FK
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Fathimah Karimah</p>
            <p className="text-xs text-muted-foreground">QS. 'Abasa (1-42) • Sedang Setor...</p>
          </div>
        </div>
        <div className="h-2 w-10 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>
    </div>
  )
}
