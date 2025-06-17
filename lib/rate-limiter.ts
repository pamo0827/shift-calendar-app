interface RateLimiterOptions {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests: boolean
}

interface RateLimitResult {
  success: boolean
  resetTime: number
  remaining: number
}

export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private options: RateLimiterOptions

  constructor(options: RateLimiterOptions) {
    this.options = options

    // 定期的にクリーンアップ
    setInterval(() => {
      this.cleanup()
    }, this.options.windowMs)
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.options.windowMs

    let record = this.requests.get(identifier)

    if (!record || record.resetTime <= now) {
      record = {
        count: 0,
        resetTime: now + this.options.windowMs,
      }
    }

    record.count++
    this.requests.set(identifier, record)

    const success = record.count <= this.options.maxRequests
    const remaining = Math.max(0, this.options.maxRequests - record.count)

    return {
      success,
      resetTime: record.resetTime,
      remaining,
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (record.resetTime <= now) {
        this.requests.delete(key)
      }
    }
  }
}
