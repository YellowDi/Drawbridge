import { useDrawbridgeConfig } from "@/composables/useDrawbridgeConfig"

export function useCurrentUserPermissions() {
  const { permissions } = useDrawbridgeConfig()

  function canAccess(permissionCode?: string) {
    return permissions.canAccess(permissionCode)
  }

  return {
    canAccess,
    canButton: canAccess,
    canMenu: canAccess,
  }
}

export function clearCurrentUserPermissions() {
  // Drawbridge permissions are adapter-driven and do not cache remote state.
}
