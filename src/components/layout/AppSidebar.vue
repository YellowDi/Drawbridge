<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import AppSidebarHomeNav from "@/components/layout/app-sidebar/AppSidebarHomeNav.vue"
import AppSidebarTopBar from "@/components/layout/app-sidebar/AppSidebarTopBar.vue"
import UserCardPopover from "@/components/layout/UserCardPopover.vue"
import type {
  AppSidebarConversationItem,
  AppSidebarInboxGroup,
  AppSidebarNavItem,
  AppSidebarTopTabId,
} from "@/components/layout/app-sidebar/types"
import SettingsSidebar from "@/components/settings/SettingsSidebar.vue"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useDrawbridgeConfig } from "@/composables/useDrawbridgeConfig"
import { useSettings } from "@/composables/useSettings"
import type { DrawbridgeNavItem } from "@/drawbridge/types"
import { DEFAULT_SETTINGS_CATEGORY_KEY, isSettingsCategoryKey, type SettingsCategoryKey } from "@/components/settings/types"

const AppSidebarCalendarPanel = defineAsyncComponent(() => import("@/components/layout/app-sidebar/AppSidebarCalendarPanel.vue"))
const AppSidebarConversationPanel = defineAsyncComponent(() => import("@/components/layout/app-sidebar/AppSidebarConversationPanel.vue"))
const AppSidebarInboxPanel = defineAsyncComponent(() => import("@/components/layout/app-sidebar/AppSidebarInboxPanel.vue"))
const GlobalCommand = defineAsyncComponent(() => import("@/components/layout/GlobalCommand.vue"))

defineProps<{
  mobileOpen?: boolean
}>()

const emit = defineEmits<{
  "close-mobile": []
}>()

const route = useRoute()
const router = useRouter()
const { navItems, permissions, quickActions, shell } = useDrawbridgeConfig()
const { categories } = useSettings()
const openKeys = ref(new Set<string>())

const topTabs: Array<{ id: AppSidebarTopTabId, label: string, icon: string }> = [
  { id: "home", label: "工作台", icon: "ri-home-5-line" },
  { id: "conversation", label: "对话", icon: "ri-chat-1-line" },
  { id: "calendar", label: "日历", icon: "ri-calendar-event-line" },
  { id: "inbox", label: "收件箱", icon: "ri-inbox-2-line" },
]

const selectedTopTab = ref<AppSidebarTopTabId>("home")
const isSearchDialogOpen = ref(false)
const sidebarModeTransitionName = ref("sidebar-mode-forward")
const isSettingsRoute = computed(() => route.path.startsWith("/settings"))
const settingsActiveKey = computed<SettingsCategoryKey>(() => {
  const category = route.params.category
  return typeof category === "string" && isSettingsCategoryKey(category)
    ? category
    : DEFAULT_SETTINGS_CATEGORY_KEY
})
const visibleSettingsCategories = computed(() => categories.value)

const conversationItems: AppSidebarConversationItem[] = [
  {
    id: "ctx-001",
    title: "后台模板还原计划",
    project: "Drawbridge",
    model: "Template Context",
    updatedAtIso: new Date().toISOString(),
    preview: "迁移 shadcn-vue primitives、布局和设置页结构。",
    messageCount: 12,
    pinned: true,
  },
  {
    id: "ctx-002",
    title: "TablePage 接入边界",
    project: "Drawbridge",
    model: "Server Pagination",
    updatedAtIso: new Date(Date.now() - 86_400_000).toISOString(),
    preview: "梳理筛选、排序、分页和行操作的 adapter。",
    messageCount: 8,
  },
  {
    id: "ctx-003",
    title: "部署检查清单",
    project: "Drawbridge",
    model: "Release Notes",
    updatedAtIso: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    preview: "确认 Vite build、base path、环境变量和静态资源路径。",
    messageCount: 5,
  },
]

const inboxGroups: AppSidebarInboxGroup[] = [
  {
    label: "今天",
    items: [
      {
        id: 1,
        title: "设置页结构已加入模板",
        source: "Drawbridge",
        date: "2026-06-01 10:20",
        dueLabel: "今日",
        dueAt: "10:20",
        summary: "成员、菜单权限、业务预设、检查配置和应用页均使用本地 mock 展示。",
        severity: "info",
      },
      {
        id: 2,
        title: "权限 adapter 待接入真实项目",
        source: "Access Adapter",
        date: "2026-06-01 09:40",
        dueLabel: "今日",
        dueAt: "17:00",
        summary: "当前权限由 drawbridge.config.ts 的 canAccess 控制，后续可替换为远程角色权限。",
        severity: "warning",
      },
    ],
  },
  {
    label: "更早",
    items: [
      {
        id: 3,
        title: "TablePage mock 服务端分页可用",
        source: "TablePage",
        date: "2026-05-31 18:30",
        dueLabel: "昨天",
        dueAt: "18:30",
        summary: "列表页已演示 query sync、tab count、筛选和服务端分页接口形状。",
        severity: "info",
      },
    ],
  },
]

const activePath = computed(() => {
  const metaPath = route.meta.navActivePath
  return typeof metaPath === "string" ? metaPath : route.path
})
const visibleItems = computed<AppSidebarNavItem[]>(() => toSidebarItems(navItems.value))
const visibleQuickActions = computed(() => (
  quickActions.value.filter(action => permissions.canAccess(action.permission))
))

