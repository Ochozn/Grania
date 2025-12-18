import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { AddTransactionModal } from '@/components/dashboard/AddTransactionModal'
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Search,
    Filter,
    MoreVertical,
    ArrowUpCircle,
    ArrowDownCircle,
    ChevronRight,
    Check,
    Eye,
    EyeOff,
    BarChart2,
    Calendar
} from 'lucide-react'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { motion } from 'framer-motion'

export default function Reports() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<any[]>([])
    const [dateRange, setDateRange] = useState('this_year') // Default to year for better charts
    const [currentDate, setCurrentDate] = useState(new Date())
    const [activeTab, setActiveTab] = useState('charts') // 'charts', 'pending_items', 'cash_flow'

    // Cash Flow State
    const [hideBalance, setHideBalance] = useState(false)
    const [chartType, setChartType] = useState('area') // 'area', 'bar'
    const [interval, setInterval] = useState('monthly') // 'monthly', 'daily'

    // Pending Items & Charts State
    const [chartFilter, setChartFilter] = useState('expenses')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'income' | 'expense'>('income')

    const handleOpenModal = (type: 'income' | 'expense') => {
        setModalType(type)
        setIsModalOpen(true)
    }

    useEffect(() => {
        fetchData()
    }, [dateRange, currentDate])

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

        let query = supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true })

        // Apply Date Filter Logic
        const now = currentDate
        let startDate = new Date(0).toISOString()
        let endDate = new Date(2100, 0, 1).toISOString()

        if (dateRange === '7_days') {
            const d = new Date(now)
            d.setDate(d.getDate() - 7)
            startDate = d.toISOString()
            endDate = now.toISOString()
        } else if (dateRange === 'this_month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1)
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
            startDate = start.toISOString()
            endDate = end.toISOString()
        } else if (dateRange === 'this_year') {
            const start = new Date(now.getFullYear(), 0, 1)
            const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
            startDate = start.toISOString()
            endDate = end.toISOString()
        }

        if (dateRange !== 'all') {
            query = query.gte('date', startDate).lte('date', endDate)
        }

        const { data } = await query
        if (data) setTransactions(data)
        setLoading(false)
    }

    // --- Calculations ---
    const pendingIncome = transactions
        .filter(t => t.type === 'income' && t.status === 'pending')
        .reduce((acc, t) => acc + t.amount, 0)

    const pendingExpense = transactions
        .filter(t => t.type === 'expense' && t.status === 'pending')
        .reduce((acc, t) => acc + t.amount, 0)

    const realizedIncome = transactions
        .filter(t => t.type === 'income' && t.status === 'paid')
        .reduce((acc, t) => acc + t.amount, 0)

    const realizedExpense = transactions
        .filter(t => t.type === 'expense' && t.status === 'paid')
        .reduce((acc, t) => acc + t.amount, 0)

    const currentBalance = realizedIncome - realizedExpense
    const projectedBalance = currentBalance + pendingIncome - pendingExpense

    const pendingIncomeList = transactions.filter(t => t.type === 'income' && t.status === 'pending')
    const pendingExpenseList = transactions.filter(t => t.type === 'expense' && t.status === 'pending')

    // --- Cash Flow Data Prep ---
    const getCashFlowData = () => {
        const dataMap = new Map()

        if (interval === 'monthly') {
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            months.forEach(m => dataMap.set(m, { name: m, receitas: 0, despesas: 0, saldo: 0 }))
        }

        transactions.forEach(t => {
            const date = new Date(t.date)
            let key = ''

            if (interval === 'monthly') {
                const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                key = months[date.getMonth()]
            } else {
                key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                if (!dataMap.has(key)) dataMap.set(key, { name: key, receitas: 0, despesas: 0, saldo: 0 })
            }

            const entry = dataMap.get(key)
            if (entry) {
                if (t.type === 'income') entry.receitas += t.amount
                if (t.type === 'expense') entry.despesas += t.amount
            }
        })

        const result = Array.from(dataMap.values()).map((item: any) => ({
            ...item,
            saldo: item.receitas - item.despesas
        }))

        return result
    }

    const cashFlowData = getCashFlowData()

    // --- Chart Data Logic (Restored) ---
    const getChartData = () => {
        let filtered = transactions
        let title = "Todas as Transações"
        let total = 0

        switch (chartFilter) {
            case 'all':
                filtered = transactions
                title = "Total Geral"
                break
            case 'income':
                filtered = transactions.filter(t => t.type === 'income')
                title = "Todas as Receitas"
                break
            case 'expenses':
                filtered = transactions.filter(t => t.type === 'expense')
                title = "Todas as Despesas"
                break
            case 'expenses_pending':
                filtered = transactions.filter(t => t.type === 'expense' && t.status === 'pending')
                title = "Despesas Não Pagas"
                break
            case 'expenses_paid':
                filtered = transactions.filter(t => t.type === 'expense' && t.status === 'paid')
                title = "Despesas Pagas"
                break
            case 'income_pending':
                filtered = transactions.filter(t => t.type === 'income' && t.status === 'pending')
                title = "Receitas Não Pagas"
                break
            case 'income_paid':
                filtered = transactions.filter(t => t.type === 'income' && t.status === 'paid')
                title = "Receitas Pagas"
                break
        }

        const map = filtered.reduce((acc: any, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            total += t.amount
            return acc
        }, {})

        const data = Object.keys(map)
            .map(k => ({ name: k, value: map[k] }))
            .sort((a, b) => b.value - a.value)

        return { data, title, total }
    }

    const { data: chartData, title: chartTitle, total: chartTotal } = getChartData()
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 p-4 sm:ml-64 lg:p-8">

                <DashboardHeader
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    onRefresh={fetchData}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                />

                {/* --- Tab Navigation --- */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-8 dark:border-gray-700 overflow-x-auto">
                    {[
                        { id: 'charts', label: 'Gráficos' },
                        { id: 'pending_items', label: 'Lançamentos pendentes' },
                        { id: 'cash_flow', label: 'Fluxo de caixa' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 whitespace-nowrap font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white font-bold'
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- Content Views --- */}

                {/* 1. GRÁFICOS (General Analysis - RESTORED) */}
                {activeTab === 'charts' && (
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col gap-8">

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gráficos</h3>

                            {/* Chart Filters */}
                            <div className="flex items-center gap-6 overflow-x-auto pb-2">
                                {[
                                    { id: 'all', label: 'Todas' },
                                    { id: 'income', label: 'Receitas' },
                                    { id: 'expenses', label: 'Despesas' },
                                    { id: 'expenses_pending', label: 'Despesas Não Pagas' },
                                    { id: 'expenses_paid', label: 'Despesas Pagas' },
                                    { id: 'income_pending', label: 'Receitas Não Pagas' },
                                    { id: 'income_paid', label: 'Receitas Pagas' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setChartFilter(f.id)}
                                        className={`whitespace-nowrap text-sm font-bold pb-2 border-b-2 transition-all ${chartFilter === f.id
                                            ? 'text-gray-900 border-gray-900 dark:text-white dark:border-white'
                                            : 'text-gray-400 border-transparent hover:text-gray-600'
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Main Chart Content */}
                            <div className="flex flex-col items-center">
                                <div className="text-center mb-8">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1">{chartTitle}</h4>
                                    <p className="text-xs text-gray-400">
                                        1 De {currentDate.toLocaleString('default', { month: 'long' })} - {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()} De {currentDate.toLocaleString('default', { month: 'long' })}
                                    </p>
                                </div>

                                <div className="relative w-64 h-64 mb-12">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                innerRadius={80}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                            R$ {chartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-xs text-gray-400 uppercase tracking-wide">Total</span>
                                    </div>
                                </div>

                                {/* Category List (Details) */}
                                <div className="w-full max-w-3xl space-y-6">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Detalhes</h4>

                                    {chartData.map((item: any, idx: number) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                                                    {item.name}
                                                </span>
                                                <span className="font-bold text-gray-700 dark:text-gray-300">
                                                    R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-gray-400 text-xs font-normal">({chartTotal > 0 ? ((item.value / chartTotal) * 100).toFixed(2) : 0}%)</span>
                                                </span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-100 rounded-full dark:bg-gray-700 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${chartTotal > 0 ? (item.value / chartTotal) * 100 : 0}%` }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {chartData.length === 0 && (
                                        <div className="text-center text-gray-400 text-sm py-4">
                                            Nenhum dado para exibir neste período.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* 2. LANÇAMENTOS PENDENTES (Pending Lists & KPIs) */}
                {activeTab === 'pending_items' && (
                    <div className="space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Total Receivable */}
                            <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp size={16} className="text-green-500" />
                                            <span className="text-sm font-bold text-green-600 dark:text-green-400">TOTAL A RECEBER</span>
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                            R$ {pendingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600">
                                        <ArrowUpCircle size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Total Payable */}
                            <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingDown size={16} className="text-red-500" />
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">TOTAL A PAGAR</span>
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                            R$ {pendingExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600">
                                        <ArrowDownCircle size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Projected Balance */}
                            <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wallet size={16} className="text-blue-500" />
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">SALDO PREVISTO</span>
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                            R$ {projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">(Receita - Despesa + Saldo Atual)</div>
                                    </div>
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
                                        <Wallet size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lists Container */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Receitas Pendentes */}
                            <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Receitas pendentes</h3>
                                    <button
                                        onClick={() => handleOpenModal('income')}
                                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-green-500/20 shadow-lg hover:bg-green-600 transition-colors">
                                        <ArrowUpCircle size={16} /> Receita
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {/* Search Bar - Simplified for UI */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="text" placeholder="Pesquisar..." className="w-full pl-9 py-2 bg-gray-50 dark:bg-gray-900/50 border-none rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        {pendingIncomeList.length === 0 ? <p className="text-center text-gray-400 text-sm py-8">Nenhuma receita pendente.</p> :
                                            pendingIncomeList.map(t => (
                                                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                                                        <div>
                                                            <div className="font-bold text-gray-800 dark:text-white">{t.description}</div>
                                                            <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-green-600">R$ {t.amount.toFixed(2)}</div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            {/* Despesas Pendentes */}
                            <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Despesas pendentes</h3>
                                    <button
                                        onClick={() => handleOpenModal('expense')}
                                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-red-500/20 shadow-lg hover:bg-red-600 transition-colors">
                                        <ArrowDownCircle size={16} /> Despesa
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="text" placeholder="Pesquisar..." className="w-full pl-9 py-2 bg-gray-50 dark:bg-gray-900/50 border-none rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        {pendingExpenseList.length === 0 ? <p className="text-center text-gray-400 text-sm py-8">Nenhuma despesa pendente.</p> :
                                            pendingExpenseList.map(t => (
                                                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                                                        <div>
                                                            <div className="font-bold text-gray-800 dark:text-white">{t.description}</div>
                                                            <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-red-600">R$ {t.amount.toFixed(2)}</div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. FLUXO DE CAIXA (New Area Chart) */}
                {activeTab === 'cash_flow' && (
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700">

                        {/* Header Controls */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp size={20} className="text-blue-500" />
                                    Gráficos de frequência Receitas X Despesas
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">Visualize a frequência de receitas e despesas ao longo do tempo</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => setHideBalance(!hideBalance)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${hideBalance
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                                    {hideBalance ? 'Mostrar Saldo' : 'Ocultar Saldo'}
                                </button>

                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300">
                                    <BarChart2 size={16} />
                                    Área
                                </button>

                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300">
                                    <Calendar size={16} />
                                    Mensal
                                </button>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cashFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    />
                                    <Legend iconType="circle" verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />

                                    <Area
                                        type="monotone"
                                        dataKey="receitas"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorReceitas)"
                                        name="Receitas"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="despesas"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorDespesas)"
                                        name="Despesas"
                                    />
                                    {!hideBalance && (
                                        <Area
                                            type="monotone"
                                            dataKey="saldo"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSaldo)"
                                            name="Saldo"
                                        />
                                    )}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                    </div>
                )}

            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType={modalType}
                onSuccess={fetchData}
            />
        </div>
    )
}
