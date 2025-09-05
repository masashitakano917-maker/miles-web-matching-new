// src/api/professionals.ts
import { supabase } from '../lib/supabase';
import type { Professional } from '../types/professional';

export async function listProfessionals(): Promise<Professional[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Professional[];
}

export async function createProfessional(input: Omit<Professional, 'id'>): Promise<Professional> {
  const { data, error } = await supabase
    .from('professionals')
    .insert({
      ...input,
      labels: input.labels ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return data as Professional;
}

export async function upsertProfessionalsBulk(rows: Omit<Professional, 'id'>[]): Promise<number> {
  if (!rows.length) return 0;
  const { data, error, count } = await supabase
    .from('professionals')
    .insert(rows.map(r => ({ ...r, labels: r.labels ?? [] })), { count: 'exact' });
  if (error) throw error;
  return count ?? (data?.length ?? 0);
}

export async function removeProfessional(id: string): Promise<void> {
  const { error } = await supabase.from('professionals').delete().eq('id', id);
  if (error) throw error;
}
