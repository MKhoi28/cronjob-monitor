import { z } from 'zod'

// ---- Auth ----
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long') // RFC 5321 max
    .email('Invalid email format')
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
})

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .email('Invalid email format')
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

// ---- Webhook URL (SSRF-safe) ----
const BLOCKED_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0', '::1']
const BLOCKED_PREFIXES  = ['10.', '192.168.', '172.16.', '172.17.', '169.254.']

const webhookUrlSchema = z
  .string()
  .max(500, 'URL too long')
  .url('Invalid URL format')
  .refine(val => {
    try {
      const url = new URL(val)
      // HTTPS only — no http, ftp, file, etc.
      if (url.protocol !== 'https:') return false
      // Block private / loopback / link-local ranges (SSRF prevention)
      if (BLOCKED_HOSTNAMES.includes(url.hostname)) return false
      if (BLOCKED_PREFIXES.some(p => url.hostname.startsWith(p))) return false
      return true
    } catch { return false }
  }, 'Webhook must be a valid public HTTPS URL')
  .optional()

// ---- Monitor ----
export const createMonitorSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim()
    // Reject HTML/script injection
    .refine((val) => !/<[^>]*>/g.test(val), 'Invalid characters in name'),

  interval_minutes: z
    .number()
    .int('Must be a whole number')
    .min(1, 'Minimum interval is 1 minute')
    .max(10080, 'Maximum interval is 7 days'), // 7 * 24 * 60

  grace_minutes: z
    .number()
    .int('Must be a whole number')
    .min(1, 'Minimum grace period is 1 minute')
    .max(60, 'Maximum grace period is 60 minutes'),

  alert_email: z
    .string()
    .min(1, 'Alert email is required')
    .max(254, 'Email too long')
    .email('Invalid email format')
    .trim()
    .toLowerCase(),

  webhook_url: webhookUrlSchema,
})

// ---- Ping ID ----
export const pingIdSchema = z.object({
  id: z
    .string()
    .uuid('Invalid monitor ID format'), // Must be a valid UUID
})