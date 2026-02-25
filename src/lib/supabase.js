import { createClient } from '@supabase/supabase-js'

// Para que esta aplicação funcione de forma completa, substitua pelas suas credenciais reais do Supabase.
// Pode encontrar isto nas definições do seu Projecto Supabase em API > Project URL e API > Project API Keys (anon public)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url-do-supabase-aqui.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anon-aqui'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
