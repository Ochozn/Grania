
import { Search, ListFilter, ArrowUpCircle, ArrowDownCircle, FileText, Plus, Clock, RefreshCw, Pin, Calendar, Hash } from 'lucide-react'

interface Transaction {
    id: string
    tx_code?: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    subcategory?: string
    date: string
    due_date?: string
    status?: 'paid' | 'pending' | 'overdue'
    recurrence?: 'none' | 'monthly' | 'weekly' | 'yearly'
    is_fixed?: boolean
}

interface TransactionListProps {
    transactions: Transaction[]
    loading: boolean
}

const recurrenceLabels: Record<string, string> = {
    monthly: 'Mensal',
    weekly: 'Semanal',
    yearly: 'Anual'
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
    return (
        <div className="flex flex-col gap-4">

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Month Navigator (Mini) */}
                <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">{'<'}</button>
                    <span className="text-sm font-semibold px-2 text-gray-700 dark:text-gray-200">Dezembro</span>
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">{'>'}</button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none justify-center bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all flex items-center gap-2">
                        <ArrowUpCircle size={16} />
                        Receita
                    </button>
                    <button className="flex-1 sm:flex-none justify-center bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center gap-2">
                        <ArrowDownCircle size={16} />
                        Despesa
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl shadow-sm p-6 min-h-[400px] dark:bg-gray-800 flex flex-col">
                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-100 pb-4 mb-6 dark:border-gray-700 overflow-x-auto no-scrollbar">
                    <button className="text-sm font-bold text-gray-800 border-b-2 border-gray-800 pb-4 -mb-4.5 dark:text-white dark:border-white whitespace-nowrap">Todas</button>
                    <button className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 whitespace-nowrap">Receitas</button>
                    <button className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 whitespace-nowrap">Despesas</button>
                    <button className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 whitespace-nowrap">A Pagar</button>
                    <button className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 whitespace-nowrap">A Receber</button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar por descrição ou código..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
                            <span>Data de Vencimento</span>
                            <ArrowUpCircle size={14} className="rotate-180" />
                        </button>
                        <button className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 dark:border-gray-600">
                            <ListFilter size={18} />
                        </button>
                    </div>
                </div>

                {/* List / Empty State */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center min-h-[200px]">
                        <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 dark:bg-gray-700">
                            <FileText size={40} className="text-gray-300 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1 dark:text-white">Nenhuma transação encontrada</h3>
                        <p className="text-gray-400 text-sm mb-6">Não há transações para exibir no período selecionado.</p>

                        <button className="flex items-center gap-2 text-green-600 font-bold hover:bg-green-50 px-4 py-2 rounded-xl transition-colors dark:hover:bg-green-900/20 dark:text-green-400">
                            <Plus size={20} />
                            Adicionar Nova Transação
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map(t => (
                            <div key={t.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all dark:hover:bg-gray-700/50">
                                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} group-hover:scale-110 transition-transform`}>
                                        {t.type === 'income' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900 dark:text-white">{t.description}</p>
                                            {t.tx_code && (
                                                <span className="text-[10px] font-mono bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded dark:bg-gray-600 dark:text-gray-300">
                                                    {t.tx_code}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded-md dark:bg-gray-600 dark:text-gray-300">{t.category}</span>
                                            {t.subcategory && (
                                                <span className="text-gray-400">/ {t.subcategory}</span>
                                            )}
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={10} />
                                                {new Date(t.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            {t.status === 'pending' && t.due_date && (
                                                <span className="text-orange-500 flex items-center gap-0.5">
                                                    <Clock size={10} /> Vence {new Date(t.due_date).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                            {t.recurrence && t.recurrence !== 'none' && (
                                                <span className="text-blue-500 flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded dark:bg-blue-900/30">
                                                    <RefreshCw size={10} /> {recurrenceLabels[t.recurrence]}
                                                </span>
                                            )}
                                            {t.is_fixed && (
                                                <span className="text-purple-500 flex items-center gap-0.5 bg-purple-50 px-1.5 py-0.5 rounded dark:bg-purple-900/30">
                                                    <Pin size={10} /> Fixa
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right pl-[4rem] sm:pl-0">
                                    <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        {t.status === 'pending' ? (
                                            <>
                                                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                                                <span className="text-xs text-orange-600 font-medium">Pendente</span>
                                            </>
                                        ) : t.status === 'overdue' ? (
                                            <>
                                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                                <span className="text-xs text-red-600 font-medium">Atrasado</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                <span className="text-xs text-green-600 font-medium">Pago</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
