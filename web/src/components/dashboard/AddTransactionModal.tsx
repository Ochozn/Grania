
import { useState, useEffect } from 'react'
import { X, Check, Calendar, Type, DollarSign, Tag, Archive, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface AddTransactionModalProps {
    isOpen: boolean
    onClose: () => void
    initialType?: 'income' | 'expense'
    onSuccess?: () => void
}

export function AddTransactionModal({ isOpen, onClose, initialType = 'income', onSuccess }: AddTransactionModalProps) {
    const [type, setType] = useState<'income' | 'expense'>(initialType)
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [subcategory, setSubcategory] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState('')
    const [status, setStatus] = useState<'paid' | 'pending'>('paid')
    const [isFixed, setIsFixed] = useState(false)
    const [loading, setLoading] = useState(false)

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setType(initialType)
            setAmount('')
            setDescription('')
            setCategory('')
            setSubcategory('')
            setDate(new Date().toISOString().split('T')[0])
            setDueDate('')
            setStatus('paid')
            setIsFixed(false)
        }
    }, [isOpen, initialType])

    // Categories (Could be dynamic later)
    const categories = type === 'income'
        ? ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros']
        : ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Contas Fixas', 'Outros']

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('User not found')

            const parsedAmount = parseFloat(amount.replace(',', '.'))
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                alert('Por favor, insira um valor válido.')
                setLoading(false)
                return
            }

            if (!category) {
                alert('Por favor, selecione uma categoria.')
                setLoading(false)
                return
            }

            const { error } = await supabase.from('transactions').insert({
                user_id: user.id,
                description,
                amount: parsedAmount,
                type,
                category,
                subcategory: subcategory || null,
                date,
                due_date: dueDate || null,
                status,
                is_fixed: isFixed
            })

            if (error) throw error

            if (onSuccess) onSuccess()
            onClose()
        } catch (error) {
            console.error('Error adding transaction:', error)
            alert('Erro ao salvar transação')
        } finally {
            setLoading(false)
        }
    }


    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-10">
                        <div className="flex items-center gap-3">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {type === 'income' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                                    Adicionar {type === 'income' ? 'Receita' : 'Despesa'}
                                </h2>
                                <p className="text-xs text-slate-400 font-medium">Preencha os dados da transação</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-800/50">

                        {/* Type Switcher */}
                        <div className="flex p-1.5 bg-slate-200/50 rounded-2xl dark:bg-slate-700/50">
                            <button
                                type="button"
                                onClick={() => setType('income')}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                <ArrowUpCircle size={18} /> Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('expense')}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-800 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                <ArrowDownCircle size={18} /> Despesa
                            </button>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">Valor</label>
                            <div className="relative group">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-2xl font-bold font-display text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all placeholder:text-slate-300"
                                    placeholder="0,00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">Descrição</label>
                            <div className="relative group">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all placeholder:text-slate-300 font-medium"
                                    placeholder="Ex: Salário, Netflix, Mercado..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Category & Subcategory */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">Categoria</label>
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <select
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all font-medium text-slate-600"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Selecione</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">Subcategoria <span className="text-slate-400 font-normal">(Opcional)</span></label>
                                <div className="relative group">
                                    <Archive className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all placeholder:text-slate-300 font-medium"
                                        placeholder="Ex: Mensalidade"
                                        value={subcategory}
                                        onChange={e => setSubcategory(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">Data de Competência</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input
                                        type="date"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all font-medium text-slate-600"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">Data de Vencimento</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input
                                        type="date"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all font-medium text-slate-600"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 pt-2">
                            <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-all dark:bg-slate-700 dark:border-slate-600">
                                <span className="flex flex-col">
                                    <span className="font-semibold text-slate-800 dark:text-white">Status do Pagamento</span>
                                    <span className="text-xs text-slate-500 mt-0.5">{status === 'paid' ? 'Transação efetivada' : 'Agendar transação pendente'}</span>
                                </span>
                                <div
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${status === 'paid' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setStatus(status === 'paid' ? 'pending' : 'paid')
                                    }}
                                >
                                    <div className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${status === 'paid' ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-all dark:bg-slate-700 dark:border-slate-600">
                                <span className="flex flex-col">
                                    <span className="font-semibold text-slate-800 dark:text-white">Transação Fixa</span>
                                    <span className="text-xs text-slate-500 mt-0.5">Repete mensalmente automaticamente</span>
                                </span>
                                <div
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${isFixed ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setIsFixed(!isFixed)
                                    }}
                                >
                                    <div className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isFixed ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </label>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800 z-10">
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3.5 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`flex-1 py-3.5 text-sm font-bold text-white rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${type === 'income'
                                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                                    : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                                    }`}
                                disabled={loading}
                            >
                                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={20} />}
                                {loading ? 'Salvando...' : 'Salvar Transação'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
