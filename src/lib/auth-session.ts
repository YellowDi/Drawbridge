export type AuthSession = {
  token: string
  userId: string
}

const STORAGE_KEY = "drawbridge.auth"

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    const token = typeof parsed.token === "string" ? parsed.token : ""
    const userId = typeof parsed.userId === "string" ? parsed.userId : ""

    return token ? { token, userId } : null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function writeAuthSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}
