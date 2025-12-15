
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DashboardChartsProps {
    data: { name: string; value: number }[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']

export function DashboardCharts({ data }: DashboardChartsProps) {
    const hasData = data.length > 0

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6 h-full min-h-[500px] flex flex-col dark:bg-gray-800">
            <h3 className="text-xl font-bold text-gray-800 mb-6 dark:text-white">Gráficos</h3>

            {/* Tabs */}
            <div className="flex items-center gap-4 text-sm font-medium border-b border-gray-100 pb-2 mb-6 dark:border-gray-700">
                <button className="text-gray-900 border-b-2 border-gray-900 pb-2 -mb-2.5 dark:text-white dark:border-white">Todas</button>
                <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500">Receitas</button>
                <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500">Despesas</button>
                <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500">Despesas Não Pagas</button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h4 className="font-bold text-gray-800 mb-1 dark:text-white">Todas Receitas e Despesas</h4>
                <p className="text-sm text-gray-400 mb-8">1 De Dezembro - 31 De Dezembro</p>

                {hasData ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl mb-4 animate-pulse dark:bg-gray-700"></div>
                        <p className="text-gray-400 max-w-[200px]">Não há dados suficientes para mostrar este gráfico.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
