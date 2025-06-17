"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { CSRFProtection } from "@/lib/csrf-protection"

interface SecurityContextType {
  csrfToken: string | null
  sessionId: string | null
}

const SecurityContext = createContext<SecurityContextType>({
  csrfToken: null,
  sessionId: null,
})

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // セッションIDの生成または取得
    let session = localStorage.getItem("session-id")
    if (!session) {
      session = crypto.randomUUID()
      localStorage.setItem("session-id", session)
    }
    setSessionId(session)

    // CSRF トークンの生成
    const token = CSRFProtection.generateToken(session)
    setCsrfToken(token)

    // セッションクッキーの設定
    document.cookie = `session-token=${session}; path=/; secure; samesite=strict`

    // CSRFトークンをmetaタグに設定
    const metaTag = document.createElement("meta")
    metaTag.name = "csrf-token"
    metaTag.content = token
    document.head.appendChild(metaTag)
  }, [])

  return <SecurityContext.Provider value={{ csrfToken, sessionId }}>{children}</SecurityContext.Provider>
}

export function useSecurity() {
  return useContext(SecurityContext)
}
