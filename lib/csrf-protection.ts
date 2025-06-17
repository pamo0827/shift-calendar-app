import crypto from "crypto"

export class CSRFProtection {
  private static readonly SECRET_KEY = process.env.CSRF_SECRET || "default-secret-key"

  // CSRF トークンの生成
  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString()
    const data = `${sessionId}:${timestamp}`
    const hash = crypto.createHmac("sha256", this.SECRET_KEY).update(data).digest("hex")
    return `${timestamp}:${hash}`
  }

  // CSRF トークンの検証
  static validateToken(token: string, sessionId: string): boolean {
    try {
      const [timestamp, hash] = token.split(":")
      const data = `${sessionId}:${timestamp}`
      const expectedHash = crypto.createHmac("sha256", this.SECRET_KEY).update(data).digest("hex")

      // トークンの有効期限チェック (1時間)
      const tokenAge = Date.now() - Number.parseInt(timestamp)
      const maxAge = 60 * 60 * 1000 // 1時間

      return hash === expectedHash && tokenAge < maxAge
    } catch {
      return false
    }
  }
}
