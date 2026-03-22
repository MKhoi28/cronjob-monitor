import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import UpgradeButton from '@/components/UpgradeButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()          

  if (!user) redirect('/login')

  const { data: monitors } = await supabase
    .from('monitors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statusColor = (status: string) => {
    if (status === 'healthy') return 'bg-green-100 text-green-800'
    if (status === 'down') return 'bg-red-100 text-red-800'
    if (status === 'late') return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor your cron jobs in real time</p>
          </div>
          <div className="flex gap-3">
            <UpgradeButton />
            <a href="/monitors/new">
                <Button>+ New Monitor</Button>
            </a>
            </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Monitors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{monitors?.length ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Healthy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {monitors?.filter(m => m.status === 'healthy').length ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Down</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {monitors?.filter(m => m.status === 'down').length ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monitors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Monitors</CardTitle>
          </CardHeader>
          <CardContent>
            {!monitors || monitors.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No monitors yet</p>
                <p className="text-sm mt-1">Create your first monitor to get started</p>
                <a href="/monitors/new">
                  <Button className="mt-4">+ New Monitor</Button>
                </a>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead>Last Ping</TableHead>
                    <TableHead>Ping URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitors.map((monitor) => (
                    <TableRow key={monitor.id}>
                      <TableCell className="font-medium">{monitor.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(monitor.status)}`}>
                          {monitor.status}
                        </span>
                      </TableCell>
                      <TableCell>Every {monitor.interval_minutes} min</TableCell>
                      <TableCell>
                        {monitor.last_ping_at
                          ? new Date(monitor.last_ping_at).toLocaleString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          /api/ping/{monitor.id}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}