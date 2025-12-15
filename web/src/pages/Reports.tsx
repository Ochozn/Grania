
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function Reports() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<any[]>([])
    const [dateRange, setDateRange] = useState('this_month')

    useEffect(() => {
        fetchData()
    }, [dateRange])

    async function fetchData() {
        setLoading(true)
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        }
        const userId = getCookie('user_id')

        if (!userId) {
            navigate('/login')
            return
        }

        // Simplistic Fetch Logic (similar to Dashboard)
        let query = supabase.from('transactions').select('*').eq('user_id', userId)
        // ... date filtering logic here (omitted for brevity, same as Dashboard) ...
        const { data } = await query
        if (data) setTransactions(data)
        setLoading(false)
    }

    // Process Data
    const processCategoryData = (type: 'income' | 'expense') => {
        const filtered = transactions.filter(t => t.type === type)
        const map = filtered.reduce((acc: any, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
        }, {})
        return Object.keys(map).map(k => ({ name: k, value: map[k] })).sort((a, b) => b.value - a.value)
    }

    const incomeData = processCategoryData('income')
    const expenseData = processCategoryData('expense')
    const totalIncome = incomeData.reduce((acc, curr) => acc + curr.value, 0)
    const totalExpense = expenseData.reduce((acc, curr) => acc + curr.value, 0)

    const COLORS_INCOME = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
    const COLORS_EXPENSE = ['#ef4444', '#f87171', '#fca5a5', '#fecaca']

    // Mock trend data
    const trendData = [
        { name: '01', income: 4000, expense: 2400 },
        { name: '05', income: 3000, expense: 1398 },
        { name: '10', income: 2000, expense: 9800 },
        { name: '15', income: 2780, expense: 3908 },
        { name: '20', income: 1890, expense: 4800 },
        { name: '25', income: 2390, expense: 3800 },
        { name: '31', income: 3490, expense: 4300 },
    ]

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 p-4 sm:ml-64 lg:p-8">

                <DashboardHeader
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    onRefresh={fetchData}
                />

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-8 dark:border-gray-700">
                    <button className="pb-4 border-b-2 border-gray-900 font-bold text-gray-900 dark:text-white dark:border-white">
                        Gráficos
                    </button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium">
                        Lançamentos pendentes
                    </button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium">
                        Fluxo de caixa
                    </button>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                    {/* Expenses Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Despesas por Categoria</h3>
                            <button className="text-gray-400"><ChevronRight /></button>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1/2 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={expenseData} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                                            {expenseData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-2">
                                {expenseData.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_EXPENSE[idx % COLORS_EXPENSE.length] }}></div>
                                            <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-800 dark:text-white">{((item.value / totalExpense) * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Income Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Receitas por Categoria</h3>
                            <button className="text-gray-400"><ChevronRight /></button>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1/2 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={incomeData} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                                            {incomeData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS_INCOME[index % COLORS_INCOME.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-2">
                                {incomeData.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_INCOME[idx % COLORS_INCOME.length] }}></div>
                                            <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-800 dark:text-white">{((item.value / totalIncome) * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Frequency Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Frequência Receitas X Despesas</h3>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div> Receitas
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div> Despesas
                            </span>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="5 5" />
                                <Tooltip />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    )
}
