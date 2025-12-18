'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '../components/Sidebar'

interface CategorySummary {
  category: string
  type: 'income' | 'expense'
  total: number
  count: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .select('category, type, amount')
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    if (data) {
      const summary = data.reduce((acc: Record<string, CategorySummary>, curr) => {
        const key = `${curr.category}-${curr.type}`
        if (!acc[key]) {
          acc[key] = {
            category: curr.category,
            type: curr.type,
            total: 0,
            count: 0
          }
        }
        acc[key].total += curr.amount
        acc[key].count += 1
        return acc
      }, {})

      setCategories(Object.values(summary))
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-emerald-400">Categorias</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : categories.length === 0 ? (
          <div className="p-6 bg-gray-800 rounded-xl text-center">
            <p className="text-gray-400">Nenhuma transação encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={`${cat.category}-${cat.type}`} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-emerald-500 transition shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold capitalize">{cat.category}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${cat.type === 'income' ? 'bg-emerald-900 text-emerald-400' : 'bg-rose-900 text-rose-400'}`}>
                    {cat.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Total Transações: <span className="text-white">{cat.count}</span></p>
                  <p className="text-2xl font-bold">
                    {cat.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
