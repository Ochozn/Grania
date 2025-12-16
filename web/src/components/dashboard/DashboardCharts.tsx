
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DashboardChartsProps {
    data: { name: string; value: number }[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']

export function DashboardCharts({ data }: DashboardChartsProps) {
    const hasData = data.length > 0
    const total = data.reduce((acc, curr) => acc + curr.value, 0)

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{payload[0].name}</p>
                    <p className="text-sm text-gray-500">R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6 h-full min-h-[500px] flex flex-col dark:bg-gray-800 transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6 dark:text-white">Gráficos</h3>

            {/* Tabs */}
            <div className="flex items-center gap-4 text-sm font-medium border-b border-gray-100 pb-2 mb-6 dark:border-gray-700 overflow-x-auto no-scrollbar">
                <button className="text-gray-900 border-b-2 border-gray-900 pb-2 -mb-2.5 dark:text-white dark:border-white whitespace-nowrap">Todas</button>
                <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 whitespace-nowrap">Receitas</button>
                <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 whitespace-nowrap">Despesas</button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center relative w-full">
                <h4 className="font-bold text-gray-800 mb-1 dark:text-white">Todas Receitas e Despesas</h4>
                <p className="text-sm text-gray-400 mb-8">1 De Dezembro - 31 De Dezembro</p>

                {hasData ? (
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={8}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Total</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-white">
                                {total > 1000
                                    ? `R$ ${(total / 1000).toFixed(1)}k`
                                    : `R$ ${total.toFixed(0)}`
                                }
                            </p>
                        </div>

                        {/* Custom Legend underneath */}
                        <div className="mt-6 flex flex-wrap justify-center gap-4 w-full px-4">
                            {data.slice(0, 5).map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs font-medium">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="text-gray-600 dark:text-gray-300 truncate max-w-[80px]">{entry.name}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-40 h-40 rounded-full border-8 border-gray-50 mb-6 dark:border-gray-750 flex items-center justify-center">
                            <div className="w-20 h-2 bg-gray-100 rounded-full dark:bg-gray-700"></div>
                        </div>
                        <p className="text-gray-400 max-w-[200px]">Sem dados para exibir.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
