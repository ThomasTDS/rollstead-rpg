import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// The publishable key is public by design: row level security protects the data.
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)
