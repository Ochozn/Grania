import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null

// Generate 5-char transaction code
function generateTxCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
}

// Format currency
function formatCurrency(amount: number): string {
    return `R$ ${amount.toFixed(2).replace('.', ',')}`
}

// Format date DD/MM/YYYY
function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const today = new Date()
const todayISO = today.toISOString().split('T')[0]
const yesterdayISO = new Date(today.getTime() - 86400000).toISOString().split('T')[0]
const tomorrowISO = new Date(today.getTime() + 86400000).toISOString().split('T')[0]

const SYSTEM_PROMPT = `
Você é a Grania, assistente financeira pessoal inteligente.
Analise a mensagem e extraia um JSON.

DATA DE HOJE: ${todayISO}
DATA DE ONTEM: ${yesterdayISO}  
DATA DE AMANHÃ: ${tomorrowISO}
ANO ATUAL: ${today.getFullYear()}

===== REGRAS DE DATA (CRÍTICO) =====
- "gastei", "comprei", "paguei" (passado) SEM data = HOJE
- "ontem" = ${yesterdayISO}
- "anteontem" = 2 dias atrás
- "amanhã" = ${tomorrowISO}
- "dia 15", "10/10", "10 de outubro" = data específica (ano atual se não dito)
- "semana passada" = 7 dias atrás
- "mês passado" = mês anterior
- "mês 10", "outubro" = mês específico do ano atual

===== REGRAS DE AÇÃO =====
1. "action": "transaction" - Registrar gasto/ganho
2. "action": "query" - Perguntas sobre dados (somas, totais, consultas)
3. "action": "chat" - Conversa, saudação
4. "action": "delete" - Excluir transação por código

===== REGRAS DE TRANSAÇÃO =====
PAGOS (status: "paid"):
- "gastei", "comprei", "paguei", "recebi", "ganhei"

PENDENTES (status: "pending"):
- "vou pagar", "pagarei", "vou receber", "receberei"
- "conta de", "parcela de", "boleto"
- Qualquer coisa com data FUTURA

RECORRÊNCIA:
- "todo mês", "mensal", "mensalmente" = recurrence: "monthly"
- "toda semana" = recurrence: "weekly"
- "conta fixa", "despesa fixa" = is_fixed: true

TIPOS:
- Gastos = type: "expense"
- Ganhos/receitas = type: "income"

===== REGRAS DE CONSULTA =====
Para queries, extraia:
- query_type: "sum" | "list" | "compare" | "analysis"
- periods: array de períodos [{start_date, end_date, label}]
- filter_type: "expense" | "income" | "all"

Exemplos:
- "Quanto gastei no mês 10?" → periods: [{start: "2025-10-01", end: "2025-10-31", label: "Outubro"}]
- "Some mês 10 com mês 7" → periods: [{...outubro}, {...julho}], query_type: "sum"
- "Compare receitas de ontem e hoje" → periods: [{ontem}, {hoje}], query_type: "compare"

===== JSON SCHEMA =====
{
  "action": "transaction" | "query" | "chat" | "delete",
  
  // Transação
  "amount": number,
  "description": string,
  "category": string (Alimentação, Transporte, Moradia, Saúde, Lazer, Contas, Salário, Outros),
  "subcategory": string,
  "type": "expense" | "income",
  "status": "paid" | "pending",
  "recurrence": "none" | "monthly" | "weekly" | "yearly",
  "is_fixed": boolean,
  "date": string (YYYY-MM-DD),
  
  // Delete
  "tx_code": string,
  
  // Query
  "query_type": "sum" | "list" | "compare" | "analysis",
  "periods": [{start_date: string, end_date: string, label: string}],
  "filter_type": "expense" | "income" | "all",
  "query_context": string,
  
  // Chat
  "message": string
}
`

