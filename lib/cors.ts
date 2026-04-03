// lib/cors.ts
import { NextRequest, NextResponse } from "next/server";

const PRODUCTION_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.vercel.app";

// Routes that must be open to all origins (called by external cron services)
const PUBLIC_ROUTES = ["/api/ping"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const pathname = req.nextUrl.pathname;

  if (isPublicRoute(pathname)) {
    // Ping endpoint must accept requests from any external cron service
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }

  // All other API routes: restrict to your own domain only
  const allowedOrigin =
    origin === PRODUCTION_ORIGIN || origin === "http://localhost:3000"
      ? origin
      : PRODUCTION_ORIGIN;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

// Handles OPTIONS preflight requests
export function handleCors(req: NextRequest): NextResponse | null {
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(req),
    });
  }
  return null;
}

// Attach CORS headers to any existing response
export function withCors(req: NextRequest, res: NextResponse): NextResponse {
  const headers = getCorsHeaders(req);
  Object.entries(headers).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}