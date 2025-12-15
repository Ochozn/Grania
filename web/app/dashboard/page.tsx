'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/app/components/Sidebar'
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Filter, RefreshCcw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { motion } from 'framer-motion'

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<any[]>([])

    // KPI States
    const [income, setIncome] = useState(0)
    const [expense, setExpense] = useState(0)
    const [balance, setBalance] = useState(0)

    // Fetch Data
    async function fetchData() {
        setLoading(true)
        const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false })

        if (data) {
            setTransactions(data)
            const inc = data.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0)
            const exp = data.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0)
            setIncome(inc)
            setExpense(exp)
            setBalance(inc - exp)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Chart Data Preparation
    const categoryData = transactions.reduce((acc: any, t) => {
        if (t.type === 'expense') {
            acc[t.category] = (acc[t.category] || 0) + t.amount
        }
        return acc
    }, {})

    const pieData = Object.keys(categoryData).map(key => ({ name: key, value: categoryData[key] }))
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="p-4 sm:ml-64">

                {/* Header / Filter Bar */}
                <div className="mb-6 flex flex-col sm:flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
                    <div className="flex space-x-2">
                        <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 flex items-center gap-2">
                            Data de Vencimento
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg dark:bg-gray-700">
                        <button className="px-3 py-1 rounded-md text-sm hover:bg-white dark:hover:bg-gray-600">Janeiro</button>
                        <button className="px-3 py-1 rounded-md text-sm hover:bg-white dark:hover:bg-gray-600">7 dias</button>
                        <button className="px-3 py-1 rounded-md text-sm bg-green-500 text-white shadow">Esse mês</button>
                        <button className="px-3 py-1 rounded-md text-sm hover:bg-white dark:hover:bg-gray-600">Esse ano</button>
                    </div>

                    <div className="flex space-x-2">
                        <button onClick={fetchData} className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                            <RefreshCcw className="h-4 w-4" /> Atualizar
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-bold mb-1">Total Receitas</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ {income.toFixed(2)}</h3>
                            </div>
                            <ArrowUpCircle className="h-8 w-8 text-green-500 opacity-20" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 font-bold mb-1">Total a pagar</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ {expense.toFixed(2)}</h3>
                            </div>
                            <ArrowDownCircle className="h-8 w-8 text-red-500 opacity-20" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-bold mb-1">Saldo Previsto</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ {balance.toFixed(2)}</h3>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
                        </div>
                    </motion.div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-bold">Despesas por Categoria</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-bold">Receitas vs Despesas (Recente)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{ name: 'Total', Receitas: income, Despesas: expense }]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-bold">Lançamentos Recentes</h3>
                    {loading ? (
                        <p>Carregando...</p>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <p>Nenhuma transação encontrada</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold">{t.description}</p>
                                            <p className="text-sm text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
