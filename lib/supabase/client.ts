import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') return null;

  if (!client) {
    client = createBrowserClient(
      'https://cbxoowtdyokkgavcicyl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieG9vd3RkeW9ra2dhdmNpY3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDA2MDIsImV4cCI6MjA5MzU3NjYwMn0.psAWSigMl-QRo8CzgLj-dgvvgf-j8hP35HDT0DJ6N5I',
    );
  }

  return client;
}