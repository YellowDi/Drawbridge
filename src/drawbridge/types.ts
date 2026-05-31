import type { RouteLocationRaw, RouteRecordRaw } from "vue-router"

export type DrawbridgeBrand = {
  name: string
  shortName: string
  tagline?: string
  accentColor?: string
  logoUrl?: string
  logoDarkUrl?: string
}

export type DrawbridgeUser = {
  name: string
  email: string
  role: string
  avatarUrl?: string
  avatarFallback?: string
}

export type DrawbridgeNavItem = {
  label: string
  icon: string
  path?: string
  permission?: string
  badge?: string | number
  kind?: "item" | "separator"
  children?: DrawbridgeNavItem[]
}

export type DrawbridgeQuickAction = {
  label: string
  icon: string
  to: string
  permission?: string
}

export type DrawbridgePermissionAdapter = {
  canAccess: (permission?: string) => boolean
}

export type DrawbridgeShellConfig = {
  sidebar?: {
    width?: string
    navigationLabel?: string
    showLogo?: boolean
    showTopTabs?: boolean
    showSearch?: boolean
    showUserCard?: boolean
  }
  header?: {
    showBreadcrumb?: boolean
    showDescription?: boolean
    showQuickActions?: boolean
    showThemeToggle?: boolean
  }
  content?: {
    padding?: "compact" | "comfortable"
  }
}

export type DrawbridgeConfig = {
  brand: DrawbridgeBrand
  user: DrawbridgeUser
  navItems: DrawbridgeNavItem[]
  quickActions: DrawbridgeQuickAction[]
  permissions: DrawbridgePermissionAdapter
  shell?: DrawbridgeShellConfig
}

export type DrawbridgeRoute = RouteRecordRaw & {
  meta?: {
    title?: string
    description?: string
    permission?: string
    navActivePath?: string
    breadcrumb?: Array<{
      title: string
      to?: RouteLocationRaw
    }>
  }
}
