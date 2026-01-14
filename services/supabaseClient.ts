
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://asostsuhnpkqejwtuxba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzb3N0c3VobnBrcWVqd3R1eGJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTEwMjcsImV4cCI6MjA4MzcyNzAyN30.lgAXU46cBIWnyslqmbkPeUDMsS12wyQKVBWZwvYRQmQ';

// Create a single supabase client for entire app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'x-application-name': 'vidyasetu-ai' },
  },
});

// Diagnostic helper
export const checkSupabaseConnection = async () => {
    try {
        const { data, error } = await supabase.from('admins').select('count', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        return false;
    }
};
