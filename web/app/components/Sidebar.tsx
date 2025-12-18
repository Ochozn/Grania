'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Home, PieChart, Wallet, CreditCard, LogOut, Menu, X, Tags } from 'lucide-react'

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 text-gray-600 bg-white rounded-lg shadow-lg sm:hidden hover:bg-gray-100 dark:text-gray-300 dark:bg-gray-800"
                aria-label="Toggle Menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm sm:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`} aria-label="Sidebar">
                <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50/50 backdrop-blur-md border-r border-gray-200 dark:bg-gray-900/95 dark:border-gray-700 font-sans flex flex-col">
                    <Link href="/dashboard" className="flex items-center ps-2.5 mb-8 space-x-2">
                        <span className="self-center text-xl font-bold whitespace-nowrap text-green-600 dark:text-green-400 flex items-center gap-2">
                            <span className="text-2xl">🌱</span> Grania
                        </span>
                    </Link>

                    <ul className="space-y-2 font-medium flex-1">
                        <li>
                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-green-100 dark:text-white dark:hover:bg-green-800/50 group"
                            >
                                <Home className="h-5 w-5 text-green-600" />
                                <span className="ms-3">Visão Geral</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/categories"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-green-100 dark:text-white dark:hover:bg-green-800/50 group"
                            >
                                <Tags className="h-5 w-5 text-green-600" />
                                <span className="ms-3">Categorias</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard/reports"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-green-100 dark:text-white dark:hover:bg-green-800/50 group"
                            >
                                <PieChart className="h-5 w-5 text-green-600" />
                                <span className="ms-3">Relatórios</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-green-100 dark:text-white dark:hover:bg-green-800/50 group opacity-50 cursor-not-allowed">
                                <Wallet className="h-5 w-5 text-green-600" />
                                <span className="ms-3">Contas (Breve)</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-green-100 dark:text-white dark:hover:bg-green-800/50 group opacity-50 cursor-not-allowed">
                                <CreditCard className="h-5 w-5 text-green-600" />
                                <span className="ms-3">Cartões (Breve)</span>
                            </Link>
                        </li>
                    </ul>

                    <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center p-2 space-x-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                P
                            </div>
                            <div className="text-sm">
                                <p className="font-bold dark:text-gray-200">Pedro Oliveira</p>
                                <p className="text-[10px] text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded inline-block font-semibold">PREMIUM</p>
                            </div>
                        </div>
                        <button className="w-full flex items-center space-x-2 text-gray-500 hover:text-red-500 p-2 rounded-lg transition-colors text-sm">
                            <LogOut className="h-4 w-4" />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
