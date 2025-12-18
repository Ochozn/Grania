
import { Search, ArrowUpCircle, ArrowDownCircle, FileText, Calendar, Clock, RefreshCw } from 'lucide-react'

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
    users?: { full_name: string }
}


interface TransactionListProps {
    transactions: Transaction[]
    loading: boolean
    filterStatus: string
    setFilterStatus: (status: string) => void
    onAddIncome: () => void
    onAddExpense: () => void
    isShared?: boolean
}

const recurrenceLabels: Record<string, string> = {
    monthly: 'Mensal',
    weekly: 'Semanal',
    yearly: 'Anual'
}

export function TransactionList({ transactions, loading, filterStatus, setFilterStatus, onAddIncome, onAddExpense, isShared }: TransactionListProps) {

    return (
        <div className="flex flex-col gap-6">

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                {/* Tabs / Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {[
                        { id: 'all', label: 'Todas' },
                        { id: 'income', label: 'Receitas' },
                        { id: 'expense', label: 'Despesas' },
                        { id: 'pending', label: 'A Pagar' },
                        { id: 'receivable', label: 'A Receber' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${filterStatus === tab.id
                                ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Actions - Hidden on mobile, visible on desktop */}
                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={onAddIncome}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    >
                        <ArrowUpCircle size={18} />
                        Receita
                    </button>
                    <button
                        onClick={onAddExpense}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all flex items-center gap-2 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                    >
                        <ArrowDownCircle size={18} />
                        Despesa
                    </button>
                </div>
            </div>

            {/* List Header Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Buscar transações..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-white/10 transition-all shadow-sm"
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 min-h-[400px] flex flex-col overflow-hidden">

                {/* List / Empty State */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-8 w-8 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin dark:border-white/30 dark:border-t-white"></div>
                            <p className="text-sm font-medium text-slate-500 animate-pulse">Carregando...</p>
                        </div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 dark:bg-slate-700/30">
                            <FileText size={40} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">Nenhuma transação</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">Não encontramos movimentações para este período ou filtro selecionado.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {transactions.map(t => (
                            <div key={t.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/80 transition-all duration-200 dark:hover:bg-slate-700/30 cursor-default">
                                <div className="flex items-start gap-5 mb-4 sm:mb-0">
                                    <div className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${t.type === 'income'
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                                        }`}>
                                        {t.type === 'income' ? <ArrowUpCircle size={24} strokeWidth={1.5} /> : <ArrowDownCircle size={24} strokeWidth={1.5} />}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <p className="font-bold text-slate-900 dark:text-white text-base leading-tight">{t.description}</p>
                                            {isShared && t.users && (
                                                <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md dark:bg-slate-700 dark:text-slate-400 tracking-wider">
                                                    {t.users.full_name.split(' ')[0]}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            <span className="text-slate-600 dark:text-slate-300">{t.category}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(t.date).toLocaleDateString('pt-BR')}
                                            </span>

                                            {t.status === 'pending' && t.due_date && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                    <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        <Clock size={12} /> Vence {new Date(t.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </>
                                            )}

                                            {t.recurrence && t.recurrence !== 'none' && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                    <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded dark:bg-sky-500/10 dark:text-sky-400 text-[10px]">
                                                        <RefreshCw size={10} /> {recurrenceLabels[t.recurrence]}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-1 pl-[4.25rem] sm:pl-0">
                                    <p className={`font-bold text-lg font-display tracking-tight ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>

                                    {t.status === 'pending' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold dark:bg-amber-500/10 dark:text-amber-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pendente
                                        </span>
                                    ) : t.status === 'overdue' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold dark:bg-rose-500/10 dark:text-rose-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Atrasado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold dark:bg-emerald-500/10 dark:text-emerald-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Pago
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
