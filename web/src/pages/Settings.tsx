import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Download, Trash2, UserX, AlertTriangle, CheckCircle2, Users, UserPlus, Mail } from 'lucide-react'

// Tab Component
const TabButton = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${active
            ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
    >
        {label}
    </button>
)

// Helper to get user ID
const getUserId = () => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; user_id=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return null
}

const SharedManagement = () => {
    const [invitePhone, setInvitePhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<any[]>([])
    const [invitations, setInvitations] = useState<any[]>([])
    const [sentInvitations, setSentInvitations] = useState<any[]>([])
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Load Data
    const loadData = async () => {
        const userId = getUserId()
        if (!userId) return

        // Get Current User & Family
        const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
        setCurrentUser(user)

        if (user?.family_id) {
            // Get Members
            const { data: familyMembers } = await supabase
                .from('users')
                .select('*')
                .eq('family_id', user.family_id)
            setMembers(familyMembers || [])
        }

        // Get Received Invitations
        const { data: received } = await supabase
            .from('invitations')
            .select('*, sender:sender_id(full_name)')
            .eq('receiver_phone', user?.phone_number)
            .eq('status', 'pending')
        setInvitations(received || [])

        // Get Sent Invitations
        const { data: sent } = await supabase
            .from('invitations')
            .select('*')
            .eq('sender_id', userId)
        setSentInvitations(sent || [])
    }

    useState(() => {
        loadData()
    })

    const handleInvite = async () => {
        if (!invitePhone) return
        setLoading(true)
        setMessage(null)
        try {
            const userId = getUserId()
            const { error } = await supabase.from('invitations').insert({
                sender_id: userId,
                receiver_phone: invitePhone
            })

            if (error) throw error
            setMessage({ type: 'success', text: 'Convite enviado com sucesso!' })
            setInvitePhone('')
            loadData()
        } catch (err) {
            console.error(err)
            setMessage({ type: 'error', text: 'Erro ao enviar convite.' })
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (invitation: any) => {
        setLoading(true)
        try {
            // Get sender's family ID
            const { data: sender } = await supabase.from('users').select('family_id').eq('id', invitation.sender_id).single()

            if (sender) {
                // Update my family_id
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ family_id: sender.family_id })
                    .eq('id', currentUser.id)

                if (updateError) throw updateError

                // Update invitation status
                await supabase
                    .from('invitations')
                    .update({ status: 'accepted' })
                    .eq('id', invitation.id)

                setMessage({ type: 'success', text: 'Convite aceito! Agora vocês compartilham a mesma conta.' })
                loadData()
            }
        } catch (err) {
            console.error(err)
            setMessage({ type: 'error', text: 'Erro ao aceitar convite.' })
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async (id: string) => {
        setLoading(true)
        try {
            await supabase.from('invitations').update({ status: 'rejected' }).eq('id', id)
            loadData()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Current Family Members */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Users className="text-blue-500" size={24} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Membros da Conta</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Essas pessoas têm acesso completo aos lançamentos e gestão desta conta.
                </p>

                <div className="space-y-3">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                    {member.full_name?.[0] || '?'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{member.full_name}</p>
                                    <p className="text-sm text-gray-500">{member.phone_number || 'Sem telefone'}</p>
                                </div>
                            </div>
                            {member.id === currentUser?.id && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Você</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Invite Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <UserPlus className="text-green-500" size={24} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Convidar novo membro</h3>
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Telefone (ex: 11999999999)"
                        value={invitePhone}
                        onChange={e => setInvitePhone(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white"
                    />
                    <button
                        onClick={handleInvite}
                        disabled={loading || !invitePhone}
                        className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                        Convidar
                    </button>
                </div>

                {/* Sent Invitations List */}
                {sentInvitations.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-500 mb-3">Convites enviados</h4>
                        <div className="space-y-2">
                            {sentInvitations.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <span>{inv.receiver_phone}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        inv.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {inv.status === 'pending' ? 'Pendente' : inv.status === 'accepted' ? 'Aceito' : 'Recusado'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Received Invitations */}
            {invitations.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Mail className="text-blue-600" size={24} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Convites Recebidos</h3>
                    </div>
                    <div className="space-y-4">
                        {invitations.map(inv => (
                            <div key={inv.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        <span className="font-bold">{inv.sender?.full_name || 'Alguém'}</span> convidou você para dividir a conta.
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Ao aceitar, você compartilhará todos os seus lançamentos.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReject(inv.id)}
                                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors"
                                    >
                                        Recusar
                                    </button>
                                    <button
                                        onClick={() => handleAccept(inv)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        Aceitar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const ProfileSettings = () => {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [user, setUser] = useState<any>(null)
    const [name, setName] = useState('')

    // Load data
    useEffect(() => {
        const loadUser = async () => {
            const userId = getUserId()
            if (!userId) return

            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (data) {
                setUser(data)
                setName(data.full_name || '')
            }
        }
        loadUser()
    }, [])

    const handleSave = async () => {
        setLoading(true)
        setMessage(null)
        try {
            const userId = getUserId()
            const { error } = await supabase
                .from('users')
                .update({ full_name: name })
                .eq('id', userId)

            if (error) throw error

            // Update cookie to keep sidebar in sync
            document.cookie = `user_name=${encodeURIComponent(name || '')}; path=/; max-age=86400; SameSite=Strict`

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
        } catch (error) {
            console.error(error)
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' })
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (nameData: string) => {
        return nameData
            ?.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'NA'
    }

    if (!user) return <div className="p-8 text-center text-gray-500">Carregando...</div>

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm max-w-xl">
            <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Meu perfil</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Atualize suas informações pessoais.</p>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
                    {getInitials(name || user.full_name)}
                </div>
                <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                    Adicionar Foto
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                        Nome
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                        E-mail
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            value={user.email || ''}
                            placeholder='Seu email'
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <span className='px-2 text-xl pb-2'>...</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Para alterar, entre em contato com o suporte.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                        Telefone
                    </label>
                    <input
                        type="text"
                        value={user.phone_number || ''}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-2">Para alterar, entre em contato com o suporte.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                        {message.text}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 mt-4 active:scale-[0.98]"
                >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    )
}

export default function Settings() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('Dados')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Handlers
    const handleExport = async () => {
        setLoading(true)
        setMessage(null)
        try {
            const userId = getUserId()
            if (!userId) throw new Error('Usuário não identificado.')

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .csv()

            if (error) throw error

            // Trigger download
            const blob = new Blob([data], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `lancamentos-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setMessage({ type: 'success', text: 'Exportação concluída com sucesso!' })
        } catch (error: any) {
            console.error(error)
            setMessage({ type: 'error', text: 'Erro ao exportar dados. Tente novamente.' })
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTransactions = async () => {
        if (!confirm('Tem certeza? Isso apagará TODAS as suas transações. Essa ação é irreversível.')) return

        setLoading(true)
        setMessage(null)
        try {
            const userId = getUserId()
            if (!userId) throw new Error('Usuário não identificado.')

            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', userId)

            if (error) throw error

            setMessage({ type: 'success', text: 'Todas as transações foram excluídas.' })
        } catch (error: any) {
            console.error(error)
            setMessage({ type: 'error', text: 'Erro ao excluir transações.' })
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        const confirm1 = confirm('ATENÇÃO: Você está prestes a excluir sua conta PERMANENTEMENTE.')
        if (!confirm1) return
        const confirm2 = confirm('Todos os seus dados serão perdidos. Tem certeza absoluta?')
        if (!confirm2) return

        setLoading(true)
        try {
            const userId = getUserId()
            if (!userId) throw new Error('Usuário não identificado.')

            // Delete transactions
            const { error: txError } = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', userId)

            if (txError) throw txError

            // Note: In a real app, you might also want to delete the auth user via an Edge Function
            // For now, we clean up data and logout.

            // Clear Cookies
            document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
            document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
            document.cookie = "user_phone=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

            navigate('/login')
        } catch (error: any) {
            console.error(error)
            setMessage({ type: 'error', text: 'Erro ao excluir conta. Entre em contato com o suporte.' })
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 p-4 sm:ml-64 lg:p-8">
                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurações</h1>

                {/* Tabs */}
                <div className="mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        <TabButton active={activeTab === 'Perfil'} label="Meu perfil" onClick={() => setActiveTab('Perfil')} />
                        <TabButton active={activeTab === 'Gestao'} label="Gestão compartilhada" onClick={() => setActiveTab('Gestao')} />
                        <TabButton active={activeTab === 'Preferencia'} label="Preferência" onClick={() => setActiveTab('Preferencia')} />
                        <TabButton active={activeTab === 'Notificacoes'} label="Notificações" onClick={() => setActiveTab('Notificacoes')} />
                        <TabButton active={activeTab === 'Aparencia'} label="Aparência" onClick={() => setActiveTab('Aparencia')} />
                        <TabButton active={activeTab === 'Dados'} label="Dados" onClick={() => setActiveTab('Dados')} />
                        <TabButton active={activeTab === 'Planos'} label="Planos" onClick={() => setActiveTab('Planos')} />
                    </div>
                </div>

                {/* Content */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                        {message.text}
                    </div>
                )}

                {activeTab === 'Dados' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Export Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Exportar lançamentos</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">
                                Se você deseja exportar todos os seus lançamentos financeiros, utilize o botão abaixo.
                            </p>
                            <button
                                onClick={handleExport}
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Download size={18} />
                                Exportar
                            </button>
                        </div>

                        {/* Delete Transactions Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                            <h3 className="text-lg font-bold text-red-600 mb-2">Excluir todos os lançamentos</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">
                                Se você deseja começar do zero, excluindo todos os lançamentos financeiros, utilize o botão abaixo.
                            </p>
                            <button
                                onClick={handleDeleteTransactions}
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Trash2 size={18} />
                                Excluir todos os lançamentos
                            </button>
                        </div>

                        {/* Delete Account Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-2">
                                <UserX className="text-red-500" size={20} />
                                <h3 className="text-lg font-bold text-red-600">Excluir minha conta</h3>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">
                                Você pode solicitar a exclusão permanente de todos os seus dados pessoais a qualquer momento.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <UserX size={18} />
                                Excluir minha conta
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'Perfil' && <ProfileSettings />}
                {activeTab === 'Gestao' && <SharedManagement />}

                {activeTab !== 'Dados' && activeTab !== 'Gestao' && activeTab !== 'Perfil' && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-400 font-medium">Configurações de {activeTab} em desenvolvimento</p>
                    </div>
                )}
            </div>
        </div>
    )
}
