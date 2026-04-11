'use client'

import { useEffect, useRef } from 'react'

interface Props {
  accent: string
  onComplete: () => void
}

export default function OnboardingTour({ accent, onComplete }: Props) {
  const driverRef = useRef<any>(null)

  useEffect(() => {
    import('driver.js').then(({ driver }) => {
      if (!document.getElementById('driver-js-css')) {
        const link = document.createElement('link')
        link.id   = 'driver-js-css'
        link.rel  = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.5/dist/driver.css'
        document.head.appendChild(link)
      }

      // Always re-inject so accent color stays in sync; remove stale version first
      const prev = document.getElementById('driver-cw-theme')
      if (prev) prev.remove()

      const style = document.createElement('style')
      style.id = 'driver-cw-theme'
      // No font-family overrides — inherit from the page to avoid flash/glitch
      style.textContent = `
        .driver-popover {
          background: rgba(0, 0, 0, 0.92) !important;
          border: 1px solid ${accent}55 !important;
          border-radius: 14px !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 0 60px ${accent}18, 0 24px 60px rgba(0,0,0,0.8) !important;
          color: rgba(255,255,255,0.85) !important;
          max-width: 320px !important;
        }
        .driver-popover-title {
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.15em !important;
          color: ${accent} !important;
          text-transform: uppercase !important;
          margin-bottom: 8px !important;
        }
        .driver-popover-description {
          font-size: 0.83rem !important;
          color: rgba(255,255,255,0.6) !important;
          line-height: 1.75 !important;
        }
        .driver-popover-progress-text {
          font-size: 0.65rem !important;
          color: ${accent}66 !important;
          letter-spacing: 0.08em !important;
        }
        .driver-popover-footer-buttons {
          gap: 6px !important;
        }
        .driver-popover-prev-btn,
        .driver-popover-next-btn,
        .driver-popover-close-btn {
          font-size: 0.7rem !important;
          border-radius: 8px !important;
          border: 1px solid ${accent}44 !important;
          background: ${accent}15 !important;
          color: ${accent} !important;
          padding: 6px 12px !important;
          cursor: pointer !important;
          transition: all 160ms ease !important;
          text-shadow: none !important;
        }
        .driver-popover-next-btn {
          background: ${accent} !important;
          color: #000 !important;
          border-color: ${accent} !important;
          font-weight: 700 !important;
        }
        .driver-popover-prev-btn:hover { background: ${accent}30 !important; }
        .driver-popover-next-btn:hover { filter: brightness(1.1) !important; }
        .driver-popover-close-btn {
          border: none !important;
          background: transparent !important;
          color: rgba(255,255,255,0.3) !important;
          font-size: 1rem !important;
          padding: 2px 6px !important;
        }
        .driver-popover-close-btn:hover {
          color: rgba(255,255,255,0.8) !important;
          background: transparent !important;
        }
        .driver-popover-arrow-side-left.driver-popover-arrow   { border-right-color:  ${accent}55 !important; }
        .driver-popover-arrow-side-right.driver-popover-arrow  { border-left-color:   ${accent}55 !important; }
        .driver-popover-arrow-side-top.driver-popover-arrow    { border-bottom-color: ${accent}55 !important; }
        .driver-popover-arrow-side-bottom.driver-popover-arrow { border-top-color:    ${accent}55 !important; }
        #driver-highlighted-element-stage {
          background: transparent !important;
          outline: 2px solid ${accent}88 !important;
          outline-offset: 4px !important;
          border-radius: 12px !important;
          box-shadow: 0 0 0 4000px rgba(0,0,0,0.65) !important;
        }
      `
      document.head.appendChild(style)

      const driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        progressText: '{{current}} of {{total}}',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Done ✓',
        onDestroyStarted: () => {
          driverObj.destroy()
          onComplete()
        },
        steps: [
          {
            element: '#tour-metrics',
            popover: {
              title: '01 · Your Metrics',
              description:
                'At a glance — how many monitors are running, passing, and failing. Updates live as your cron jobs ping in.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-recent-pings',
            popover: {
              title: '02 · Recent Pings',
              description:
                'Every ping your cron jobs send shows up here. Green means healthy, red means the job missed its window.',
              side: 'top',
              align: 'start',
            },
          },
          {
            element: '#tour-nav-monitors',
            popover: {
              title: '03 · All Monitors',
              description:
                'Manage, edit, or analyze any monitor here. Each one gets a unique ping URL — just curl it at the end of your script.',
              side: 'right',
              align: 'center',
            },
          },
          {
            element: '#tour-nav-account',
            popover: {
              title: '04 · Account & Checklist',
              description:
                "Your getting-started checklist lives here. Once you create a monitor and make your first ping, you're fully set up.",
              side: 'right',
              align: 'center',
            },
          },
        ],
      })

      driverRef.current = driverObj
      setTimeout(() => driverObj.drive(), 150)
    })

    return () => {
      driverRef.current?.destroy()
    }
  }, [accent, onComplete])

  return null
}