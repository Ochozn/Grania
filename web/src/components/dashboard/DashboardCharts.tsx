
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, CartesianGrid } from 'recharts'

interface DashboardChartsProps {
    data: { name: string; value: number }[]
    familyData?: any[]
    isShared?: boolean
    filter?: 'all' | 'income' | 'expense'
    setFilter?: (filter: 'all' | 'income' | 'expense') => void
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']

export function DashboardCharts({ data, familyData, isShared, filter = 'all', setFilter }: DashboardChartsProps) {
    const hasData = data.length > 0
    const total = data.reduce((acc, curr) => acc + curr.value, 0)

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-slate-100 dark:bg-slate-800/95 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{payload[0].name}</p>
                    <p className="text-lg font-bold font-display text-slate-900 dark:text-white">
                        <span className="text-xs text-slate-400 mr-1 align-top font-sans">R$</span>
                        {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            )
        }
        return null
    }

    const getTitle = () => {
        if (filter === 'income') return 'Receitas'
        if (filter === 'expense') return 'Despesas'
        return 'Visão Geral'
    }

    return (
        <div className="bg-white rounded-[32px] shadow-sm p-6 lg:h-full lg:min-h-[500px] flex flex-col dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md h-auto min-h-[450px]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Relatórios</h3>
            </div>

            {/* Scrollable Tabs Container for Mobile */}
            <div className="w-full overflow-x-auto pb-4 -mb-2 no-scrollbar">
                <div className="flex items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-700/50 rounded-2xl w-fit">
                    {(['all', 'income', 'expense'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter?.(f)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize ${filter === f
                                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            {f === 'all' ? 'Tudo' : f === 'income' ? 'Entradas' : 'Saídas'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center relative w-full mt-4">
                <h4 className="font-bold text-slate-800 dark:text-white text-lg">{getTitle()}</h4>
                <p className="text-xs font-medium text-slate-400 mb-6 uppercase tracking-wider">Top Categorias</p>

                {hasData ? (
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                    cornerRadius={6}
                                    stroke="none"
                                >
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total</p>
                            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white leading-none">
                                {total > 9999
                                    ? <span className="text-xl">{(total / 1000).toFixed(1)}k</span>
                                    : total.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                                }
                            </p>
                        </div>

                        {/* Custom Legend */}
                        <div className="mt-8 flex flex-wrap justify-center gap-3 w-full px-2">
                            {data.slice(0, 4).map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/30 px-2 py-1 rounded-lg border border-slate-100 dark:border-transparent">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{entry.name}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-dashed mb-4 dark:border-slate-700/50 flex items-center justify-center">
                            <div className="w-16 h-1 w-full bg-slate-100 rounded-full dark:bg-slate-800 rotate-45"></div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Sem dados para este filtro.</p>
                    </div>
                )}
            </div>

            {/* Family Breakdown Chart (Shared Mode) */}
            {isShared && familyData && familyData.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Comparativo Familiar</h4>
                    </div>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={familyData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#94a3b8" />
                                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="income" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="expense" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}
