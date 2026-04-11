'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { markWelcomeSeen } from '@/app/(dashboard)/dashboard/welcome-action'

interface Props {
  show: boolean
  onStartTour?: () => void
}

export default function WelcomeModal({ show: initialShow, onStartTour }: Props) {
  const [show, setShow] = useState(initialShow)
  const router = useRouter()

  // Immediately guard with localStorage so re-renders never re-show the modal.
  // Also call the server action to persist to DB.
  useEffect(() => {
    if (!initialShow) return
    // Client-side guard — instant, survives navigation within the same session
    localStorage.setItem('cw-welcome-seen', '1')
    // Server-side persist — updates DB + revalidates the dashboard route
    markWelcomeSeen()
  }, [initialShow])

  function dismiss() { setShow(false) }

  function getStarted() {
    setShow(false)
    router.push('/monitors/new')
  }

  function handleTour() {
    setShow(false)
    onStartTour?.()
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-8 space-y-6 shadow-2xl">

        <div>
          <p className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-2">
            Welcome to CronWatch
          </p>
          <h2 className="text-2xl font-bold text-white leading-tight">
            You're 60 seconds away from monitored cron jobs
          </h2>
        </div>

        <div className="space-y-4">
          {[
            { step: '01', title: 'Create a monitor',           desc: 'Name your job and set how often it runs'               },
            { step: '02', title: 'Add one line to your script', desc: 'curl your ping URL at the end of your job'             },
            { step: '03', title: 'Get alerted if it fails',    desc: 'Email alerts + AI analysis when something goes wrong'  },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <span className="text-orange-500 font-mono text-sm font-bold mt-0.5 shrink-0">{step}</span>
              <div>
                <p className="text-white font-medium text-sm">{title}</p>
                <p className="text-zinc-400 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={getStarted}
            className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold font-mono text-sm px-4 py-3 rounded-md transition-colors"
          >
            Create my first monitor →
          </button>
          <button
            onClick={handleTour}
            className="w-full border border-zinc-700 hover:border-orange-500/50 hover:bg-orange-500/5 text-zinc-300 hover:text-white font-mono text-sm px-4 py-2.5 rounded-md transition-all"
          >
            🗺 Take a quick tour first
          </button>
          <button
            onClick={dismiss}
            className="text-zinc-500 hover:text-zinc-400 text-sm transition-colors py-1"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}