function toSidebarItems(items: DrawbridgeNavItem[]): AppSidebarNavItem[] {
  return items
    .map((item) => {
      const children = item.children ? toSidebarItems(item.children) : undefined
      const key = item.path ?? item.label
      const hasActiveDescendant = children?.some(child => isItemActive(child) || hasActiveChild(child)) ?? false

      return {
        label: item.label,
        kind: item.kind,
        icon: item.icon,
        path: item.path,
        badge: item.badge === undefined ? undefined : String(item.badge),
        children,
        open: openKeys.value.has(key) || hasActiveDescendant,
      }
    })
    .filter((item, index) => {
      const source = items[index]
      return permissions.canAccess(source.permission) || Boolean(item.children?.length) || item.kind === "separator"
    })
}

function isItemActive(item: AppSidebarNavItem) {
  if (!item.path) return false
  if (item.path === "/") return activePath.value === "/"
  return activePath.value === item.path || activePath.value.startsWith(`${item.path}/`)
}

function hasActiveChild(item: AppSidebarNavItem): boolean {
  return item.children?.some(child => isItemActive(child) || hasActiveChild(child)) ?? false
}

function toggleItem(item: AppSidebarNavItem) {
  if (!item.children?.length) {
    return
  }

  const key = item.path ?? item.label
  const next = new Set(openKeys.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  openKeys.value = next
}

function handleSettingsCategoryChange(nextKey: SettingsCategoryKey) {
  if (nextKey === settingsActiveKey.value) {
    return
  }

  void router.push({
    name: "settings",
    params: { category: nextKey },
  })
}

function handleLeaveSettings() {
  void router.push("/")
}

function handleTopTabUpdate(value: string) {
  selectedTopTab.value = value as AppSidebarTopTabId
}

function handleSearch() {
  isSearchDialogOpen.value = true
}

function handleCommandTopTabSelect(tabId: AppSidebarTopTabId) {
  selectedTopTab.value = tabId
}

function handleGlobalKeydown(event: KeyboardEvent) {
  const isCommandShortcut = (event.metaKey || event.ctrlKey)
    && !event.altKey
    && !event.shiftKey
    && event.key.toLowerCase() === "k"

  if (!isCommandShortcut) {
    return
  }

  event.preventDefault()
  isSearchDialogOpen.value = true
}

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleGlobalKeydown)
})

watch(isSettingsRoute, (nextValue, previousValue) => {
  if (previousValue === undefined || nextValue === previousValue) {
    return
  }

  sidebarModeTransitionName.value = nextValue
    ? "sidebar-mode-forward"
    : "sidebar-mode-backward"
})

watch(() => route.fullPath, () => {
  if (!isSettingsRoute.value) {
    selectedTopTab.value = "home"
  }

  emit("close-mobile")
})
</script>

<template>
  <Sidebar
    collapsible="offcanvas"
    class="min-[1000px]:border-sidebar-border/75 min-[1000px]:bg-sidebar/96"
    :style="{ '--sidebar-width': shell.sidebar.width }"
  >
    <Transition :name="sidebarModeTransitionName" mode="out-in">
      <div
        v-if="isSettingsRoute"
        key="settings-sidebar"
        class="sidebar-mode-panel flex min-h-0 flex-1 flex-col"
      >
        <SettingsSidebar
          :categories="visibleSettingsCategories"
          :active-key="settingsActiveKey"
          class="min-h-0 flex-1 border-r-0"
          @update:active-key="handleSettingsCategoryChange"
        >
          <template #top>
            <button
              type="button"
              class="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              @click="handleLeaveSettings"
            >
              <i class="ri-arrow-left-line text-base" />
              <span>返回</span>
            </button>
          </template>
        </SettingsSidebar>
      </div>

      <div
        v-else
        key="main-sidebar"
        class="sidebar-mode-panel flex min-h-0 flex-1 flex-col"
      >
        <SidebarHeader class="shrink-0 pb-0">
          <AppSidebarTopBar
            v-if="shell.sidebar.showLogo || shell.sidebar.showTopTabs || shell.sidebar.showSearch"
            :tabs="topTabs"
            :model-value="selectedTopTab"
            :show-logo="shell.sidebar.showLogo"
            :show-search="shell.sidebar.showSearch"
            :show-tabs="shell.sidebar.showTopTabs"
            @update:model-value="handleTopTabUpdate"
            @search="handleSearch"
          />
        </SidebarHeader>

        <SidebarContent class="min-h-0 overflow-x-visible">
          <AppSidebarHomeNav
            v-if="selectedTopTab === 'home'"
            :items="visibleItems"
            :active-path="activePath"
            class="p-2"
            @toggle-item="toggleItem"
          />
          <AppSidebarConversationPanel
            v-else-if="selectedTopTab === 'conversation'"
            :items="conversationItems"
          />
          <AppSidebarInboxPanel
            v-else-if="selectedTopTab === 'inbox'"
            :groups="inboxGroups"
          />
          <AppSidebarCalendarPanel
            v-else
            class="p-2"
          />
        </SidebarContent>

        <SidebarFooter v-if="shell.sidebar.showUserCard" class="shrink-0">
          <UserCardPopover />
        </SidebarFooter>
      </div>
    </Transition>

    <SidebarRail />
  </Sidebar>

  <GlobalCommand
    v-if="isSearchDialogOpen"
    v-model:open="isSearchDialogOpen"
    :navigation-items="visibleItems"
    :quick-actions="visibleQuickActions"
    :settings-categories="visibleSettingsCategories"
    :top-tabs="topTabs"
    @select-top-tab="handleCommandTopTabSelect"
  />
</template>
