import { computed } from "vue"

import { useDrawbridgeConfig } from "@/composables/useDrawbridgeConfig"

export function useCurrentUser() {
  const { user } = useDrawbridgeConfig()

  return {
    currentUser: user,
    displayName: computed(() => user.value.name),
    avatarFallback: computed(() => user.value.avatarFallback ?? user.value.name.slice(0, 2).toUpperCase()),
  }
}

export function clearCurrentUser() {
  // Drawbridge user data is adapter-driven and does not cache remote state.
}
