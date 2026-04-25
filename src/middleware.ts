import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // per 1 minute

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Check if user has a valid session cookie (works with database sessions)
function getSessionToken(req: NextRequest): string | null {
  // Next-auth uses different cookie names depending on environment
  const secureCookie = req.cookies.get("__Secure-next-auth.session-token")?.value;
  const normalCookie = req.cookies.get("next-auth.session-token")?.value;
  return secureCookie || normalCookie || null;
}

// Security headers applied to all responses
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://oaidalleapiprodscus.blob.core.windows.net https://*.googleusercontent.com",
      "font-src 'self'",
      "connect-src 'self' https://api.openai.com https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Clean up rate limit map occasionally
  if (Math.random() < 0.01) cleanupRateLimitMap();

  // === Protect expensive API routes ===
  const protectedRoutes = ["/api/analyze", "/api/generate-visuals"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const sessionToken = getSessionToken(req);

    if (!sessionToken) {
      const response = NextResponse.json(
        { error: "You must be signed in to use this feature." },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    // Rate limiting by session token
    const rateLimitKey = `api:${sessionToken.slice(0, 16)}`;
    if (isRateLimited(rateLimitKey)) {
      const response = NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // === Block CORS for API routes ===
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth") && !pathname.startsWith("/api/stripe/webhook")) {
    const origin = req.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXTAUTH_URL,
      "https://katadeals.com",
      "https://www.katadeals.com",
      "http://localhost:3000",
    ].filter(Boolean);

    if (origin && !allowedOrigins.includes(origin)) {
      const response = NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }
  }

  // === Protect dashboard pages ===
  if (pathname.startsWith("/dashboard")) {
    const sessionToken = getSessionToken(req);
    if (!sessionToken) {
      const signInUrl = new URL("/api/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/api/analyze/:path*",
    "/api/generate-visuals/:path*",
    "/api/stripe/checkout/:path*",
    "/dashboard/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};