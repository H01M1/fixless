import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  || 'https://cbxoowtdyokkgavcicyl.supabase.co';

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieG9vd3RkeW9ra2dhdmNpY3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDA2MDIsImV4cCI6MjA5MzU3NjYwMn0.psAWSigMl-QRo8CzgLj-dgvvgf-j8hP35HDT0DJ6N5I';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') return null;

  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return client;
}