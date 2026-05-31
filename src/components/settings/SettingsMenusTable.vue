<script setup lang="ts">
import { computed, ref } from "vue"
import { toast } from "vue-sonner"

import TopTabSwitch from "@/components/layout/TopTabSwitch.vue"
import { Button } from "@/components/ui/button"
import SettingsRightPanelLayout from "@/components/settings/SettingsRightPanelLayout.vue"
import SettingsTable from "@/components/settings/SettingsTable.vue"
import SettingsToolbarRefreshSlot from "@/components/settings/SettingsToolbarRefreshSlot.vue"
import SettingsToolbarRow from "@/components/settings/SettingsToolbarRow.vue"
import SettingsToolbarSearchInput from "@/components/settings/SettingsToolbarSearchInput.vue"
import type { TableColumn, TablePageEmptyState, TableRowAction } from "@/components/table-page/types"
import { useDrawbridgeConfig } from "@/composables/useDrawbridgeConfig"
import type { DrawbridgeNavItem } from "@/drawbridge/types"

const props = defineProps<{
  pageTitle: string
  pageDescription?: string | null
}>()

type SystemViewKey = "menus" | "buttons" | "apis"

type MenuRow = {
  id: string
  name: string
  path: string
  icon: string
  parentName: string
  level: number
  permission: string
  status: string
}

const { navItems } = useDrawbridgeConfig()
const activeView = ref<SystemViewKey>("menus")
const searchExpanded = ref(false)
const searchQuery = ref("")

const buttonRows = [
  { id: "btn-create", name: "新建", code: "projects.create", menuName: "项目管理", apiName: "POST /projects", updatedAt: "2026-05-31 18:20" },
  { id: "btn-update", name: "编辑", code: "projects.update", menuName: "项目管理", apiName: "PATCH /projects/:id", updatedAt: "2026-05-31 18:20" },
  { id: "btn-export", name: "导出", code: "audit.export", menuName: "审计日志", apiName: "GET /audit/export", updatedAt: "2026-05-28 11:08" },
]

const apiRows = [
  { id: "api-project-list", name: "项目列表", path: "/api/projects", method: "GET", bound: "是", updatedAt: "2026-05-31 18:20" },
  { id: "api-project-detail", name: "项目详情", path: "/api/projects/:id", method: "GET", bound: "是", updatedAt: "2026-05-31 18:20" },
  { id: "api-session", name: "当前用户", path: "/api/session", method: "GET", bound: "否", updatedAt: "2026-05-25 09:42" },
]

const menuStatusMap = {
  启用: { tone: "green", icon: "check" },
  隐藏: { tone: "gray", icon: "minus" },
} as const

const apiMethodMap = {
  GET: { tone: "blue", icon: "dot" },
  POST: { tone: "green", icon: "dot" },
  PATCH: { tone: "orange", icon: "dot" },
  DELETE: { tone: "red", icon: "dot" },
} as const

const menuColumns: TableColumn[] = [
  {
    key: "name",
    label: "菜单名称",
    filterType: "text",
    emphasis: "strong",
    tone: "primary",
    cellClass: "font-medium text-foreground",
  },
  {
    key: "path",
    label: "Path",
    filterType: "text",
    tone: "muted",
    cellClass: "font-mono text-[12px] text-muted-foreground",
  },
  {
    key: "parentName",
    label: "上级菜单",
    filterType: "text",
    tone: "muted",
  },
  {
    key: "permission",
    label: "权限码",
    filterType: "text",
    tone: "muted",
    cellClass: "font-mono text-[12px] text-muted-foreground",
  },
  {
    key: "status",
    label: "状态",
    filterType: "tag",
    width: "fill",
    cellRenderer: {
      kind: "status",
      map: menuStatusMap,
    },
  },
]

const buttonColumns: TableColumn[] = [
  { key: "name", label: "按钮名称", filterType: "text", emphasis: "strong", tone: "primary", cellClass: "font-medium text-foreground" },
  { key: "code", label: "按钮标识", filterType: "text", tone: "muted", cellClass: "font-mono text-[12px] text-muted-foreground" },
  { key: "menuName", label: "所属菜单", filterType: "text", tone: "muted" },
  { key: "apiName", label: "关联 API", filterType: "text", tone: "muted", width: "fill" },
  { key: "updatedAt", label: "更新时间", filterType: "text", tone: "muted" },
]

const apiColumns: TableColumn[] = [
  { key: "name", label: "API 名称", filterType: "text", emphasis: "strong", tone: "primary", cellClass: "font-medium text-foreground" },
  { key: "path", label: "Path", filterType: "text", tone: "muted", cellClass: "font-mono text-[12px] text-muted-foreground" },
  {
    key: "method",
    label: "Method",
    filterType: "tag",
    cellRenderer: {
      kind: "status",
      map: apiMethodMap,
    },
  },
  { key: "bound", label: "是否绑定按钮", filterType: "tag", tone: "muted" },
  { key: "updatedAt", label: "更新时间", filterType: "text", tone: "muted", width: "fill" },
]

