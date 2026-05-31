import type { DrawbridgeConfig } from "@/drawbridge/types"

const grantedPermissions = new Set([
  "dashboard.view",
  "projects.view",
  "projects.create",
  "projects.update",
  "teams.view",
  "audit.view",
  "settings.view",
  "docs.view",
])

export const drawbridgeConfig: DrawbridgeConfig = {
  brand: {
    name: "Drawbridge",
    shortName: "DB",
    tagline: "Reusable admin foundation",
    accentColor: "#0075de",
  },
  user: {
    name: "Alex Chen",
    email: "alex@example.com",
    role: "Platform Admin",
    avatarFallback: "AC",
  },
  navItems: [
    {
      label: "工作台",
      icon: "ri-dashboard-3-line",
      path: "/",
      permission: "dashboard.view",
    },
    {
      label: "项目管理",
      icon: "ri-folder-3-line",
      path: "/projects",
      permission: "projects.view",
    },
    {
      label: "团队成员",
      icon: "ri-team-line",
      path: "/teams",
      permission: "teams.view",
    },
    {
      label: "审计日志",
      icon: "ri-shield-check-line",
      path: "/audit",
      permission: "audit.view",
    },
    {
      label: "系统设置",
      icon: "ri-settings-4-line",
      path: "/settings",
      permission: "settings.view",
    },
    {
      label: "使用文档",
      icon: "ri-book-open-line",
      path: "/docs",
      permission: "docs.view",
    },
  ],
  quickActions: [
    {
      label: "新建项目",
      icon: "ri-add-line",
      to: "/projects/new",
      permission: "projects.create",
    },
    {
      label: "查看文档",
      icon: "ri-book-open-line",
      to: "/docs",
      permission: "docs.view",
    },
  ],
  shell: {
    sidebar: {
      width: "255px",
      navigationLabel: "主导航",
      showLogo: true,
      showUserCard: true,
    },
    header: {
      showBreadcrumb: true,
      showDescription: false,
      showQuickActions: false,
      showThemeToggle: false,
    },
    content: {
      padding: "comfortable",
    },
  },
  permissions: {
    canAccess(permission) {
      return !permission || grantedPermissions.has(permission)
    },
  },
}
