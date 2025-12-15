
import { Calendar, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'

interface DashboardHeaderProps {
    dateRange: string
    setDateRange: (range: string) => void
    onRefresh: () => void
}

export function DashboardHeader({ dateRange, setDateRange, onRefresh }: DashboardHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm dark:bg-gray-800 xl:flex-row xl:items-center xl:justify-between">
            {/* Left: Date Type Switch */}
            <div className="flex items-center gap-4">
                <div className="flex bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold items-center gap-2 cursor-pointer shadow-blue-500/30 shadow-lg transition-transform hover:scale-105 active:scale-95">
                    <Calendar size={18} />
                    <span>Data de Vencimento</span>
                </div>

                {/* Month Navigator */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1 dark:bg-gray-700">
                    <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-lg font-bold text-gray-800 dark:text-white min-w-[120px] text-center">Dezembro</span>
                    <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Center: Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 font-medium text-sm">
                <button
                    onClick={() => setDateRange('today')}
                    className={`px-4 py-2 rounded-xl transition-all ${dateRange === 'today' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}>
                    Hoje
                </button>
                <button
                    onClick={() => setDateRange('7_days')}
                    className={`px-4 py-2 rounded-xl transition-all ${dateRange === '7_days' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}>
                    7 dias atrás
                </button>
                <button
                    onClick={() => setDateRange('this_month')}
                    className={`px-4 py-2 rounded-xl transition-all ${dateRange === 'this_month' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}>
                    Esse mês
                </button>
                <button
                    onClick={() => setDateRange('this_year')}
                    className={`px-4 py-2 rounded-xl transition-all ${dateRange === 'this_year' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}>
                    Esse ano
                </button>
            </div>

            {/* Right: Custom Date & Actions */}
            <div className="flex items-center gap-3 text-sm font-medium">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-gray-600 border border-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                    <Calendar size={16} />
                    <span>01/12 - 31/12</span>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                    <Filter size={16} />
                    <span className="hidden sm:inline">Limpar filtro</span>
                </button>

                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
                >
                    <RotateCcw size={16} />
                    <span className="hidden sm:inline">Atualizar</span>
                </button>
            </div>
        </div>
    )
}
