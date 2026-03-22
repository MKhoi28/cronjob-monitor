'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    const res = await fetch('/api/stripe', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleUpgrade} disabled={loading}>
      {loading ? 'Redirecting...' : '⚡ Upgrade to Pro'}
    </Button>
  )
}