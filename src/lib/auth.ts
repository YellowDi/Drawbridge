type AuthExpiredListener = () => void

const listeners = new Set<AuthExpiredListener>()

export function onAuthExpired(listener: AuthExpiredListener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function notifyAuthExpired() {
  for (const listener of listeners) {
    listener()
  }
}

export function clearAuthToken() {
  // Drawbridge keeps auth token handling in auth-session.ts.
}
