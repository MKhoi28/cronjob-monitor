'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markWelcomeSeen(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .upsert({ id: user.id, has_seen_welcome: true }, { onConflict: 'id' })
    .eq('id', user.id)

  revalidatePath('/dashboard')
}