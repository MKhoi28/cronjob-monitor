"use server";

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDisplayName(name: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: name.trim() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/accounts')
  return { success: true }
}

export async function generateApiKey(): Promise<{ key?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Generate a prefixed random key: cw_live_<32 hex chars>
  const raw   = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const key   = `cw_live_${raw.substring(0, 32)}`

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, api_key: key })

  if (error) return { error: error.message }
  revalidatePath('/accounts')  
  return { key }
}

export async function revokeApiKey(): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ api_key: null })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/accounts')
  return { success: true }
}