
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { Plus, Tag, Trash2, Edit2, ChevronDown, ChevronUp, MoreHorizontal, FolderOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Category {
    id: string
    name: string
    type: 'income' | 'expense'
    color?: string
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

    // Mock subcategories for demo (since DB structure might be simple)
    const subcats = [
        { id: '1', name: 'Empréstimo' },
        { id: '2', name: 'Quitado' }
    ]

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const { data } = await supabase.from('categories').select('*').order('name')
        if (data) setCategories(data)
        setLoading(false)
    }

    const toggleExpand = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id)
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 p-4 sm:ml-64 lg:p-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gerenciar Categorias Personalizada</h1>
                    <p className="text-sm text-gray-500 max-w-2xl">
                        A IA já é capaz de identificar categorias automaticamente. No entanto, se preferir, você pode personalizar as categorias de acordo com suas necessidades.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm text-gray-700 font-bold hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-all">
                        <Plus size={20} className="text-gray-400" />
                        Crie sua categoria
                    </button>
                    <button className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm text-gray-700 font-bold hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-all">
                        <Plus size={20} className="text-gray-400" />
                        Crie sua subcategoria
                    </button>
                </div>

                <div className="text-xs text-gray-400 mb-8 flex gap-4">
                    <span>Disponível apenas para usuários Premium</span>
                    <span>Disponível apenas para usuários Premium</span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-6 overflow-x-auto dark:border-gray-700">
                    <button className="flex items-center gap-2 pb-4 border-b-2 border-gray-900 font-bold text-gray-900 dark:text-white dark:border-white whitespace-nowrap">
                        <Tag size={18} /> Categorias Ativas
                    </button>
                    <button className="flex items-center gap-2 pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium whitespace-nowrap dark:text-gray-400">
                        <FolderOpen size={18} /> Categorias Arquivadas
                    </button>
                    <button className="flex items-center gap-2 pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium whitespace-nowrap dark:text-gray-400">
                        Subcategoria Ativas
                    </button>
                    <button className="flex items-center gap-2 pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium whitespace-nowrap dark:text-gray-400">
                        Subcategoria Arquivadas
                    </button>
                </div>

                {/* Search & Actions Bar */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Pesquisar categorias..."
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border-none shadow-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30">
                            Cards
                        </button>
                        <button className="bg-white text-gray-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                            Tabela
                        </button>
                    </div>
                </div>

                {/* Categories List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                        </div>
                    ) : (
                        categories.map(cat => (
                            <motion.div
                                layout
                                key={cat.id}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden dark:bg-gray-800"
                            >
                                <div className="flex items-center p-4">
                                    {/* Color Strip */}
                                    <div className={`w-1.5 h-12 rounded-full mr-4 ${cat.name === 'Alimentação' ? 'bg-orange-500' : (cat.name === 'Assinatura' ? 'bg-purple-500' : 'bg-red-500')}`}></div>

                                    <span className="font-bold text-gray-800 text-lg flex-1 dark:text-white">{cat.name}</span>

                                    <div className="flex items-center gap-3">
                                        <div className={`h-6 w-6 rounded-full ${cat.name === 'Alimentação' ? 'bg-orange-500' : (cat.name === 'Assinatura' ? 'bg-purple-500' : 'bg-red-500')}`}></div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 text-gray-500">
                                            <Edit2 size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 text-gray-500">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Expand Button */}
                                <div className="px-4 pb-2">
                                    <button
                                        onClick={() => toggleExpand(cat.id)}
                                        className="w-full bg-gray-50 hover:bg-gray-100 py-1.5 rounded-lg text-xs font-semibold text-gray-500 flex items-center justify-center gap-1 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        {expandedCategory === cat.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        Relatórios
                                    </button>
                                </div>

                                {/* Subcategories (Using Mock for now since table structure is unknown/simple) */}
                                {expandedCategory === cat.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="px-4 pb-4 pt-2 bg-gray-50/50 dark:bg-gray-700/30"
                                    >
                                        <h4 className="text-xs font-bold text-red-800 mb-2 dark:text-red-300">Dívida</h4>
                                        <div className="flex gap-2">
                                            {subcats.map(sub => (
                                                <span key={sub.id} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                                                    {sub.name}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
