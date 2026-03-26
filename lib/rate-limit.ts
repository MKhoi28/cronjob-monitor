// Simple in-memory rate limiter
// Uses a sliding window algorithm per IP
// No external dependencies needed

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store — resets on server restart
// For production scale, replace with Upstash Redis
const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  // Max requests allowed in the window
  limit: number
  // Window size in milliseconds
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  const entry = store.get(key)

  // If no entry or window has expired, create fresh entry
  if (!entry || now > entry.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return {
      success: true,
      remaining: options.limit - 1,
      resetAt: now + options.windowMs,
    }
  }

  // Window still active
  if (entry.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  // Increment count
  entry.count++
  store.set(key, entry)

  return {
    success: true,
    remaining: options.limit - entry.count,
    resetAt: entry.resetAt,
  }
}

// Helper to get real IP from request headers
export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs — take the first
    return forwarded.split(',')[0].trim()
  }

  if (realIP) return realIP

  // Fallback
  return 'unknown'
}