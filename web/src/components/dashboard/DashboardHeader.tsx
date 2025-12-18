
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'




interface DashboardHeaderProps {
    dateRange: string
    setDateRange: (range: string) => void
    onRefresh: () => void
    currentDate: Date
    setCurrentDate: (date: Date) => void
}

export function DashboardHeader({ dateRange, setDateRange, onRefresh, currentDate, setCurrentDate }: DashboardHeaderProps) {

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() - 1)
        setCurrentDate(newDate)
        setDateRange('custom')
    }

    const handleNextMonth = () => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() + 1)
        setCurrentDate(newDate)
        setDateRange('custom')
    }

    const formattedMonth = currentDate.toLocaleDateString('pt-BR', { month: 'long' })
    const formattedYear = currentDate.getFullYear()

    return (
        <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            {/* Left: Title & Month Nav */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                        Visão Geral
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Acompanhe suas finanças e metas.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
                        <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-900 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-base font-bold font-display text-slate-800 dark:text-white min-w-[140px] text-center capitalize tracking-tight">
                            {formattedMonth} {formattedYear}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-900 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button
                        onClick={onRefresh}
                        className="p-3 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:hover:text-blue-400"
                        title="Atualizar dados"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Right: Filters */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { id: 'today', label: 'Hoje' },
                    { id: '7_days', label: '7 Dias' },
                    { id: 'this_month', label: 'Mês Atual' },
                    { id: 'this_year', label: 'Ano Atual' },
                ].map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => { setDateRange(filter.id); setCurrentDate(new Date()); }}
                        className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${dateRange === filter.id
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md dark:bg-white dark:border-white dark:text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
