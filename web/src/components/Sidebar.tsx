import { Home, LineChart, LogOut, Wallet, Tag, User, Settings } from 'lucide-react'
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
        { name: 'Ajustes', path: '/dashboard/settings', icon: Settings },
    ]

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
            {/* --- DESKTOP SIDEBAR (Hidden on mobile) --- */}
            <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-72 flex-col border-r border-slate-100 bg-white px-6 py-8 dark:border-slate-800 dark:bg-[#0F1115]">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                        <span className="text-xl">🌱</span>
                    </div>
                    <span className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Grania</span>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${active
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto border-t border-slate-100 pt-6 dark:border-slate-800">
                    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-slate-700 dark:text-slate-300">
                            <User size={20} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{userName || 'Usuário'}</p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{formatPhone(userPhone)}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all dark:border-slate-700 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                    >
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* --- MOBILE BOTTOM NAV (Hidden on desktop) --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 pb-safe dark:bg-[#0F1115]/90 dark:border-slate-800">
                <nav className="flex justify-around items-center px-2 py-3">
                    {navItems.map((item) => {
                        const active = isActive(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-xl transition-all active:scale-95 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-full transition-all ${active ? 'bg-emerald-50 dark:bg-emerald-500/20 translate-y-[-2px]' : ''}`}>
                                    <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-medium ${active ? 'opacity-100 font-bold' : 'opacity-80'}`}>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    )
}
