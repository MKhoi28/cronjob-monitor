"use client"

import * as React from "react"
import { BadgeCheck, ArrowRight, Loader2, Zap, TrendingDown } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface PricingTier {
  name: string
  price: Record<string, number | string>
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  popular?: boolean
}

interface PricingCardProps {
  tier: PricingTier
  paymentFrequency: string
  onCtaClick?: () => void | Promise<void>
}

// Monthly price for savings calculation
const MONTHLY_PRICE = 14.99

function getSavings(yearlyPrice: number): { perMonth: number; perYear: number } {
  const monthlyEquiv = yearlyPrice / 12
  return {
    perMonth: parseFloat((MONTHLY_PRICE - monthlyEquiv).toFixed(2)),
    perYear:  parseFloat((MONTHLY_PRICE * 12 - yearlyPrice).toFixed(2)),
  }
}

export function PricingCard({ tier, paymentFrequency, onCtaClick }: PricingCardProps) {
  const [loading, setLoading]   = React.useState(false)
  const price                    = tier.price[paymentFrequency]
  const isHighlighted            = tier.highlighted
  const isPopular                = tier.popular
  const isYearly                 = paymentFrequency === "yearly"
  const savings                  = (isHighlighted && isYearly && typeof price === "number")
                                     ? getSavings(price)
                                     : null

  async function handleClick() {
    if (!onCtaClick) return
    setLoading(true)
    try { await onCtaClick() } finally { setLoading(false) }
  }

  return (
    <div className={cn(
      "relative flex flex-col gap-6 rounded-2xl p-px overflow-hidden",
      "transition-transform duration-300 hover:-translate-y-1",
      isHighlighted
        ? "pricing-card-highlighted"
        : "pricing-card-base"
    )}>
      {/* Animated border gradient for highlighted card */}
      {isHighlighted && <AnimatedBorder />}

      <div className={cn(
        "relative z-10 flex flex-col gap-6 rounded-2xl p-7 h-full",
        isHighlighted
          ? "bg-[#0d0d0d]"
          : "bg-[#101010]"
      )}>
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Radial glow for highlighted */}
        {isHighlighted && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,160,80,0.12) 0%, transparent 70%)",
            }}
          />
        )}

        {/* Header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isHighlighted && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full"
                style={{ background: "rgba(200,160,80,0.15)", border: "1px solid rgba(200,160,80,0.3)" }}>
                <Zap className="w-3 h-3" style={{ color: "#c8a050" }} />
              </div>
            )}
            <span className={cn(
              "font-mono text-sm font-bold tracking-widest uppercase",
              isHighlighted ? "text-[#c8a050]" : "text-white/50"
            )}>
              {tier.name}
            </span>
          </div>
          {isPopular && (
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{
                background:  "rgba(200,160,80,0.12)",
                border:      "1px solid rgba(200,160,80,0.35)",
                color:       "#c8a050",
              }}>
              🔥 Popular
            </span>
          )}
        </div>

        {/* Price */}
        <div className="relative">
          {typeof price === "number" ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-2">
                <NumberFlow
                  format={{
                    style: "currency",
                    currency: "USD",
                    trailingZeroDisplay: "stripIfInteger",
                    minimumFractionDigits: 2,
                  }}
                  value={price}
                  className={cn(
                    "text-5xl font-bold tracking-tight",
                    isHighlighted ? "text-white" : "text-white/90"
                  )}
                />
              </div>
              <p className="font-mono text-xs text-white/30">
                {isYearly ? "per year" : "per month"}
              </p>

              {/* Savings badge — only visible on yearly */}
              {savings && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(80,200,120,0.1)",
                      border:     "1px solid rgba(80,200,120,0.25)",
                    }}>
                    <TrendingDown className="w-3 h-3" style={{ color: "#50c878" }} />
                    <span className="font-mono text-[11px] font-bold" style={{ color: "#50c878" }}>
                      Save ${savings.perYear}/yr · ${savings.perMonth}/mo cheaper
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h1 className="text-5xl font-bold tracking-tight text-white/90">{price}</h1>
              <p className="font-mono text-xs text-white/30">forever free</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={cn(
          "h-px w-full",
          isHighlighted
            ? "bg-gradient-to-r from-transparent via-[#c8a050]/30 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/10 to-transparent"
        )} />

        {/* Description + Features */}
        <div className="flex-1 flex flex-col gap-4">
          <p className={cn(
            "text-sm leading-relaxed",
            isHighlighted ? "text-white/60" : "text-white/40"
          )}>
            {tier.description}
          </p>

          <ul className="space-y-2.5">
            {tier.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div className={cn(
                  "flex items-center justify-center w-4 h-4 rounded-full shrink-0",
                  isHighlighted
                    ? "bg-[rgba(200,160,80,0.15)]"
                    : "bg-white/5"
                )}>
                  <BadgeCheck className={cn(
                    "h-2.5 w-2.5",
                    isHighlighted ? "text-[#c8a050]" : "text-white/40"
                  )} />
                </div>
                <span className={cn(
                  "text-sm font-mono",
                  isHighlighted ? "text-white/80" : "text-white/50"
                )}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={onCtaClick ? handleClick : undefined}
          disabled={loading}
          className={cn(
            "relative w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5",
            "font-mono text-sm font-semibold tracking-wide",
            "transition-all duration-200",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            isHighlighted
              ? [
                  "text-[#0d0d0d]",
                  "hover:brightness-110 active:scale-[0.98]",
                ]
              : [
                  "text-white/70 border border-white/10 bg-white/5",
                  "hover:bg-white/10 hover:text-white active:scale-[0.98]",
                ]
          )}
          style={isHighlighted ? {
            background: "linear-gradient(135deg, #c8a050 0%, #e8c070 50%, #c8a050 100%)",
            boxShadow:  "0 0 20px rgba(200,160,80,0.25), 0 2px 8px rgba(0,0,0,0.5)",
          } : undefined}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</>
          ) : (
            <>{tier.cta} <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  )
}

/* Rotating conic-gradient border for the Pro card */
function AnimatedBorder() {
  return (
    <>
      <style>{`
        @keyframes spin-border {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .pricing-spin {
          animation: spin-border 4s linear infinite;
        }
      `}</style>
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div
          className="pricing-spin absolute"
          style={{
            width:      "200%",
            height:     "200%",
            top:        "-50%",
            left:       "-50%",
            background: "conic-gradient(from 0deg, transparent 0deg, #c8a050 60deg, transparent 120deg, transparent 360deg)",
            opacity:    0.6,
          }}
        />
      </div>
      {/* Inner mask to cut out center */}
      <div className="absolute inset-[1px] rounded-2xl bg-[#0d0d0d] pointer-events-none z-[1]" />
    </>
  )
}