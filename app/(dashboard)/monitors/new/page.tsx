'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewMonitorPage() {
  const [name, setName] = useState('')
  const [intervalMinutes, setIntervalMinutes] = useState(60)
  const [graceMinutes, setGraceMinutes] = useState(5)
  const [alertEmail, setAlertEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCreate() {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('monitors').insert({
      user_id: user.id,
      name,
      interval_minutes: intervalMinutes,
      grace_minutes: graceMinutes,
      alert_email: alertEmail,
      status: 'waiting',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <a href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Back to dashboard
          </a>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create a new monitor</CardTitle>
            <CardDescription>
              We'll alert you if your cron job misses a ping
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="space-y-2">
              <Label htmlFor="name">Monitor Name</Label>
              <Input
                id="name"
                placeholder="e.g. Daily Backup Job"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Expected Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                placeholder="60"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              />
              <p className="text-xs text-gray-500">How often should your cron job run?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grace">Grace Period (minutes)</Label>
              <Input
                id="grace"
                type="number"
                placeholder="5"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
              />
              <p className="text-xs text-gray-500">How long to wait before alerting you?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Alert Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Monitor'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}