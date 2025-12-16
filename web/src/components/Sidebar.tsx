import { Home, LineChart, LogOut, Wallet, Tag, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Helper to get cookie value
function getCookie(name: string): string {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '')
    return ''
}

export function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const currentPath = location.pathname

    const [userName, setUserName] = useState('')
    const [userPhone, setUserPhone] = useState('')

    useEffect(() => {
        setUserName(getCookie('user_name'))
        setUserPhone(getCookie('user_phone'))
    }, [])

    const handleLogout = () => {
        // Clear cookies
        document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie = "user_phone=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        navigate('/login')
    }

    const isActive = (path: string) => {
        if (path === '/dashboard' && currentPath === '/dashboard') return true
        if (path !== '/dashboard' && currentPath.startsWith(path)) return true
        return false
    }

    const navItems = [
        { name: 'Visão Geral', path: '/dashboard', icon: Home },
        { name: 'Transações', path: '/dashboard/transactions', icon: Wallet },
        { name: 'Relatórios', path: '/dashboard/reports', icon: LineChart },
        { name: 'Categorias', path: '/dashboard/categories', icon: Tag },
    ]

    // Format phone for display
    const formatPhone = (phone: string) => {
        if (!phone) return ''
        const clean = phone.replace(/\D/g, '')
        if (clean.length >= 11) {
            return `(${clean.slice(-11, -9)}) ${clean.slice(-9, -4)}-${clean.slice(-4)}`
        }
        return phone
    }

    return (
        <>
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white transition-transform sm:translate-x-0 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-full flex-col px-3 py-4">
                    <div className="mb-6 flex items-center pl-2.5">
                        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                            Grania
                        </span>
                    </div>

                    <ul className="space-y-2 font-medium">
                        {navItems.map((item) => {
                            const active = isActive(item.path)
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center rounded-lg p-2 group ${active
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                                            : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="ml-3">{item.name}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>

                    <div className="mt-auto border-t pt-4 dark:border-gray-700">
                        {/* User Profile */}
                        {(userName || userPhone) && (
                            <div className="flex items-center gap-3 p-2 mb-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/50">
                                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">
                                        {userName || 'Usuário'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                        {formatPhone(userPhone)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center rounded-lg p-2 text-gray-900 hover:bg-red-50 hover:text-red-600 dark:text-white dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="ml-3">Sair</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
