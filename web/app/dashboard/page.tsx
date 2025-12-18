'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/app/components/Sidebar'
import { ArrowUpCircle, ArrowDownCircle, DollarSign, CalendarDays, Wallet } from 'lucide-react'
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import {
    format, parseISO, startOfMonth, endOfMonth,
    startOfYear, endOfYear, startOfDay, endOfDay, subDays
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [allTransactions, setAllTransactions] = useState<any[]>([])
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
    const [filterPeriod, setFilterPeriod] = useState('month') // 'all', 'month', 'year', 'today', '7days'

    // KPI States
    const [receivedIncome, setReceivedIncome] = useState(0)     // Recebido (REALIZADO)
    const [pendingIncome, setPendingIncome] = useState(0)       // A Receber (PENDENTE)
    const [paidExpense, setPaidExpense] = useState(0)           // Pago (REALIZADO)
    const [pendingExpense, setPendingExpense] = useState(0)     // A Pagar (PENDENTE)
    const [currentBalance, setCurrentBalance] = useState(0)     // Saldo Real (Conta)
    const [projectedBalance, setProjectedBalance] = useState(0) // Saldo Projetado (Futuro)

    // Fetch Data
    async function fetchData() {
        setLoading(true)
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })

        if (data) {
            // CORREÇÃO CRÍTICA DE DATA:
            // O banco retorna UTC (ex: 2025-12-05T00:00:00). O navegador converte para local (-3h) -> 2025-12-04 21:00.
            // Solução: Criamos uma data "Local" que respeita visualmente o dia do banco.
            const fixedData = data.map((t: any) => {
                // Força a interpretação da string YYYY-MM-DD como meia-noite local
                const dateParts = t.date.split('T')[0].split('-') // [2025, 12, 05]
                const year = parseInt(dateParts[0])
                const month = parseInt(dateParts[1]) - 1 // JS Month é 0-index
                const day = parseInt(dateParts[2])

                const localDate = new Date(year, month, day, 12, 0, 0) // Meio dia para segurança contra DST

                return {
                    ...t,
                    dateObj: localDate
                }
            })
            setAllTransactions(fixedData)
            applyFilter(fixedData, filterPeriod)
        }
        setLoading(false)
    }

    // Effect to re-filter when period changes
    useEffect(() => {
        if (allTransactions.length > 0) applyFilter(allTransactions, filterPeriod)
    }, [filterPeriod])

    useEffect(() => {
        fetchData()
    }, [])

    function applyFilter(data: any[], period: string) {
        const now = new Date()
        const currentYear = now.getFullYear()
        let filtered = data

        // 1. Lógica de Filtragem Robusta
        if (period === 'month') {
            const start = startOfMonth(now)
            const end = endOfMonth(now)
            filtered = data.filter(t => t.dateObj >= start && t.dateObj <= end)
        } else if (period === 'today') {
            const start = startOfDay(now)
            const end = endOfDay(now)
            filtered = data.filter(t => t.dateObj >= start && t.dateObj <= end)
        } else if (period === '7days') {
            // CORREÇÃO: Últimos 7 dias, mas APENAS dentro do ano atual
            // Evita que lançamentos de 2026 apareçam quando estamos em Dez/2025
            const start = subDays(startOfDay(now), 6)
            const end = endOfDay(now)
            filtered = data.filter(t => {
                const txYear = t.dateObj.getFullYear()
                return txYear === currentYear && t.dateObj >= start && t.dateObj <= end
            })
        } else if (period === 'year') {
            // CORREÇÃO: Apenas transações do ano ATUAL (ex: 2025)
            // Não deve incluir Jan/2026 quando estamos em Dez/2025
            filtered = data.filter(t => t.dateObj.getFullYear() === currentYear)
        }
        // 'all' não filtra nada (mostra tudo, inclusive futuro 2026)

        setFilteredTransactions(filtered)
        calculateKPIs(filtered)
    }

    function calculateKPIs(data: any[]) {
        // 2. Separação Estrita de Status e Tipos
        const incomeTx = data.filter(t => t.type === 'income')
        const expenseTx = data.filter(t => t.type === 'expense')

        // Apenas status = 'paid' conta para o saldo REAL
        const incPaid = incomeTx.filter(t => t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0)
        const expPaid = expenseTx.filter(t => t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0)

        // Apenas status = 'pending' conta para previsão
        const incPending = incomeTx.filter(t => t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0)
        const expPending = expenseTx.filter(t => t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0)

        setReceivedIncome(incPaid)
        setPendingIncome(incPending)
        setPaidExpense(expPaid)
        setPendingExpense(expPending)

        // Saldo Atual = O que de fato entrou - O que de fato saiu
        const realBalance = incPaid - expPaid
        setCurrentBalance(realBalance)

        // Saldo Projetado = Saldo Atual + O que vai entrar - O que vai sair
        // (Isso mostra como o caixa vai ficar se tudo se concretizar no período selecionado)
        const projBalance = realBalance + incPending - expPending
        setProjectedBalance(projBalance)
    }

    // Chart Logic
    const categoryData = filteredTransactions.reduce((acc: any, t) => {
        if (t.type === 'expense') {
            acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
        }
        return acc
    }, {})

    const pieData = Object.keys(categoryData).map((key, index) => ({
        name: key,
        value: categoryData[key],
        color: ['#0EA5E9', '#22C55E', '#EAB308', '#F97316', '#EF4444', '#8B5CF6'][index % 6]
    }))

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col sm:ml-64 overflow-y-auto">

                {/* Header */}
                <header className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Visão Financeira</h1>
                        <p className="text-sm text-gray-500">Fluxo de caixa inteligente</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-1">
                        {[
                            { id: 'today', label: 'Hoje' },
                            { id: '7days', label: '7 Dias' },
                            { id: 'month', label: 'Este Mês' },
                            { id: 'year', label: 'Este Ano' },
                            { id: 'all', label: 'Tudo' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilterPeriod(btn.id)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filterPeriod === btn.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="px-8 pb-8 space-y-6">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Saldo Atual */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200 dark:shadow-none">
                            <div className="flex items-center gap-3 mb-2 opacity-90">
                                <Wallet size={20} /> <span className="text-xs font-bold uppercase tracking-wider">Saldo em Conta</span>
                            </div>
                            <div className="text-3xl font-bold mb-2">
                                R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="flex flex-col gap-1 text-blue-100 text-xs mt-2 border-t border-blue-400/30 pt-2">
                                <div className="flex justify-between">
                                    <span>Projetado (final do período):</span>
                                    <span className="font-bold">R$ {projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 opacity-10 rotate-12"><DollarSign size={120} /></div>
                        </motion.div>

                        {/* Receitas */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                                    <ArrowUpCircle size={24} />
                                </div>
                                {pendingIncome > 0 && (
                                    <div className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide rounded-md border border-green-100">
                                        + {pendingIncome.toLocaleString('pt-BR')} Pendente
                                    </div>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                R$ {receivedIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Recebido</p>
                        </motion.div>

                        {/* Despesas */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                                    <ArrowDownCircle size={24} />
                                </div>
                                {pendingExpense > 0 && (
                                    <div className="px-2 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wide rounded-md border border-red-100">
                                        + {pendingExpense.toLocaleString('pt-BR')} Pendente
                                    </div>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                R$ {paidExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Pago</p>
                        </motion.div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Despesas por Categoria */}
                        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Gastos por Categoria</h3>
                            {pieData.length > 0 ? (
                                <>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-2 mt-4 max-h-40 overflow-y-auto custom-scrollbar px-1">
                                        {pieData.map((entry, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[100px]">{entry.name}</span>
                                                </div>
                                                <span className="font-bold text-gray-700 dark:text-gray-200">R$ {entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs">
                                    <p>Sem despesas no período</p>
                                </div>
                            )}
                        </div>

                        {/* Transações Recentes */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-6">Extrato do Período</h3>

                            {loading ? (
                                <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse text-sm">Carregando dados...</div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <CalendarDays size={40} className="mb-3 opacity-20" />
                                    <p className="text-sm">Nenhuma transação neste período</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredTransactions.map((t: any) => (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${t.type === 'income'
                                                    ? (t.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-green-50 text-green-400 border border-green-100 dashed')
                                                    : (t.status === 'paid' ? 'bg-red-100 text-red-600' : 'bg-red-50 text-red-400 border border-red-100 dashed')
                                                    }`}>
                                                    {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-white text-sm">{t.description}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                                                        <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{t.category}</span>
                                                        <span>{format(t.dateObj, "dd MMM yyyy", { locale: ptBR })}</span>
                                                        {t.status === 'pending' && <span className="text-orange-500 font-bold bg-orange-50 px-1 rounded">AGENDADO</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`block font-bold text-sm ${t.type === 'income'
                                                    ? (t.status === 'paid' ? 'text-green-600' : 'text-green-400')
                                                    : (t.status === 'paid' ? 'text-red-600' : 'text-red-400')
                                                    }`}>
                                                    {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    )
}
