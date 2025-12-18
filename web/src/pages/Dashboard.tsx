import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { TransactionList } from '@/components/dashboard/TransactionList'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { AddTransactionModal } from '@/components/dashboard/AddTransactionModal'


export default function Dashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<any[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [dateRange, setDateRange] = useState('this_month') // 'today', '7_days', 'this_month', 'this_year', 'custom'
    const [filterStatus, setFilterStatus] = useState('all') // 'all', 'income', 'expense', 'pending', 'receivable'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'income' | 'expense'>('income')

    // KPI States
    const [financials, setFinancials] = useState({
        previousBalance: 0, // TODO: Fetch from DB based on previous months
        realizedIncome: 0,
        realizedExpense: 0,
        pendingIncome: 0, // Contas a Receber
        pendingExpense: 0, // Contas a Pagar
        currentBalance: 0, // Saldo Atual (Realized)
        projectedBalance: 0 // Saldo Projetado (Current + Pending)
    })

    // State for Family
    const [familyMembers, setFamilyMembers] = useState<any[]>([])
    const [isShared, setIsShared] = useState(false)
    const [familyData, setFamilyData] = useState<any[]>([])


    // Fetch Data
    async function fetchData() {
        setLoading(true)

        // ... (existing helper code) ...
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

        // 1. Get User Info & Family
        const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single()
        if (userData) {

            if (userData.family_id) {
                const { data: members } = await supabase.from('users').select('*').eq('family_id', userData.family_id)
                if (members && members.length > 1) {
                    setFamilyMembers(members)
                    setIsShared(true)
                }
            }
        }

        let query = supabase
            .from('transactions')
            .select('*, users(full_name)')
            .order('date', { ascending: false })

        // Date Logic
        const now = new Date()
        let startDate: string | null = null
        let endDate: string | null = null

        if (dateRange === '7_days') {
            const d = new Date()
            d.setDate(d.getDate() - 7)
            startDate = d.toISOString().split('T')[0]
            endDate = now.toISOString().split('T')[0]
        } else if (dateRange === 'today') {
            startDate = now.toISOString().split('T')[0]
            endDate = now.toISOString().split('T')[0]
        } else if (dateRange === 'this_year') {
            const start = new Date(currentDate.getFullYear(), 0, 1)
            const end = new Date(currentDate.getFullYear(), 11, 31)
            startDate = start.toISOString().split('T')[0]
            endDate = end.toISOString().split('T')[0]
        } else {
            // Default: Month View
            const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
            const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
            startDate = start.toISOString().split('T')[0]
            endDate = end.toISOString().split('T')[0]
        }

        if (startDate) query = query.gte('date', startDate)
        if (endDate) query = query.lte('date', endDate)

        const { data } = await query

        if (data) {
            setTransactions(data)
            calculateKPIs(data)

            // Calculate Family Split
            if (userData?.family_id) {
                const split = data.reduce((acc: any, t: any) => {
                    const name = t.users?.full_name?.split(' ')[0] || 'Desconhecido'
                    if (!acc[name]) acc[name] = { name, income: 0, expense: 0 }
                    if (t.type === 'income') acc[name].income += t.amount
                    if (t.type === 'expense') acc[name].expense += t.amount
                    return acc
                }, {})
                setFamilyData(Object.values(split))
            }
        }
        setLoading(false)
    }

    function calculateKPIs(data: any[]) {
        const incomeTx = data.filter((t: any) => t.type === 'income')
        const incomePaid = incomeTx.filter((t: any) => t.status === 'paid').reduce((acc: number, t: any) => acc + t.amount, 0)
        const incomePending = incomeTx.filter((t: any) => t.status === 'pending').reduce((acc: number, t: any) => acc + t.amount, 0)

        const expenseTx = data.filter((t: any) => t.type === 'expense')
        const expensePaid = expenseTx.filter((t: any) => t.status === 'paid').reduce((acc: number, t: any) => acc + t.amount, 0)
        const expensePending = expenseTx.filter((t: any) => t.status === 'pending').reduce((acc: number, t: any) => acc + t.amount, 0)

        const previousBalance = 0 // Placeholder until we have history feature
        const currentBalance = previousBalance + (incomePaid - expensePaid)
        const projectedBalance = currentBalance + (incomePending - expensePending)

        setFinancials({
            previousBalance,
            realizedIncome: incomePaid,
            realizedExpense: expensePaid,
            pendingIncome: incomePending,
            pendingExpense: expensePending,
            currentBalance,
            projectedBalance
        })
    }

    useEffect(() => {
        fetchData()
    }, [dateRange, currentDate]) // Re-fetch when date changes

    // Filter Logic for List
    const filteredTransactions = transactions.filter(t => {
        if (filterStatus === 'all') return true
        if (filterStatus === 'income') return t.type === 'income'
        if (filterStatus === 'expense') return t.type === 'expense'
        if (filterStatus === 'pending') return t.status === 'pending' && t.type === 'expense' // "A Pagar"
        if (filterStatus === 'receivable') return t.status === 'pending' && t.type === 'income' // "A Receber"
        return true
    })

    // Chart Filter
    const [chartFilter, setChartFilter] = useState<'all' | 'income' | 'expense'>('all')

    const pieData = transactions.reduce((acc: any[], t) => {
        if (chartFilter === 'all') {
            // For 'all', show Income vs Expense
            const existing = acc.find(i => i.name === (t.type === 'income' ? 'Receitas' : 'Despesas'))
            if (existing) {
                existing.value += t.amount
            } else {
                acc.push({ name: t.type === 'income' ? 'Receitas' : 'Despesas', value: t.amount })
            }
        } else {
            // For specific type, show categories
            if (t.type === chartFilter) {
                const existing = acc.find(i => i.name === t.category)
                if (existing) {
                    existing.value += t.amount
                } else {
                    acc.push({ name: t.category, value: t.amount })
                }
            }
        }
        return acc
    }, [])
        // Sort by value desc
        .sort((a, b) => b.value - a.value)

    const handleOpenModal = (type: 'income' | 'expense') => {
        setModalType(type)
        setIsModalOpen(true)
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0F1115] font-sans text-slate-900 dark:text-slate-50 transition-colors duration-200">
            <Sidebar />
            <div className="flex-1 w-full p-4 md:ml-72 lg:p-8 pb-32 md:pb-8 max-w-[1700px] mx-auto">

                <DashboardHeader
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    onRefresh={fetchData}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                />

                <div className="flex flex-col gap-8">
                    <KPIGrid financials={financials} />

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 items-start">
                        <div className="xl:col-span-2 space-y-6">
                            {isShared && (
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold mb-1 font-display">Visão Familiar Compartilhada</h2>
                                            <p className="text-blue-100 text-sm font-medium">Vocês estão gerenciando {transactions.length} transações juntos neste período.</p>
                                        </div>
                                        <div className="flex -space-x-3">
                                            {familyMembers.map(m => (
                                                <div key={m.id} className="w-10 h-10 rounded-full bg-white text-blue-800 flex items-center justify-center font-bold text-sm border-4 border-blue-600 truncate shadow-sm uppercase" title={m.full_name}>
                                                    {m.full_name?.[0]}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <TransactionList
                                transactions={filteredTransactions}
                                loading={loading}
                                filterStatus={filterStatus}
                                setFilterStatus={setFilterStatus}
                                onAddIncome={() => handleOpenModal('income')}
                                onAddExpense={() => handleOpenModal('expense')}
                                isShared={isShared}
                            />
                        </div>

                        <div className="xl:col-span-1">
                            <div className="sticky top-8">
                                <DashboardCharts
                                    data={pieData}
                                    familyData={familyData}
                                    isShared={isShared}
                                    filter={chartFilter}
                                    setFilter={setChartFilter}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Floating Action Button (FAB) */}
                <button
                    onClick={() => handleOpenModal('expense')}
                    className="md:hidden fixed bottom-24 right-4 h-14 w-14 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/30 flex items-center justify-center z-40 active:scale-90 transition-all border border-slate-800 dark:bg-emerald-500 dark:shadow-emerald-500/30 dark:border-emerald-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                </button>

                <AddTransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialType={modalType}
                    onSuccess={fetchData}
                />
            </div>
        </div>
    )

}