const tabs = computed(() => [
  { id: "menus", label: "菜单" },
  { id: "buttons", label: "按钮" },
  { id: "apis", label: "API" },
])

const menuRows = computed<MenuRow[]>(() => flattenNavItems(navItems.value))

const currentColumns = computed(() => {
  if (activeView.value === "buttons") return buttonColumns
  if (activeView.value === "apis") return apiColumns
  return menuColumns
})

const currentRows = computed<Record<string, unknown>[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const rows = activeView.value === "buttons"
    ? buttonRows
    : activeView.value === "apis"
      ? apiRows
      : menuRows.value

  return rows.filter(row => {
    if (!query) return true
    return Object.values(row).join(" ").toLowerCase().includes(query)
  }) as unknown as Record<string, unknown>[]
})

const currentSearchPlaceholder = computed(() => {
  if (activeView.value === "buttons") return "搜索按钮名称、编码、菜单或 API"
  if (activeView.value === "apis") return "搜索 API 名称、路径或 Method"
  return "搜索菜单名称、Path 或权限码"
})

const emptyState = computed<TablePageEmptyState>(() => ({
  title: searchQuery.value.trim() ? "没有匹配结果" : "暂无资源",
  description: searchQuery.value.trim() ? "换个关键词试试。" : "真实项目可从权限 API 加载。",
  icon: searchQuery.value.trim() ? "ri-search-line" : "ri-code-box-line",
}))

const rowActions = computed<TableRowAction[]>(() => [
  {
    key: "edit",
    label: "编辑",
    icon: "ri-edit-line",
    onClick: row => toast.info(`编辑 ${String(row.name)}`),
  },
])

function flattenNavItems(items: DrawbridgeNavItem[], parentName = "-", level = 0): MenuRow[] {
  return items.flatMap((item, index) => {
    const id = `${parentName}-${item.path ?? item.label}-${index}`
    const current: MenuRow = {
      id,
      name: item.label,
      path: item.path ?? "-",
      icon: item.icon ?? "-",
      parentName,
      level,
      permission: item.permission ?? "-",
      status: item.kind === "separator" ? "隐藏" : "启用",
    }

    return [
      current,
      ...flattenNavItems(item.children ?? [], item.label, level + 1),
    ]
  })
}

function toggleSearch() {
  if (searchExpanded.value && searchQuery.value) {
    searchQuery.value = ""
    return
  }
  searchExpanded.value = !searchExpanded.value
}

function refreshData() {
  toast.success("已从 Drawbridge 配置刷新菜单 mock")
}

function triggerPrimaryAction() {
  const labels: Record<SystemViewKey, string> = {
    menus: "添加菜单入口已保留。",
    buttons: "添加按钮入口已保留。",
    apis: "导入 API 入口已保留。",
  }
  toast.info(labels[activeView.value])
}
</script>

<template>
  <SettingsRightPanelLayout
    variant="with-tabs"
    :title="props.pageTitle"
    :description="props.pageDescription"
  >
    <template #toolbar>
      <SettingsToolbarRow>
        <template #leading>
          <TopTabSwitch
            :tabs="tabs"
            :model-value="activeView"
            :collapse-inactive="false"
            tone="default"
            aria-label="系统资源页签切换"
            @update:model-value="activeView = $event as SystemViewKey"
          />
        </template>

        <div class="flex flex-nowrap items-center justify-end gap-1">
          <SettingsToolbarSearchInput
            v-model="searchQuery"
            :expanded="searchExpanded"
            :placeholder="currentSearchPlaceholder"
            @toggle="toggleSearch"
          />

          <SettingsToolbarRefreshSlot :yield-space="searchExpanded">
            <Button
              variant="ghost"
              size="sm"
              class="h-8 rounded-md px-3"
              @click="refreshData"
            >
              <i class="ri-refresh-line text-sm" />
              <span>刷新列表</span>
            </Button>
          </SettingsToolbarRefreshSlot>

          <Button
            class="h-8 gap-1 rounded-md px-3 text-[14px]"
            @click="triggerPrimaryAction"
          >
            <i class="ri-add-line text-base" />
            <span>{{ activeView === "apis" ? "导入 API" : activeView === "buttons" ? "添加按钮" : "添加菜单" }}</span>
          </Button>
        </div>
      </SettingsToolbarRow>
    </template>

    <SettingsTable
      :columns="currentColumns"
      :rows="currentRows"
      row-key="id"
      :row-actions="rowActions"
      :empty-state="emptyState"
    />
  </SettingsRightPanelLayout>
</template>
