import { useSecurity } from "@/components/security-provider"

export class SecureApiClient {
  private csrfToken: string | null
  private sessionId: string | null

  constructor(csrfToken: string | null, sessionId: string | null) {
    this.csrfToken = csrfToken
    this.sessionId = sessionId
  }

  async post(url: string, data: any) {
    if (!this.csrfToken) {
      throw new Error("CSRF token not available")
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async get(url: string) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

export function useSecureApiClient() {
  const { csrfToken, sessionId } = useSecurity()
  return new SecureApiClient(csrfToken, sessionId)
}
