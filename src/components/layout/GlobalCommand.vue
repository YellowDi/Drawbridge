<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter, type RouteLocationRaw } from "vue-router"

import type { AppSidebarNavItem, AppSidebarTopTabId } from "@/components/layout/app-sidebar/types"
import type { SettingsCategory } from "@/components/settings/types"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import type { DrawbridgeQuickAction } from "@/drawbridge/types"

type SearchItem = {
  id: string
  label: string
  subtitle: string
  icon: string
  type: string
  keywords?: string[]
  to?: RouteLocationRaw
  tabId?: AppSidebarTopTabId
}

type SearchGroup = {
  id: string
  heading: string
  items: SearchItem[]
}

const props = defineProps<{
  open: boolean
  navigationItems: AppSidebarNavItem[]
  quickActions: DrawbridgeQuickAction[]
  settingsCategories: SettingsCategory[]
  topTabs: Array<{ id: AppSidebarTopTabId, label: string, icon: string }>
}>()

const emit = defineEmits<{
  "update:open": [value: boolean]
  "select-top-tab": [tabId: AppSidebarTopTabId]
}>()

const router = useRouter()
const searchQuery = ref("")

const dialogOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value),
})
const normalizedSearchQuery = computed(() => searchQuery.value.trim())
const quickSearchItems = computed<SearchItem[]>(() => (
  props.quickActions.map(action => ({
    id: `quick-${action.to}-${action.label}`,
    label: action.label,
    subtitle: `执行${action.label}`,
    icon: action.icon,
    type: "快捷",
    keywords: [action.label, action.to],
    to: action.to,
  }))
))
const pageSearchItems = computed<SearchItem[]>(() => flattenNavigationItems(props.navigationItems))
const settingsSearchItems = computed<SearchItem[]>(() => (
  props.settingsCategories.map(category => ({
    id: `settings-${category.key}`,
    label: category.pageTitle ?? category.label,
    subtitle: category.pageDescription ?? category.description,
    icon: category.icon,
    type: "设置",
    keywords: [category.key, category.label, category.description],
    to: {
      name: "settings",
      params: { category: category.key },
    },
  }))
))
const sidebarTabItems = computed<SearchItem[]>(() => (
  props.topTabs
    .filter(tab => tab.id !== "home")
    .map(tab => ({
      id: `sidebar-tab-${tab.id}`,
      label: tab.label,
      subtitle: `切换侧边栏到${tab.label}`,
      icon: tab.icon,
      type: "侧栏",
      keywords: [tab.id, tab.label],
      tabId: tab.id,
    }))
))
const keywordSearchItems = computed<SearchItem[]>(() => {
  const keyword = normalizedSearchQuery.value

  if (!keyword) {
    return []
  }

  return props.navigationItems
    .flatMap(item => collectSearchTargets(item))
    .map(item => ({
      id: `search-${item.path}-${item.label}`,
      label: `在${item.label}中搜索`,
      subtitle: `用关键词筛选${item.label}：${keyword}`,
      icon: item.icon ?? "ri-search-line",
      type: "搜索",
      keywords: [keyword, item.label, item.path],
      to: {
        path: item.path,
        query: { q: keyword },
      },
    }))
})
const commandGroups = computed<SearchGroup[]>(() => [
  {
    id: "quick",
    heading: "快捷入口",
    items: quickSearchItems.value,
  },
  {
    id: "pages",
    heading: "页面",
    items: pageSearchItems.value,
  },
  {
    id: "keyword-search",
    heading: "数据搜索",
    items: keywordSearchItems.value,
  },
  {
    id: "settings",
    heading: "设置",
    items: settingsSearchItems.value,
  },
  {
    id: "sidebar",
    heading: "侧边栏",
    items: sidebarTabItems.value,
  },
].filter(group => group.items.length > 0))

function flattenNavigationItems(items: AppSidebarNavItem[], parentLabels: string[] = [], parentIcon = ""): SearchItem[] {
  return items.flatMap((item) => {
    if (item.kind === "separator") {
      return []
    }

    const itemIcon = item.icon || parentIcon || "ri-arrow-right-line"
    const children = item.children?.length
      ? flattenNavigationItems(item.children, [...parentLabels, item.label], itemIcon)
      : []
    const ownItem = item.path
      ? [{
          id: `page-${item.path}`,
          label: item.label,
          subtitle: parentLabels.length
            ? `${parentLabels.join(" / ")} / ${item.label}`
            : `打开${item.label}`,
          icon: itemIcon,
          type: "页面",
          keywords: [item.label, item.path, ...parentLabels],
          to: item.path,
        } satisfies SearchItem]
      : []

    return [...ownItem, ...children]
  })
}

function collectSearchTargets(item: AppSidebarNavItem, parentIcon = ""): Array<{ label: string, icon?: string, path: string }> {
  const itemIcon = item.icon || parentIcon
  const ownItem = item.path
    ? [{ label: item.label, icon: itemIcon, path: item.path }]
    : []
  const children = item.children?.flatMap(child => collectSearchTargets(child, itemIcon)) ?? []

  return [...ownItem, ...children]
}

