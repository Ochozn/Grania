
import { motion } from 'framer-motion'
import { Wallet, CalendarClock, ArrowDownRight, ArrowUpRight } from 'lucide-react'

// --- Types ---
interface KPIProps {
    financials: {
        previousBalance: number
        realizedIncome: number
        realizedExpense: number
        pendingIncome: number
        pendingExpense: number
        currentBalance: number
        projectedBalance: number
    }
}

// --- Components ---

// 1. Main Balance Card (Google Style)
const MainBalanceCard = ({ value, label, type = 'current' }: { value: number; label: string; type?: 'current' | 'projected' }) => (
    <div className={`relative overflow-hidden rounded-[28px] p-8 ${type === 'current'
        ? 'bg-white text-slate-900 border border-slate-100 dark:bg-[#1e1e1e] dark:text-white dark:border-slate-800'
        : 'bg-slate-50 text-slate-900 border border-slate-200 dark:bg-[#2d2d2d] dark:text-white dark:border-slate-700'
        } shadow-sm transition-shadow hover:shadow-md h-full`}>
        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${type === 'current' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                    <Wallet size={24} strokeWidth={1.5} />
                </div>
                <span className="font-semibold text-sm text-slate-500 dark:text-slate-400 tracking-wide uppercase">{label}</span>
            </div>
            <div>
                <h3 className="text-4xl sm:text-5xl font-bold font-display tracking-tight leading-none">
                    <span className="text-2xl sm:text-3xl font-medium tracking-normal text-slate-400 dark:text-slate-500 mr-1">R$</span>
                    {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
        </div>
    </div>
)

// 2. Flow Card (Income/Expense/Pending)
const FlowCard = ({ title, value, type, icon: Icon }: { title: string; value: number; type: 'income' | 'expense' | 'pending-income' | 'pending-expense', icon: any }) => {
    const colors = {
        'income': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
        'expense': 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
        'pending-income': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
        'pending-expense': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'
    }

    const signs = {
        'income': '+',
        'expense': '-',
        'pending-income': '+',
        'pending-expense': '-'
    }

    return (
        <div className={`flex flex-col justify-between p-5 rounded-[24px] border border-transparent ${colors[type]} transition-all hover:scale-[1.02] active:scale-[0.98]`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-full bg-white/60 dark:bg-black/20`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-[11px] uppercase opacity-80 tracking-wider">{title}</span>
            </div>
            <p className="text-2xl font-bold font-display truncate tracking-tight">
                <span className="opacity-60 text-lg mr-0.5">{signs[type]}</span>
                {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
        </div>
    )
}



export function KPIGrid({ financials }: KPIProps) {
    const {
        previousBalance,
        realizedIncome,
        realizedExpense,
        pendingIncome,
        pendingExpense,
        currentBalance,
        projectedBalance
    } = financials


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
        >

            {/* Top Row: Current Realized State */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 1. Main Current Balance (Focus) - Spans 4 columns */}
                <div className="lg:col-span-4">
                    <MainBalanceCard
                        value={currentBalance}
                        label="Saldo Atual (Realizado)"
                    />
                </div>

                {/* 2. Realized Flows (Income/Expense) - Spans 5 columns */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                    <FlowCard
                        title="Receitas"
                        value={realizedIncome}
                        type="income"
                        icon={ArrowUpRight}
                    />
                    <FlowCard
                        title="Despesas"
                        value={realizedExpense}
                        type="expense"
                        icon={ArrowDownRight}
                    />
                </div>

                {/* 3. Previous Balance Context - Spans 3 columns */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-[28px] p-6 shadow-sm flex flex-col justify-center border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CalendarClock size={60} className="text-slate-900 dark:text-white" />
                    </div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Saldo Mês Anterior</span>
                    <div className="text-3xl font-bold font-display text-slate-700 dark:text-slate-200">
                        <span className="text-lg text-slate-400 mr-1 font-sans">R$</span>
                        {previousBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-4 text-xs font-medium text-slate-400 max-w-[80%]">
                        Base para o cálculo do saldo atual.
                    </div>
                </div>
            </div>

            {/* Bottom Row: Projections (Future) */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20"></div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <CalendarClock size={20} strokeWidth={2} />
                    </div>
                    <h4 className="font-bold text-lg text-slate-800 dark:text-white">Previsão e Pendências</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Pending Flows */}
                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        <FlowCard
                            title="A Receber"
                            value={pendingIncome}
                            type="pending-income"
                            icon={ArrowUpRight}
                        />
                        <FlowCard
                            title="A Pagar"
                            value={pendingExpense}
                            type="pending-expense"
                            icon={ArrowDownRight}
                        />
                    </div>

                    {/* Projected Balance Result */}
                    <div className="relative pl-8 md:border-l border-slate-100 dark:border-slate-700 py-2">
                        <div className="mt-2">
                            <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">Saldo Projetado</p>
                            <h3 className="text-4xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                                <span className="text-xl text-slate-400 mr-1 font-sans font-medium">R$</span>
                                {projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed">
                                Este será seu saldo se todas as pendências forem efetivadas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </motion.div>
    )
}
