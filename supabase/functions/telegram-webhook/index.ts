import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const SYSTEM_PROMPT = `
Você é o assistente financeiro do GranaZen.
Analise a mensagem do usuário (texto ou imagem de nota fiscal/comprovante) e extraia os dados da transação em JSON.
Se for conversa fiada ou não for transação, retorne type: "chat" e uma resposta amigável em "message".
JSON Schema:
{
  "amount": number,
  "description": string (curta),
  "category": string (Ex: Alimentação, Transporte, Moradia, Saúde, Lazer, Salário, Outros),
  "subcategory": string (Ex: McDonald's, Uber, Aluguel, Academia),
  "type": "expense" | "income" | "chat",
  "is_fixed": boolean (se parece conta recorrente),
  "date": string (ISO 8601),
  "message": string (mensagem de resposta para chat ou vazio se for transação)
}
Data de hoje: ${new Date().toISOString().split('T')[0]}
`

serve(async (req) => {
  try {
    const url = new URL(req.url)
    if (req.method === 'GET') {
      return new Response('GranaZen Bot is active')
    }

    const update = await req.json()
    console.log('Webhook received:', JSON.stringify(update, null, 2))
    
    const message = update.message || update.edited_message
    if (!message) return new Response('OK')

    const chatId = message.chat.id
    const telegramId = message.from.id
    const text = message.text || message.caption || ''
    
    // 1. Check for /start
    if (text === '/start') {
        await sendTelegramContactRequest(chatId, 
            "Olá! Sou seu gestor financeiro GranaZen. 🤖💸\n\n" +
            "Eu organizo suas finanças automaticamente. Apenas me diga 'Gastei 50 no almoço' ou mande uma foto da nota.\n\n" +
            "Para começar e garantir sua privacidade, clique abaixo para compartilhar seu contato."
        )
        return new Response('OK')
    }

    // 2. Check for Contact submission
    if (message.contact) {
        if (message.contact.user_id !== telegramId) {
            await sendTelegramMessage(chatId, "⚠️ Por favor, envie seu próprio contato.")
            return new Response('OK')
        }
        
        const { error } = await supabase.from('users').upsert({
            telegram_id: telegramId,
            phone_number: message.contact.phone_number,
            full_name: message.from.first_name + ' ' + (message.from.last_name || '')
        }, { onConflict: 'telegram_id' })

        if (error) {
            console.error('Error creating user:', error)
            await sendTelegramMessage(chatId, "Erro ao criar usuário.")
        } else {
            await sendTelegramMessage(chatId, 
                `Obrigado, ${message.from.first_name}! 🔒\n` +
                "Agora, defina uma **senha numérica de 6 dígitos** para acessar seu Painel Web (Dashboard).\n\n" +
                "Digite apenas a senha (Ex: 123456)."
            )
        }
        return new Response('OK')
    }

    // 3. Get User State
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single()

    if (!user) {
        await sendTelegramMessage(chatId, "👋 Olá! Para usar o bot, use o comando /start e se cadastre.")
        return new Response('OK') 
    }

    // 4. Password Setup Flow
    if (!user.password) {
        const cleanPassword = text.trim()
        if (/^\d{6}$/.test(cleanPassword)) {
             const { error: pwdError } = await supabase
                .from('users')
                .update({ password: cleanPassword })
                .eq('id', user.id)
            
            if (pwdError) {
                 await sendTelegramMessage(chatId, "Erro ao salvar senha.")
            } else {
                 await sendTelegramMessage(chatId, "Conta configurada! 🚀\n\nPode começar. Tente enviar: 'Gastei 100 reais em gasolina'.")
            }
        } else {
            await sendTelegramMessage(chatId, "⚠️ A senha deve ter exatamente 6 DÍGITOS numéricos.\nTente novamente.")
        }
        return new Response('OK')
    }

    // 5. Transaction Processing (Authenticated)
    const contentForAI = []
    if (text) {
       contentForAI.push({ type: "text", text: text })
    }
    
    // Handle Photos
    if (message.photo) {
        const photoId = message.photo[message.photo.length - 1].file_id
        const fileUrl = await getTelegramFileUrl(photoId)
        contentForAI.push({ type: "image_url", image_url: { url: fileUrl }})
    }
    
    if (contentForAI.length === 0) {
        await sendTelegramMessage(chatId, "Por favor, envie texto ou foto do seu gasto.")
        return new Response('OK')
    }

    // Call AI
    console.log('Calling AI with content:', JSON.stringify(contentForAI))
    const result = await callAI(contentForAI)
    console.log('AI Result:', JSON.stringify(result))

    if (result.type === 'chat') {
        await sendTelegramMessage(chatId, result.message)
    } else {
        // Save Transaction
        const { error: txError, data: tx } = await supabase.from('transactions').insert({
            user_id: user.id,
            amount: result.amount,
            description: result.description,
            category: result.category,
            subcategory: result.subcategory,
            type: result.type,
            is_fixed: result.is_fixed,
            date: result.date || new Date().toISOString()
        }).select().single()

        if (txError) {
            console.error('DB Insert Error:', txError)
            await sendTelegramMessage(chatId, "❌ Erro ao salvar transação.")
        } else {
            console.log('Transaction saved successfully:', tx)
            // Reply with formatted message
            const reply = `Transação registrada! ✅\n${tx.type === 'income' ? '💰 Receita' : '💸 Despesa'}: R$ ${tx.amount}\n🏷️ ${tx.category} > ${tx.subcategory || 'Geral'}\n📝 ${tx.description}\n📅 ${new Date(tx.date).toLocaleDateString('pt-BR')}\n\n_Para excluir: "Excluir transação ${tx.id.slice(0, 5).toUpperCase()}"_`
            await sendTelegramMessage(chatId, reply)
        }
    }

  } catch (error) {
    console.error(error)
  }

  return new Response('OK')
})

// --- Helpers ---

async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  })
}

async function sendTelegramContactRequest(chatId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId, 
        text,
        reply_markup: {
            keyboard: [[{ text: "📱 Enviar meu Contato", request_contact: true }]],
            one_time_keyboard: true,
            resize_keyboard: true
        }
      })
    })
  }

async function getTelegramFileUrl(fileId: string): Promise<string> {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`)
    const data = await res.json()
    return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`
}

async function callAI(content: any[]) {
    // 1. Tentar Gemini 2.0 Flash (Gratuito e Rápido)
    try {
        console.log("Tentando Gemini 2.0 Flash...")
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: content } 
                ],
                response_format: { type: "json_object" }
            })
        })
        const json = await res.json()
        if (json.error || !json.choices) {
             throw new Error("Gemini Error: " + JSON.stringify(json))
        }
        return JSON.parse(json.choices[0].message.content)
    } catch (err) {
        console.warn("⚠️ Falha no Gemini. Ativando Fallback para Llama 4...", err)
        
        // 2. Fallback: Meta Llama 4 Maverick
        const resFallback = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-maverick", // Fallback Model
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: content } 
                ],
                response_format: { type: "json_object" }
            })
        })
        const jsonFallback = await resFallback.json()
        
        if (!jsonFallback.choices) {
            console.error("❌ Erro Crítico: Ambos modelos falharam.", jsonFallback)
            throw new Error("AI Falhou em todas as tentativas.")
        }

        console.log("✅ Recuperado com sucesso via Llama 4.")
        return JSON.parse(jsonFallback.choices[0].message.content)
    }
}
