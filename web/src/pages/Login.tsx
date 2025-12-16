import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Wallet, Smartphone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const formatPhone = (value: string) => {
        return value.replace(/\D/g, '')
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // 1. Validate Form
        const cleanPhone = formatPhone(phone)
        if (cleanPhone.length < 8 || password.length !== 6) { // Relaxed validation
            setError('Verifique os dados informados')
            setLoading(false)
            return
        }

        // 2. Auth Check against 'users' table
        try {
            // Flexible phone check: Try with and without '55' prefix
            const possiblePhones = [cleanPhone]
            if (!cleanPhone.startsWith('55')) {
                possiblePhones.push(`55${cleanPhone}`)
            }

            const { data: user, error: dbError } = await supabase
                .from('users')
                .select('id, full_name, phone_number')
                .in('phone_number', possiblePhones)
                .eq('password', password)
                .maybeSingle() // Prevents 406 error if not found

            if (dbError || !user) {
                console.log('Login failed:', dbError)
                setError('Credenciais inválidas.')
            } else {
                setSuccess(true)
                // 3. Set Cookies for session
                document.cookie = `user_id=${user.id}; path=/; max-age=86400; SameSite=Strict`
                document.cookie = `user_name=${encodeURIComponent(user.full_name || '')}; path=/; max-age=86400; SameSite=Strict`
                document.cookie = `user_phone=${user.phone_number || ''}; path=/; max-age=86400; SameSite=Strict`

                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            }
        } catch (err) {
            setError('Erro ao conectar ao servidor.')
        }

        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-gray-800"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">Grania</h1>
                    <p className="mt-2 text-green-100">Controle financeiro inteligente</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="mb-4 text-green-500">
                                <CheckCircle2 size={64} />
                            </motion.div>
                            <h2 className="text-xl font-bold text-green-600">Login realizado!</h2>
                            <p className="text-gray-500">Redirecionando...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp / Celular</label>
                                <div className="relative mt-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Smartphone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="11999999999"
                                        className="block w-full rounded-xl border-gray-300 bg-gray-50 pl-10 py-3 text-gray-900 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha (6 dígitos)</label>
                                <div className="relative mt-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        maxLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="******"
                                        className="block w-full rounded-xl border-gray-300 bg-gray-50 pl-10 py-3 text-gray-900 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    * Use a senha definida no Telegram
                                </p>
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Entrando...' : (
                                    <>
                                        Acessar Painel <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    )}
                </div>

                <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 dark:bg-gray-800/50">
                    Ainda não tem conta? Chame o Bot no Telegram.
                </div>
            </motion.div>
        </div>
    )
}
