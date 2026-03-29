'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/**
 * Self-contained sign-out button.
 * Calls supabase.auth.signOut() directly on the client —
 * no route handler required, nothing to 404.
 *
 * Usage:
 *   <SignOutButton className="..." />
 *   <SignOutButton style={{ color: accent }}>Sign out</SignOutButton>
 */
export default function SignOutButton({
  className,
  style,
  children = 'Sign Out',
}: Props) {
  const router   = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button type="button" onClick={handleSignOut} className={className} style={style}>
      {children}
    </button>
  )
}