serve(async (req) => {
    try {
        console.log(`[${new Date().toISOString()}] Request received`)

        if (req.method === 'GET') {
            return new Response(`Grania Bot Active. Config: ${JSON.stringify({
                bot_token: !!TELEGRAM_BOT_TOKEN,
                openrouter: !!OPENROUTER_API_KEY,
                supabase: !!supabase
            })}`)
        }

        if (!TELEGRAM_BOT_TOKEN || !OPENROUTER_API_KEY || !supabase) {
            console.error('Missing Env Vars')
            return new Response('Config Error', { status: 200 })
        }

        const update = await req.json()
        console.log('Webhook:', JSON.stringify(update, null, 2))

        const message = update.message || update.edited_message
        if (!message) return new Response('OK')

        const chatId = message.chat.id
        const telegramId = message.from.id
        const text = message.text || message.caption || ''

        console.log(`Message from ${telegramId}: ${text}`)

        const { data: user, error: userError } = await supabase
            .from('users').select('*').eq('telegram_id', telegramId).maybeSingle()

        if (userError) console.error('Auth Error:', userError)

        // /start command
        if (text === '/start') {
            if (user) {
                await sendTelegramMessage(chatId, `Olá de novo, ${user.full_name?.split(' ')[0]}! 👋\n\nSou a Grania, sua assistente financeira. Como posso ajudar?`)
            } else {
                await sendTelegramContactRequest(chatId, "Olá! Sou a Grania, sua assistente financeira pessoal. 🤖💰\n\nCompartilhe seu contato para começarmos!")
            }
            return new Response('OK')
        }

        // Contact registration
        if (message.contact) {
            if (message.contact.user_id !== telegramId) return new Response('OK')
            const { error } = await supabase.from('users').upsert({
                telegram_id: telegramId,
                phone_number: message.contact.phone_number,
                full_name: [message.from.first_name, message.from.last_name].join(' ').trim()
            }, { onConflict: 'telegram_id' })
            if (error) {
                await sendTelegramMessage(chatId, "❌ Erro ao registrar. Tente novamente.")
            } else {
                await sendTelegramMessage(chatId, "✅ Conta criada com sucesso!\n\nAgora defina uma senha de 6 números para acessar o painel web.")
            }
            return new Response('OK')
        }

        // Gatekeeper
        if (!user) {
            await sendTelegramMessage(chatId, "👋 Olá! Digite /start para se cadastrar na Grania.")
            return new Response('OK')
        }

        // Password setup
        if (!user.password) {
            if (/^\d{6}$/.test(text.trim())) {
                await supabase.from('users').update({ password: text.trim() }).eq('id', user.id)
                await sendTelegramMessage(chatId, "🔐 Senha salva!\n\nAgora você pode me enviar suas transações. Exemplo:\n• \"Gastei 50 no mercado\"\n• \"Recebi 1500 de salário\"")
            } else {
                await sendTelegramMessage(chatId, "⚠️ A senha deve ter exatamente 6 números.")
            }
            return new Response('OK')
        }

        // AI Processing
        const contentForAI = []
        if (text) contentForAI.push({ type: "text", text: text })
        if (message.photo) {
            const fileUrl = await getTelegramFileUrl(message.photo[message.photo.length - 1].file_id)
            contentForAI.push({ type: "image_url", image_url: { url: fileUrl } })
        }
        if (contentForAI.length === 0) return new Response('OK')

        console.log('Calling AI...')
        const ai = await callAI(contentForAI, SYSTEM_PROMPT)
        console.log('AI Result:', JSON.stringify(ai))

        // === CHAT ===
        if (ai.action === 'chat') {
            await sendTelegramMessage(chatId, ai.message || "Olá! Como posso ajudar com suas finanças? 💰")
        }

        // === DELETE ===
        else if (ai.action === 'delete' && ai.tx_code) {
            const { data: tx, error: findErr } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .eq('tx_code', ai.tx_code.toUpperCase())
                .maybeSingle()

            if (findErr || !tx) {
                await sendTelegramMessage(chatId, `❌ Transação ${ai.tx_code} não encontrada.`)
            } else {
                await supabase.from('transactions').delete().eq('id', tx.id)
                await sendTelegramMessage(chatId, `🗑️ Transação ${ai.tx_code} excluída com sucesso!\n\n*${tx.description}* - ${formatCurrency(tx.amount)}`)
            }
        }

        // === TRANSACTION ===
        else if (ai.action === 'transaction') {
            const txCode = generateTxCode()
            const txDate = ai.date || todayISO

            const { error: txError, data: tx } = await supabase.from('transactions').insert({
                user_id: user.id,
                tx_code: txCode,
                amount: ai.amount,
                description: ai.description,
                category: ai.category || 'Outros',
                subcategory: ai.subcategory || '',
                type: ai.type || 'expense',
                status: ai.status || 'paid',
                recurrence: ai.recurrence || 'none',
                is_fixed: ai.is_fixed || false,
                date: txDate
            }).select().single()

            if (txError) {
                console.error('Insert Error:', txError)
                await sendTelegramMessage(chatId, "❌ Erro ao salvar transação.")
            } else {
                const typeEmoji = tx.type === 'income' ? '🟢' : '🔴'
                const typeLabel = tx.type === 'income' ? 'Receita' : 'Despesa'
                const paidEmoji = tx.status === 'paid' ? '✅' : '⏳'
                const paidLabel = tx.status === 'paid' ? 'Sim' : 'Não'
                const fixedEmoji = tx.is_fixed ? '✅' : '❌'
                const recurrenceLabel = tx.recurrence === 'none' ? '' : tx.recurrence === 'monthly' ? 'Mensal' : tx.recurrence === 'weekly' ? 'Semanal' : 'Anual'

                const msg = `*Transação registrada com sucesso!*
${txCode}

📋 *Resumo da transação:*

✏️ *Descrição:* ${tx.description}
💰 *Valor:* ${formatCurrency(tx.amount)}
${typeEmoji} *Tipo:* ${typeLabel}
🏷️ *Categoria:* ${tx.category}
🏷️ *Subcategoria:* ${tx.subcategory || '-'}
🏦 *Conta:* 
📅 *Data:* ${formatDate(tx.date)}
💳 *Pago:* ${paidEmoji}
📌 *Despesa fixa:* ${fixedEmoji}
🔄 *Recorrência:* ${recurrenceLabel || '-'}
💳 *Cartão de crédito:* 

❌ Para excluir diga: "Excluir transação ${txCode}".`

                await sendTelegramMessage(chatId, msg)
            }
        }

        // === QUERY ===
        else if (ai.action === 'query') {
            await sendTelegramMessage(chatId, "🔍 Consultando seus dados...")

            let allTransactions: any[] = []
            const periods = ai.periods || [{ start_date: ai.start_date, end_date: ai.end_date, label: 'Período' }]

            // Fetch data for each period
            for (const period of periods) {
                let query = supabase.from('transactions').select('*').eq('user_id', user.id)
                if (ai.filter_type === 'expense') query = query.eq('type', 'expense')
                if (ai.filter_type === 'income') query = query.eq('type', 'income')
                if (period.start_date) query = query.gte('date', period.start_date)
                if (period.end_date) query = query.lte('date', period.end_date)

                const { data, error } = await query
                if (!error && data) {
                    allTransactions = allTransactions.concat(data.map(t => ({ ...t, period_label: period.label })))
                }
            }

            if (allTransactions.length === 0) {
                await sendTelegramMessage(chatId, "📭 Nenhuma transação encontrada no período solicitado.")
                return new Response('OK')
            }

            // Build context for AI
            const summary = {
                query_type: ai.query_type,
                filter_type: ai.filter_type,
                periods: periods,
                total_transactions: allTransactions.length,
                total_income: allTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                total_expense: allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
                by_period: periods.map(p => ({
                    label: p.label,
                    income: allTransactions.filter(t => t.period_label === p.label && t.type === 'income').reduce((s, t) => s + t.amount, 0),
                    expense: allTransactions.filter(t => t.period_label === p.label && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
                })),
                transactions: allTransactions.slice(0, 30)
            }

            const ANSWER_PROMPT = `
Você é a Grania, analista financeira.
O usuário perguntou: "${text}"

DADOS ENCONTRADOS:
${JSON.stringify(summary, null, 2)}

Responda de forma clara, analítica e amigável.
- Use emojis apropriados
- Formate valores como R$ X,XX
- Se for soma/comparação, destaque os totais
- Se for lista, mostre os itens principais
- Dê insights úteis se possível
`
            const answer = await callAI([], ANSWER_PROMPT, false)
            await sendTelegramMessage(chatId, typeof answer === 'string' ? answer : JSON.stringify(answer))
        }

        return new Response('OK')
    } catch (error) {
        console.error('Edge Function Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
})

async function sendTelegramMessage(chatId: string | number, text: string) {
    if (!chatId) return
    try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
        })
        const data = await res.json()
        if (!data.ok) console.error('Telegram Send Error:', JSON.stringify(data))
    } catch (e) {
        console.error('Telegram Fetch Error:', e)
    }
}

