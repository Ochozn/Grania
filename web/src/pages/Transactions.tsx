
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { ArrowUpCircle, ArrowDownCircle, Trash2, Search, ListFilter, FileText } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useNavigate } from 'react-router-dom'

export default function Transactions() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<any[]>([])
    const [dateRange, setDateRange] = useState('this_month')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all') // all, income, expense

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
            .order('date', { ascending: false })

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
        if (data) setTransactions(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [dateRange])

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)

        if (!error) {
            setTransactions(transactions.filter(t => t.id !== id))
        } else {
            alert('Erro ao excluir')
        }
    }

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === 'all' || t.type === filterType
        return matchesSearch && matchesType
    })

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

                <div className="bg-white rounded-3xl shadow-sm p-6 min-h-[600px] dark:bg-gray-800">

                    {/* Tabs */}
                    <div className="flex items-center gap-8 border-b border-gray-100 pb-4 mb-6 dark:border-gray-700">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`text-sm font-bold pb-4 -mb-4.5 border-b-2 transition-colors ${filterType === 'all' ? 'text-gray-800 border-gray-800 dark:text-white dark:border-white' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilterType('income')}
                            className={`text-sm font-medium pb-4 -mb-4.5 border-b-2 transition-colors ${filterType === 'income' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-green-600'}`}
                        >
                            Receitas
                        </button>
                        <button
                            onClick={() => setFilterType('expense')}
                            className={`text-sm font-medium pb-4 -mb-4.5 border-b-2 transition-colors ${filterType === 'expense' ? 'text-red-600 border-red-600' : 'text-gray-500 border-transparent hover:text-red-600'}`}
                        >
                            Despesas
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex-1 relative min-w-[250px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Pesquisar transações por nome ou categoria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
                            <span>Data de Vencimento</span>
                            <ArrowUpCircle size={14} className="rotate-180" />
                        </button>
                        <button className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 dark:border-gray-600">
                            <ListFilter size={18} />
                        </button>
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 dark:bg-gray-700">
                                <FileText size={40} className="text-gray-300 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 dark:text-white">Nenhuma transação encontrada</h3>
                            <p className="text-gray-400 text-sm">Tente ajustar seus filtros ou cadastre uma nova transação.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTransactions.map(t => (
                                <div key={t.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all dark:hover:bg-gray-700/50">
                                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} group-hover:scale-110 transition-transform`}>
                                            {t.type === 'income' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{t.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded-md dark:bg-gray-600 dark:text-gray-300">{t.category}</span>
                                                <span>•</span>
                                                <span>{new Date(t.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-[4rem] sm:pl-0">
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