function buildSearchValue(item: SearchItem) {
  return [
    item.label,
    item.subtitle,
    item.type,
    ...(item.keywords ?? []),
  ].filter(Boolean).join(" ")
}

function handleCommandSelect(item: SearchItem) {
  dialogOpen.value = false

  if (item.tabId) {
    emit("select-top-tab", item.tabId)
    return
  }

  if (item.to) {
    void router.push(item.to)
  }
}

watch(dialogOpen, (open) => {
  if (!open) {
    searchQuery.value = ""
  }
})
</script>

<template>
  <CommandDialog
    v-model:open="dialogOpen"
    title="全局搜索"
    description="搜索页面、功能和模板数据入口"
    :prevent-close-auto-focus="true"
    content-class="h-[min(720px,calc(100vh-2rem))] sm:max-w-[720px] [&>[data-slot=dialog-close]]:top-2 [&>[data-slot=dialog-close]]:right-2 [&>[data-slot=dialog-close]]:flex [&>[data-slot=dialog-close]]:h-8 [&>[data-slot=dialog-close]]:w-8 [&>[data-slot=dialog-close]]:items-center [&>[data-slot=dialog-close]]:justify-center [&>[data-slot=dialog-close]]:rounded-md [&>[data-slot=dialog-close]]:bg-transparent [&>[data-slot=dialog-close]]:opacity-100 [&>[data-slot=dialog-close]]:ring-0 [&>[data-slot=dialog-close]]:transition-colors [&>[data-slot=dialog-close]]:focus:ring-0 [&>[data-slot=dialog-close]]:focus:ring-offset-0 [&>[data-slot=dialog-close]]:focus:outline-none [&>[data-slot=dialog-close]]:data-[state=open]:bg-transparent [&>[data-slot=dialog-close]]:data-[state=open]:text-sidebar-foreground/52 [&>[data-slot=dialog-close]]:hover:bg-transparent [&>[data-slot=dialog-close]]:hover:text-sidebar-accent-foreground [&>[data-slot=dialog-close]]:before:absolute [&>[data-slot=dialog-close]]:before:inset-0 [&>[data-slot=dialog-close]]:before:rounded-md [&>[data-slot=dialog-close]]:before:bg-[var(--top-tab-switch-active-surface)] [&>[data-slot=dialog-close]]:before:opacity-0 [&>[data-slot=dialog-close]]:before:scale-[0.94] [&>[data-slot=dialog-close]]:before:transition-[opacity,transform] [&>[data-slot=dialog-close]]:before:duration-[120ms,220ms] [&>[data-slot=dialog-close]]:before:ease-out [&>[data-slot=dialog-close]]:hover:before:opacity-100 [&>[data-slot=dialog-close]]:hover:before:scale-100 [&>[data-slot=dialog-close]]:focus-visible:before:opacity-100 [&>[data-slot=dialog-close]]:focus-visible:before:scale-100 [&>[data-slot=dialog-close]>i]:relative [&>[data-slot=dialog-close]>i]:z-10"
  >
    <CommandInput v-model="searchQuery" placeholder="搜索页面、功能，或输入关键词查找..." class="pr-12" />
    <CommandList class="min-h-0 flex-1 max-h-none px-1 py-1">
      <CommandEmpty class="py-10 text-muted-foreground">没有找到匹配结果。</CommandEmpty>

      <CommandGroup
        v-for="group in commandGroups"
        :key="group.id"
        :heading="group.heading"
      >
        <CommandItem
          v-for="item in group.items"
          :key="item.id"
          :value="buildSearchValue(item)"
          class="items-start gap-3 rounded-lg px-2.5 py-2.5"
          @select="handleCommandSelect(item)"
        >
          <span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <i :class="[item.icon, 'text-base leading-none']" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex min-w-0 items-center gap-3">
              <span class="truncate font-medium">{{ item.label }}</span>
              <span class="ml-auto shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{{ item.type }}</span>
            </div>
            <p class="mt-1 truncate text-xs text-muted-foreground">{{ item.subtitle }}</p>
          </div>
        </CommandItem>
      </CommandGroup>
    </CommandList>

    <div class="flex items-center justify-between gap-3 border-t px-3 py-2 text-xs text-muted-foreground">
      <div class="flex min-w-0 items-center gap-2">
        <KbdGroup>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
        </KbdGroup>
        <span class="truncate">选择</span>
      </div>

      <div class="flex items-center gap-2">
        <Kbd>Enter</Kbd>
        <span>打开</span>
      </div>

      <div class="hidden items-center gap-2 sm:flex">
        <Kbd>Esc</Kbd>
        <span>关闭</span>
      </div>
    </div>
  </CommandDialog>
</template>