async function sendTelegramContactRequest(chatId: string | number, text: string) {
    if (!chatId) return
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId, text,
            reply_markup: { keyboard: [[{ text: "📱 Compartilhar Contato", request_contact: true }]], one_time_keyboard: true, resize_keyboard: true }
        })
    })
}

async function getTelegramFileUrl(fileId: string): Promise<string> {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`)
    const data = await res.json()
    return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`
}

async function callAI(content: any[], system: string, jsonMode = true) {
    const models = ["google/gemini-2.0-flash-exp:free", "meta-llama/llama-4-maverick", "deepseek/deepseek-chat-v3-0324"]

    for (const model of models) {
        try {
            console.log(`Trying model: ${model}`)
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://grania.app",
                    "X-Title": "Grania"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "system", content: system }, { role: "user", content: content }],
                    response_format: jsonMode ? { type: "json_object" } : undefined
                })
            })
            const data = await res.json()
            if (data.error) throw new Error(JSON.stringify(data.error))
            const contentStr = data.choices[0].message.content
            return jsonMode ? JSON.parse(contentStr) : contentStr
        } catch (e) {
            console.warn(`Model ${model} failed:`, e)
        }
    }
    console.error("All AI models failed!")
    return jsonMode ? { action: "chat", message: "Desculpe, estou com problemas técnicos. Tente novamente em alguns minutos." } : "Erro ao analisar os dados."
}
