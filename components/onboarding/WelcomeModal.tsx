'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WelcomeModal() {
  const [show, setShow] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const seen = localStorage.getItem('cw-welcome-seen')
    if (!seen) setShow(true)
  }, [])

  function dismiss() {
    localStorage.setItem('cw-welcome-seen', 'true')
    setShow(false)
  }

  function getStarted() {
    dismiss()
    router.push('/monitors/new')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-8 space-y-6">

        {/* Header */}
        <div>
          <p className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-2">
            Welcome to CronWatch
          </p>
          <h2 className="text-2xl font-bold text-white">
            You're 60 seconds away from monitored cron jobs
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {[
            { step: '01', title: 'Create a monitor', desc: 'Name your job and set how often it runs' },
            { step: '02', title: 'Add one line to your script', desc: 'curl your ping URL at the end of your job' },
            { step: '03', title: 'Get alerted if it fails', desc: 'Email alerts + AI analysis when something goes wrong' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <span className="text-orange-500 font-mono text-sm font-bold mt-0.5">{step}</span>
              <div>
                <p className="text-white font-medium text-sm">{title}</p>
                <p className="text-zinc-400 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={getStarted}
            className="flex-1 bg-orange-500 hover:bg-orange-400 text-black font-bold font-mono text-sm px-4 py-3 rounded-md transition-colors"
          >
            Create my first monitor →
          </button>
          <button
            onClick={dismiss}
            className="px-4 py-3 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            Skip
          </button>
        </div>

      </div>
    </div>
  )
}