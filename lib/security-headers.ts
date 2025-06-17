import type { NextResponse } from "next/server"

export class SecurityHeaders {
  static apply(response: NextResponse) {
    // Content Security Policy
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://www.googleapis.com https://accounts.google.com",
        "frame-src 'self' https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ].join("; "),
    )

    // X-Frame-Options (クリックジャッキング対策)
    response.headers.set("X-Frame-Options", "DENY")

    // X-Content-Type-Options (MIME スニッフィング対策)
    response.headers.set("X-Content-Type-Options", "nosniff")

    // X-XSS-Protection
    response.headers.set("X-XSS-Protection", "1; mode=block")

    // Referrer Policy
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

    // Strict Transport Security (HTTPS強制)
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

    // Permissions Policy
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")

    // Cross-Origin-Embedder-Policy
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp")

    // Cross-Origin-Opener-Policy
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin")

    // Cross-Origin-Resource-Policy
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin")
  }
}
