import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { TransactionList } from '@/components/dashboard/TransactionList'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'

export default function Dashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<any[]>([])
    const [dateRange, setDateRange] = useState('this_month')

    // KPI States
    const [income, setIncome] = useState(0)
    const [expense, setExpense] = useState(0)
    const [balance, setBalance] = useState(0)

    // Fetch Data
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

        // Build Query
        let query = supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true })

        // Apply Date Filter
        const now = new Date()
        let startDate = new Date(0).toISOString()

        if (dateRange === '7_days') {
            const d = new Date()
            d.setDate(d.getDate() - 7)
            startDate = d.toISOString()
        } else if (dateRange === 'this_month') {
            const d = new Date(now.getFullYear(), now.getMonth(), 1)
            startDate = d.toISOString()
        } else if (dateRange === 'this_year') {
            const d = new Date(now.getFullYear(), 0, 1)
            startDate = d.toISOString()
        } else if (dateRange === 'today') {
            const d = new Date()
            d.setHours(0, 0, 0, 0)
            startDate = d.toISOString()
        }

        if (dateRange !== 'all') {
            query = query.gte('date', startDate)
        }

        const { data } = await query

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
    }, [dateRange])

    const categoryData = transactions.reduce((acc: any, t) => {
        if (t.type === 'expense') {
            acc[t.category] = (acc[t.category] || 0) + t.amount
        }
        return acc
    }, {})
    const pieData = Object.keys(categoryData).map(key => ({ name: key, value: categoryData[key] }))

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 p-4 sm:ml-64 lg:p-8">

                {/* Header */}
                <DashboardHeader
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    onRefresh={fetchData}
                />

                {/* KPI Grid */}
                <KPIGrid
                    income={income}
                    expense={expense}
                    balance={balance}
                />

                {/* Main Grid: Transactions + Sidebar Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left: Transactions (Span 2) */}
                    <div className="lg:col-span-2">
                        <TransactionList
                            transactions={transactions}
                            loading={loading}
                        />
                    </div>

                    {/* Right: Charts (Span 1) */}
                    <div>
                        <DashboardCharts data={pieData} />
                    </div>
                </div>
            </div>
        </div>
    )
}

