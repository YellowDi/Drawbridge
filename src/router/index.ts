import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"

import AppShellLayout from "@/layouts/AppShellLayout.vue"
import { drawbridgeConfig } from "@/config/drawbridge.config"
import { beginRouteLoading, endRouteLoading, type RouteLoadingKind } from "@/composables/useRouteLoadingState"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AppShellLayout,
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("@/views/DashboardView.vue"),
        meta: {
          title: "工作台",
          permission: "dashboard.view",
          loading: "dashboard",
          breadcrumb: [{ title: "工作台" }],
        },
      },
      {
        path: "projects",
        name: "projects",
        component: () => import("@/views/ResourceListView.vue"),
        meta: {
          title: "项目管理",
          permission: "projects.view",
          loading: "table",
          breadcrumb: [{ title: "项目管理" }],
        },
      },
      {
        path: "projects/new",
        name: "project-new",
        component: () => import("@/views/ResourceFormView.vue"),
        meta: {
          title: "新建项目",
          permission: "projects.create",
          navActivePath: "/projects",
          loading: "form",
          breadcrumb: [
            { title: "项目管理", to: { name: "projects" } },
            { title: "新建项目" },
          ],
        },
      },
      {
        path: "projects/:id",
        name: "project-detail",
        component: () => import("@/views/ResourceDetailView.vue"),
        meta: {
          title: "项目详情",
          permission: "projects.view",
          navActivePath: "/projects",
          loading: "detail",
          useDetailBreadcrumbTitle: true,
          breadcrumb: [
            { title: "项目管理", to: { name: "projects" } },
            { title: "项目详情" },
          ],
        },
      },
      {
        path: "projects/:id/edit",
        name: "project-edit",
        component: () => import("@/views/ResourceFormView.vue"),
        meta: {
          title: "编辑项目",
          permission: "projects.update",
          navActivePath: "/projects",
          loading: "form",
          breadcrumb: [
            { title: "项目管理", to: { name: "projects" } },
            { title: "编辑项目" },
          ],
        },
      },
      {
        path: "teams",
        name: "teams",
        component: () => import("@/views/TeamMembersView.vue"),
        meta: {
          title: "团队成员",
          permission: "teams.view",
          loading: "table",
          breadcrumb: [{ title: "团队成员" }],
        },
      },
      {
        path: "audit",
        name: "audit",
        component: () => import("@/views/AuditLogView.vue"),
        meta: {
          title: "审计日志",
          permission: "audit.view",
          loading: "table",
          breadcrumb: [{ title: "审计日志" }],
        },
      },
      {
        path: "settings/:category?",
        name: "settings",
        component: () => import("@/views/SettingsView.vue"),
        meta: {
          title: "系统设置",
          permission: "settings.view",
          loading: "form",
          breadcrumb: [{ title: "系统设置" }],
        },
      },
      {
        path: "docs",
        name: "docs",
        component: () => import("@/views/DocsView.vue"),
        meta: {
          title: "使用文档",
          permission: "docs.view",
          loading: "detail",
          breadcrumb: [{ title: "使用文档" }],
        },
      },
      {
        path: "403",
        name: "forbidden",
        component: () => import("@/views/ForbiddenView.vue"),
        meta: {
          title: "无权访问",
          loading: "detail",
          breadcrumb: [{ title: "无权访问" }],
        },
      },
      {
        path: ":pathMatch(.*)*",
        name: "not-found",
        component: () => import("@/views/NotFoundView.vue"),
        meta: {
          title: "页面不存在",
          loading: "detail",
          breadcrumb: [{ title: "页面不存在" }],
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

function resolveLoadingKind(value: unknown): RouteLoadingKind {
  return value === "auth" || value === "dashboard" || value === "table" || value === "detail" || value === "form"
    ? value
    : "table"
}

router.beforeEach((to) => {
  beginRouteLoading(resolveLoadingKind(to.meta.loading))

  const permission = typeof to.meta.permission === "string" ? to.meta.permission : ""
  if (permission && !drawbridgeConfig.permissions.canAccess(permission)) {
    return { name: "forbidden" }
  }

  return true
})

router.afterEach(() => {
  endRouteLoading()
})

router.onError(() => {
  endRouteLoading()
})

export default router
