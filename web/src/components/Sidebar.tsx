import { Home, LineChart, LogOut, Wallet, Tag } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const currentPath = location.pathname

    const handleLogout = () => {
        // Clear cookie
        document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
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
