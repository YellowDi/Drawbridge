import { computed } from "vue"

import { drawbridgeConfig } from "@/config/drawbridge.config"
import type { DrawbridgeShellConfig } from "@/drawbridge/types"

const defaultShellConfig = {
  sidebar: {
    width: "255px",
    navigationLabel: "主导航",
    showLogo: true,
    showUserCard: true,
  },
  header: {
    showBreadcrumb: true,
    showDescription: true,
    showQuickActions: true,
    showThemeToggle: true,
  },
  content: {
    padding: "comfortable",
  },
} satisfies Required<DrawbridgeShellConfig>

function resolveShellConfig(shell: DrawbridgeShellConfig = {}) {
  return {
    sidebar: {
      ...defaultShellConfig.sidebar,
      ...shell.sidebar,
    },
    header: {
      ...defaultShellConfig.header,
      ...shell.header,
    },
    content: {
      ...defaultShellConfig.content,
      ...shell.content,
    },
  }
}

export function useDrawbridgeConfig() {
  return {
    brand: computed(() => drawbridgeConfig.brand),
    navItems: computed(() => drawbridgeConfig.navItems),
    quickActions: computed(() => drawbridgeConfig.quickActions),
    user: computed(() => drawbridgeConfig.user),
    shell: computed(() => resolveShellConfig(drawbridgeConfig.shell)),
    permissions: drawbridgeConfig.permissions,
  }
}
