'use client'
import Link from 'next/link'
import { Home, PieChart, Wallet, CreditCard, Settings, LogOut } from 'lucide-react'

export function Sidebar() {
    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50/50 backdrop-blur-md border-r border-gray-200 dark:bg-gray-800/50 dark:border-gray-700 font-sans flex flex-col">
                <Link href="/dashboard" className="flex items-center ps-2.5 mb-5 space-x-2">
                    <span className="self-center text-xl font-bold whitespace-nowrap text-green-600 dark:text-green-400 flex items-center gap-2">
                        <span className="text-2xl">🌱</span> Grania
                    </span>
                </Link>
                <ul className="space-y-2 font-medium flex-1">
                    <li>
                        <Link href="/dashboard" className="flex items-center rounded-lg p-2 text-gray-900 bg-green-100 dark:text-white dark:bg-green-900 group">
                            <Home className="h-5 w-5 text-green-600" />
                            <span className="ms-3">Planeje sua grana</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/reports" className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-green-100 dark:text-white dark:hover:bg-green-800 group">
                            <PieChart className="h-5 w-5 text-green-600" />
                            <span className="ms-3">Relatórios</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-green-100 dark:text-white dark:hover:bg-green-800 group">
                            <Wallet className="h-5 w-5 text-green-600" />
                            <span className="ms-3">Contas bancárias</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-green-100 dark:text-white dark:hover:bg-green-800 group">
                            <CreditCard className="h-5 w-5 text-green-600" />
                            <span className="ms-3">Cartão de Crédito</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-green-100 dark:text-white dark:hover:bg-green-800 group">
                            <Settings className="h-5 w-5 text-green-600" />
                            <span className="ms-3">Configurações</span>
                        </Link>
                    </li>
                </ul>
                <div className="mt-auto flex items-center p-2 space-x-2">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                        PO
                    </div>
                    <div className="text-sm">
                        <p className="font-bold">Pedro Oliveira</p>
                        <p className="text-xs text-yellow-600 bg-yellow-100 px-1 rounded inline-block">Premium</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
