
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { Plus, Search, LayoutGrid, Table, Edit2, Trash2, Clock, Info, Tag } from 'lucide-react'
import { motion } from 'framer-motion'

interface CategoryItem {
    id: string
    name: string
    type: 'income' | 'expense'
    count: number
    color: string
}

const COLORS = ['#f97316', '#a855f7', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e']

// Helper to get consistent color from string
const getColorForCategory = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
}

export default function Categories() {
    const [categories, setCategories] = useState<CategoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
    const [activeTab, setActiveTab] = useState('active') // active, archived, sub_active, sub_archived

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            const [catsResponse, txResponse] = await Promise.all([
                supabase.from('categories').select('*').eq('user_id', user.id),
                supabase.from('transactions').select('*').eq('user_id', user.id)
            ])

            if (catsResponse.error) console.error('Error fetching categories:', catsResponse.error)
            if (txResponse.error) console.error('Error fetching transactions:', txResponse.error)

            const definedCats = catsResponse.data || []
            const transactions = txResponse.data || []

            const catMap: Record<string, CategoryItem> = {}

            // 1. Process defined categories
            definedCats.forEach(c => {
                catMap[c.name] = {
                    id: c.id,
                    name: c.name,
                    type: c.type as 'income' | 'expense',
                    count: 0,
                    color: getColorForCategory(c.name)
                }
            })

            // 2. Process transactions to update counts and find new categories
            transactions.forEach(t => {
                const name = t.category || 'Outros'

                if (!catMap[name]) {
                    // Implicit category found in transactions
                    catMap[name] = {
                        id: name,
                        name: name,
                        type: t.type,
                        count: 0,
                        color: getColorForCategory(name)
                    }
                }

                catMap[name].count++
            })

            const sorted = Object.values(catMap).sort((a, b) => a.name.localeCompare(b.name))
            setCategories(sorted)

        } catch (err) {
            console.error('Unexpected error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 p-4 lg:p-8 transition-all duration-300 sm:ml-64">

                {/* Header Section */}
                <div className="mb-8 mt-14 sm:mt-0">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Gerenciar Categorias Personalizada
                    </h1>
                    <p className="text-gray-500 text-sm max-w-4xl leading-relaxed">
                        A IA já é capaz de identificar categorias automaticamente. No entanto, se preferir, você pode personalizar as categorias de acordo com suas necessidades.
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 font-medium">
                                <Plus size={18} />
                                Crie sua categoria
                            </button>
                            <span className="text-xs text-gray-400 px-2 lg:text-center">Disponível apenas para usuários Premium</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 font-medium">
                                <Plus size={18} />
                                Crie sua subcategoria
                            </button>
                            <span className="text-xs text-gray-400 px-2 lg:text-center">Disponível apenas para usuários Premium</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
                    <div className="flex space-x-8 min-w-max">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'active' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <Tag size={16} />
                            Categorias Ativas
                        </button>
                        <button
                            onClick={() => setActiveTab('archived')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'archived' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <Trash2 size={16} />
                            Categorias Arquivadas
                        </button>
                        <button
                            onClick={() => setActiveTab('sub_active')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'sub_active' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <Tag size={16} />
                            Subcategoria Ativas
                        </button>
                        <button
                            onClick={() => setActiveTab('sub_archived')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'sub_archived' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <Trash2 size={16} />
                            Subcategoria Arquivadas
                        </button>
                    </div>
                </div>

                {/* Filter and Toggle */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar categorias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <LayoutGrid size={16} />
                            Cards
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <Table size={16} />
                            Tabela
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        Nenhuma categoria encontrada.
                    </div>
                ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                        {filteredCategories.map(cat => (
                            <motion.div
                                layout
                                key={cat.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                <div className="flex items-start justify-between p-4 pl-0">
                                    <div className="flex items-center flex-1">
                                        {/* Colored Border Indicator (Simulated with div) */}
                                        <div
                                            className="h-12 w-1.5 rounded-r-full mr-4"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{cat.name}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pr-4">
                                        {/* Color Dot Indicator */}
                                        <div
                                            className="w-6 h-6 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        ></div>

                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Reports Section / Footer */}
                                <div className="px-4 pb-4">
                                    <div className="mt-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg py-2 px-4 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                        <Clock size={16} />
                                        <span className="text-sm font-medium">Relatórios</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: cat.color }}></div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Ativo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

