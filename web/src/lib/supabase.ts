import { createClient } from '@supabase/supabase-js'

// Vite uses import.meta.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Vite Env Vars:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    all: import.meta.env
})

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URLs missing. Check your .env file and ensure they start with VITE_")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        headers: {
            'Bypass-Tunnel-Reminder': 'true'
        }
    }
})
