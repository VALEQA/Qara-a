"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"

export function DashboardCharts() {
    // Mock data - in a real app this would come from the database
    const registrationData = [
        { name: "Jan", total: 12 },
        { name: "Feb", total: 18 },
        { name: "Mar", total: 25 },
        { name: "Apr", total: 45 },
        { name: "Mei", total: 32 },
        { name: "Jun", total: 58 },
    ]

    const userRoleData = [
        { name: "Santri", value: 450, color: "#059669" },
        { name: "Asatidz / Guru", value: 32, color: "#0d9488" },
        { name: "Admin", value: 5, color: "#f59e0b" },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-border/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-foreground">Statistik Pendaftaran</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        Santri baru terdaftar per bulan (6 bulan terakhir)
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={registrationData}>
                            <XAxis
                                dataKey="name"
                                stroke="#64748b"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(5, 150, 105, 0.05)' }}
                                contentStyle={{
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar
                                dataKey="total"
                                fill="#059669"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="col-span-3 border-border/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-foreground">Sebaran Pengguna</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        Komposisi pengguna aktif berdasarkan peran
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={userRoleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {userRoleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)',
                                    fontSize: '12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-3 flex justify-center gap-4 text-xs">
                        {userRoleData.map((item, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-muted-foreground font-medium">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
