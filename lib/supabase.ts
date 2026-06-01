import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('http') ? url : 'https://placeholder.supabase.co';
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return key.includes('your_') || !key ? 'placeholder-anon-key' : key;
}

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return key.includes('your_') || !key ? 'placeholder-service-role-key' : key;
}

export const supabase = createClient(getSupabaseUrl(), getAnonKey());

export const supabaseAdmin = createClient(getSupabaseUrl(), getServiceRoleKey());

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return url.startsWith('http') && !anonKey.includes('your_') && !serviceKey.includes('your_');
}
