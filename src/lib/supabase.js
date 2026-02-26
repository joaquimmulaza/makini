import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url-do-supabase-aqui.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anon-aqui'

// Fix: bypass the navigator.locks API to prevent NavigatorLockAcquireTimeoutError.
// This error occurs when multiple tabs or rapid auth operations compete for the same lock.
// The passthrough function allows auth operations to proceed without lock contention.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        lock: async (_name, _acquireTimeout, fn) => {
            return await fn();
        },
    },
})
