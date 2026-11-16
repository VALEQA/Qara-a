"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

const LEVEL_MAP: Record<string, number> = {
    "hafal_sangat_lancar": 4,
    "hafal_lancar": 3,
    "hafal_tidak_lancar": 2,
    "belum_hafal": 1
}

const LEVEL_LABELS: Record<number, string> = {
    4: "S. Lancar",
    3: "Lancar",
    2: "K. Lancar",
    1: "B. Hafal"
}

export function StudentProgressChart({ userId }: { userId: string }) {
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            const { data: evals } = await supabase
                .from("evaluations")
                .select("hafalan_level, verses_count, created_at, session:sessions(session_date)")
                .eq("user_id", userId)
                .order("created_at", { ascending: true })
                .limit(10)

            if (evals) {
                const chartData = evals.map((e: any) => ({
                    date: new Date(e.session?.session_date || e.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }),
                    score: LEVEL_MAP[e.hafalan_level] || 0,
                    verses: e.verses_count || 0
                }))
                setData(chartData)
            }
            setIsLoading(false)
        }

        fetchData()
    }, [userId])

    if (isLoading) return <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Memuat data grafik...</div>
    if (data.length < 2) return null

    return (
        <Card className="col-span-1 lg:col-span-2 border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-bold text-foreground">Tren Kemajuan Hafalan</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Grafik kualitas hafalan pada 10 sesi terakhir</CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 4]}
                                ticks={[1, 2, 3, 4]}
                                tickFormatter={(val) => LEVEL_LABELS[val] || ""}
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
                                formatter={(value: number, name: string) => {
                                    if (name === "score") return [LEVEL_LABELS[value], "Kualitas"]
                                    return [value, "Jumlah Ayat"]
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#059669"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: "#047857" }}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
