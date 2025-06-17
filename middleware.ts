import { type NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { SecurityHeaders } from "@/lib/security-headers"

// レート制限の設定
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15分
  maxRequests: 100, // 最大100リクエスト
  skipSuccessfulRequests: false,
})

const apiRateLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1分
  maxRequests: 20, // API呼び出しは1分間に20回まで（増加）
  skipSuccessfulRequests: false,
})

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // セキュリティヘッダーの設定
  SecurityHeaders.apply(response)

  // IP アドレスの取得
  const ip = getClientIP(request)

  // ブロックリストのチェック
  if (await isBlocked(ip)) {
    return new NextResponse("Access Denied", { status: 403 })
  }

  // API エンドポイントのレート制限（Google Calendar APIは除外）
  if (request.nextUrl.pathname.startsWith("/api/") && !request.nextUrl.pathname.startsWith("/api/google-calendar/")) {
    const rateLimitResult = await apiRateLimiter.check(ip)
    if (!rateLimitResult.success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      })
    }
  }

  // Google Calendar APIは緩いレート制限
  if (request.nextUrl.pathname.startsWith("/api/google-calendar/")) {
    const rateLimitResult = await rateLimiter.check(ip)
    if (!rateLimitResult.success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateLimitResult.resetTime / 1000).toString(),
        },
      })
    }
  }

  // CSRF トークンの検証（POST, PUT, DELETE リクエスト）
  // Google Calendar auth APIは除外（設定取得のため）
  if (
    ["POST", "PUT", "DELETE"].includes(request.method) &&
    !request.nextUrl.pathname.includes("/api/google-calendar/auth")
  ) {
    const csrfToken = request.headers.get("x-csrf-token")
    const sessionToken = request.cookies.get("session-token")?.value

    // CSRFトークンの検証を緩和（開発中）
    if (csrfToken && sessionToken) {
      // トークンがある場合のみ検証
      if (!(await validateCSRFToken(csrfToken, sessionToken))) {
        return new NextResponse("CSRF Token Invalid", { status: 403 })
      }
    }
  }

  return response
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return request.ip || "unknown"
}

async function isBlocked(ip: string): Promise<boolean> {
  // ブロックリストのチェック（実際の実装では Redis や データベースを使用）
  const blockedIPs = new Set([
    // 既知の悪意のあるIP
  ])

  return blockedIPs.has(ip)
}

async function validateCSRFToken(token: string, sessionToken: string): Promise<boolean> {
  // CSRF トークンの検証ロジック（簡易版）
  return token.length > 0 && sessionToken.length > 0
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
