
import { motion } from 'framer-motion'
import { Eye, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react'

interface KPICardProps {
    title: string
    value: number
    type: 'blue' | 'green' | 'red' | 'neutral'
    subtitle: string
    footerData: { label: string; value: number; color: string; icon?: any }[]
}

function KPICard({ title, value, type, subtitle, footerData }: KPICardProps) {
    const styles = {
        blue: {
            border: 'border-blue-500',
            text: 'text-blue-600',
            bg: 'bg-blue-50',
            shadow: 'shadow-blue-500/10',
            icon: <DollarSign size={18} className="text-blue-500" />
        },
        green: {
            border: 'border-green-500',
            text: 'text-green-600',
            bg: 'bg-green-50',
            shadow: 'shadow-green-500/10',
            icon: <TrendingUp size={18} className="text-green-500" />
        },
        red: {
            border: 'border-red-500',
            text: 'text-red-500',
            bg: 'bg-red-50',
            shadow: 'shadow-red-500/10',
            icon: <TrendingDown size={18} className="text-red-500" />
        },
        neutral: {
            border: 'border-gray-300',
            text: 'text-gray-800',
            bg: 'bg-gray-50',
            shadow: 'shadow-gray-200/50',
            icon: <Clock size={18} className="text-gray-400" />
        }
    }

    const style = styles[type]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col rounded-3xl bg-white p-5 shadow-sm hover:shadow-lg transition-all dark:bg-gray-800 border-l-[6px] ${style.border}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {style.icon}
                    <span>{title}</span>
                </div>
                <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <Eye size={20} />
                </button>
            </div>

            {/* Value */}
            <h3 className={`text-3xl font-extrabold mb-1 ${style.text}`}>
                R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs font-medium text-gray-400 mb-6">{subtitle}</p>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700">
                <div className="flex gap-3">
                    {footerData.map((item, idx) => (
                        <div key={idx} className={`flex-1 rounded-2xl p-3 ${item.color === 'orange' ? 'bg-orange-50' : (item.color === 'green' ? 'bg-emerald-50' : 'bg-red-50')} dark:bg-opacity-10`}>
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                            <p className={`text-sm font-bold ${item.color === 'orange' ? 'text-orange-600' : (item.color === 'green' ? 'text-emerald-600' : 'text-red-600')}`}>
                                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

interface KPIGridProps {
    income: number
    expense: number
    balance: number
    incomeDetails: { paid: number, pending: number }
    expenseDetails: { paid: number, pending: number }
}

export function KPIGrid({ income, expense, balance, incomeDetails, expenseDetails }: KPIGridProps) {
    return (
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <KPICard
                title="Saldo Anterior"
                value={0.00}
                type="blue"
                subtitle="Até o mês passado"
                footerData={[
                    { label: 'Pendente', value: 0.00, color: 'orange', icon: <Clock size={12} /> },
                    { label: 'Realizado', value: 0.00, color: 'green', icon: <CheckCircle2 size={12} /> }
                ]}
            />
            <KPICard
                title="Receitas"
                value={income}
                type="green"
                subtitle="Total no período"
                footerData={[
                    { label: 'Recebido', value: incomeDetails.paid, color: 'green', icon: <CheckCircle2 size={12} /> },
                    { label: 'A receber', value: incomeDetails.pending, color: 'orange', icon: <Clock size={12} /> }
                ]}
            />
            <KPICard
                title="Despesas"
                value={expense}
                type="red"
                subtitle="Total no período"
                footerData={[
                    { label: 'Pago', value: expenseDetails.paid, color: 'green', icon: <CheckCircle2 size={12} /> },
                    { label: 'A pagar', value: expenseDetails.pending, color: 'red', icon: <AlertCircle size={12} /> }
                ]}
            />
            <KPICard
                title="Saldo Previsto"
                value={balance}
                type="blue"
                subtitle="Saldo final projetado"
                footerData={[
                    { label: 'Atual', value: incomeDetails.paid - expenseDetails.paid, color: 'green', icon: <CheckCircle2 size={12} /> },
                    { label: 'Projetado', value: balance, color: 'blue', icon: <Clock size={12} /> }
                ]}
            />
        </div>
    )
}
