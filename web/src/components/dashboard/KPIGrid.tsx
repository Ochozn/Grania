
import { motion } from 'framer-motion'
import { Eye, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface KPICardProps {
    title: string
    value: number
    type: 'blue' | 'green' | 'red' | 'neutral'
    subtitle: string
    footerData: { label: string; value: number; color: string; icon?: any }[]
}

function KPICard({ title, value, type, subtitle, footerData }: KPICardProps) {
    const colors = {
        blue: 'text-blue-600 border-blue-100',
        green: 'text-green-600 border-green-100',
        red: 'text-red-500 border-red-100',
        neutral: 'text-gray-600 border-gray-100'
    }

    const valueColors = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-500',
        neutral: 'text-gray-800'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col rounded-3xl bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {type === 'blue' && <TrendingUp size={16} className="text-blue-500" />}
                    {type === 'green' && <TrendingUp size={16} className="text-green-500" />}
                    {type === 'red' && <TrendingDown size={16} className="text-red-500" />}
                    <span>{title}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <Eye size={18} />
                </button>
            </div>

            {/* Value */}
            <h3 className={`text-2xl font-bold mb-1 ${valueColors[type]}`}>
                R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-gray-400 mb-6">{subtitle}</p>

            {/* Expander/Details */}
            <div className="mt-auto">
                <button className="text-xs text-gray-400 mb-3 flex items-center justify-between w-full hover:text-gray-600">
                    Ocultar detalhes ^
                </button>

                <div className="flex gap-2">
                    {footerData.map((item, idx) => (
                        <div key={idx} className={`flex-1 rounded-xl p-2 bg-opacity-10 dark:bg-opacity-10 ${item.color === 'orange' ? 'bg-orange-100' : (item.color === 'green' ? 'bg-green-100' : 'bg-red-100')}`}>
                            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                            <p className={`text-sm font-bold ${item.color === 'orange' ? 'text-orange-600' : (item.color === 'green' ? 'text-green-600' : 'text-red-600')}`}>
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
}

export function KPIGrid({ income, expense, balance }: KPIGridProps) {
    return (
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <KPICard
                title="Saldo Do Período Anterior"
                value={0.00}
                type="blue"
                subtitle="Até 30 De Novembro"
                footerData={[
                    { label: 'Pendências', value: 0.00, color: 'orange', icon: <Clock size={12} /> },
                    { label: 'Disponível', value: 0.00, color: 'green', icon: <CheckCircle2 size={12} /> }
                ]}
            />
            <KPICard
                title="Receitas"
                value={income}
                type="green"
                subtitle="1 De Dezembro - 31 De Dezembro"
                footerData={[
                    { label: 'Recebido', value: income, color: 'green', icon: <CheckCircle2 size={12} /> },
                    { label: 'A receber', value: 0.00, color: 'orange', icon: <Clock size={12} /> }
                ]}
            />
            <KPICard
                title="Despesas"
                value={expense}
                type="red"
                subtitle="1 De Dezembro - 31 De Dezembro"
                footerData={[
                    { label: 'Pago', value: expense, color: 'green', icon: <CheckCircle2 size={12} /> },
                    { label: 'A pagar', value: 0.00, color: 'red', icon: <AlertCircle size={12} /> }
                ]}
            />
            <KPICard
                title="Saldo Previsto"
                value={balance}
                type="blue"
                subtitle="Até 31 De Dezembro"
                footerData={[
                    { label: 'Disponível', value: balance, color: 'green', icon: <CheckCircle2 size={12} /> },
                    { label: 'Previsto', value: balance, color: 'blue', icon: <Clock size={12} /> }
                ]}
            />
        </div>
    )
}
