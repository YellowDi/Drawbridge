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

const props = defineProps<{
  pageTitle: string
  pageDescription?: string | null
}>()

type MemberViewKey = "members" | "roles"

type MemberRow = {
  id: string
  name: string
  email: string
  department: string
  roleSummary: string[]
  status: string
  lastSeen: string
}

type RoleRow = {
  id: string
  name: string
  description: string
  members: number
  scope: string
  updatedAt: string
}

const activeView = ref<MemberViewKey>("members")
const searchExpanded = ref(false)
const searchQuery = ref("")

const memberRows: MemberRow[] = [
  {
    id: "mem-001",
    name: "Alex Chen",
    email: "alex@example.com",
    department: "平台组",
    roleSummary: ["Owner", "Admin"],
    status: "正常",
    lastSeen: "刚刚",
  },
  {
    id: "mem-002",
    name: "Mia Wong",
    email: "mia@example.com",
    department: "运营组",
    roleSummary: ["Manager"],
    status: "正常",
    lastSeen: "18 分钟前",
  },
  {
    id: "mem-003",
    name: "Ray Liu",
    email: "ray@example.com",
    department: "外部协作",
    roleSummary: ["Viewer"],
    status: "待邀请",
    lastSeen: "-",
  },
]

const roleRows: RoleRow[] = [
  {
    id: "role-owner",
    name: "Owner",
    description: "拥有模板配置、部署和权限管理能力。",
    members: 1,
    scope: "全部资源",
    updatedAt: "2026-06-01 09:10",
  },
  {
    id: "role-manager",
    name: "Manager",
    description: "可以管理列表、详情、表单和常见运营数据。",
    members: 4,
    scope: "项目资源",
    updatedAt: "2026-05-28 16:42",
  },
  {
    id: "role-viewer",
    name: "Viewer",
    description: "只读访问，可用于审计、顾问或临时成员。",
    members: 8,
    scope: "只读",
    updatedAt: "2026-05-20 11:24",
  },
]

const statusMap = {
  正常: { tone: "green", icon: "check" },
  待邀请: { tone: "yellow", icon: "clock" },
  停用: { tone: "gray", icon: "minus" },
} as const

const memberColumns: TableColumn[] = [
  {
    key: "name",
    label: "成员",
    filterType: "contact",
    variant: "contact",
    cellRenderer: {
      kind: "dual-stack",
      primaryKey: "name",
      secondaryKey: "email",
      primaryClass: "font-medium text-foreground",
      secondaryClass: "text-muted-foreground",
    },
  },
  {
    key: "department",
    label: "部门",
    filterType: "tag",
    tone: "muted",
  },
  {
    key: "roleSummary",
    label: "角色",
    filterType: "tag",
    cellRenderer: {
      kind: "tags",
      itemClass: "rounded bg-muted px-1.5 py-0.5 text-[12px] text-muted-foreground",
    },
  },
  {
    key: "status",
    label: "状态",
    filterType: "tag",
    cellRenderer: {
      kind: "status",
      map: statusMap,
    },
  },
  {
    key: "lastSeen",
    label: "最近活跃",
    filterType: "text",
    tone: "muted",
    width: "fill",
  },
]

const roleColumns: TableColumn[] = [
  {
    key: "name",
    label: "角色",
    filterType: "text",
    emphasis: "strong",
    tone: "primary",
    cellClass: "font-medium text-foreground",
  },
  {
    key: "description",
    label: "说明",
    filterType: "text",
    tone: "muted",
    variant: "note",
    cellRenderer: { kind: "note" },
    width: "fill",
  },
  {
    key: "members",
    label: "成员数",
    filterType: "number",
    format: "numeric",
  },
  {
    key: "scope",
    label: "范围",
    filterType: "tag",
    tone: "muted",
  },
  {
    key: "updatedAt",
    label: "更新时间",
    filterType: "text",
    tone: "muted",
  },
]

const tabs = computed(() => [
  { id: "members", label: "成员列表" },
  { id: "roles", label: "权限组" },
])

const currentColumns = computed(() => activeView.value === "roles" ? roleColumns : memberColumns)

const currentRows = computed<Record<string, unknown>[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const source = activeView.value === "roles" ? roleRows : memberRows

  return source.filter(row => {
    if (!query) return true
    return Object.values(row).flat().join(" ").toLowerCase().includes(query)
  }) as unknown as Record<string, unknown>[]
})

const currentSearchPlaceholder = computed(() =>
  activeView.value === "roles"
    ? "搜索角色、范围或说明"
    : "搜索成员、邮箱、部门或角色",
)

const emptyState = computed<TablePageEmptyState>(() => ({
  title: searchQuery.value.trim() ? "没有匹配结果" : "暂无数据",
  description: searchQuery.value.trim() ? "换个关键词试试。" : "真实项目可从成员 API 加载。",
  icon: searchQuery.value.trim() ? "ri-search-line" : "ri-team-line",
}))

const rowActions = computed<TableRowAction[]>(() => [
  {
    key: "edit",
    label: "编辑",
    icon: "ri-edit-line",
    onClick: row => toast.info(`编辑 ${String(row.name)}`),
  },
])

function toggleSearch() {
  if (searchExpanded.value && searchQuery.value) {
    searchQuery.value = ""
    return
  }
  searchExpanded.value = !searchExpanded.value
}

function refreshData() {
  toast.success("已刷新 mock 数据")
}

function triggerPrimaryAction() {
  toast.info(activeView.value === "roles" ? "创建角色入口已保留。" : "邀请成员入口已保留。")
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
            aria-label="成员页签切换"
            @update:model-value="activeView = $event as MemberViewKey"
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
            <span>{{ activeView === "roles" ? "添加角色" : "邀请成员" }}</span>
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
