'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/upgrade', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <Button variant="outline" onClick={handleUpgrade} disabled={loading}>
        {loading ? 'Redirecting...' : '⚡ Upgrade to Pro'}
      </Button>
      {error && (
        <p className="mt-1 text-xs text-red-400 font-mono">✗ {error}</p>
      )}
    </div>
  )
}