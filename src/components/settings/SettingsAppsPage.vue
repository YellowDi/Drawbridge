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
import type { SettingsState } from "@/components/settings/types"
import type { TableColumn, TablePageEmptyState, TableRowAction } from "@/components/table-page/types"

const props = defineProps<{
  pageTitle: string
  pageDescription?: string | null
  state: SettingsState
}>()

type AppsTabKey = "integrations" | "releases" | "webhooks"

const activeTab = ref<AppsTabKey>("integrations")
const searchExpanded = ref(false)
const searchQuery = ref("")

const integrationRows = [
  { id: "sso", name: "Single Sign-On", type: "认证", status: "已启用", owner: "auth-session adapter", updatedAt: "2026-06-01 09:12" },
  { id: "storage", name: "Object Storage", type: "文件", status: "未配置", owner: "upload adapter", updatedAt: "2026-05-29 17:45" },
  { id: "analytics", name: "Usage Analytics", type: "统计", status: "已暂停", owner: "telemetry adapter", updatedAt: "2026-05-20 12:10" },
]

const releaseRows = [
  { id: "web-preview", platform: "Web", version: "0.4.0-preview", channel: "Preview", status: "已发布", updatedAt: "2026-06-01 10:00" },
  { id: "web-prod", platform: "Web", version: "0.3.2", channel: "Production", status: "已发布", updatedAt: "2026-05-23 16:30" },
  { id: "mobile-shell", platform: "Mobile Shell", version: "0.1.0", channel: "Internal", status: "草稿", updatedAt: "2026-05-16 11:30" },
]

const webhookRows = [
  { id: "deploy", name: "部署完成", event: "deployment.succeeded", target: "https://example.com/hooks/deploy", status: "已启用" },
  { id: "member", name: "成员变更", event: "member.updated", target: "https://example.com/hooks/member", status: "草稿" },
]

const statusMap = {
  已启用: { tone: "green", icon: "check" },
  已发布: { tone: "green", icon: "check" },
  未配置: { tone: "gray", icon: "minus" },
  已暂停: { tone: "yellow", icon: "clock" },
  草稿: { tone: "gray", icon: "dot" },
} as const

const integrationColumns: TableColumn[] = [
  { key: "name", label: "应用", filterType: "text", emphasis: "strong", tone: "primary", cellClass: "font-medium text-foreground" },
  { key: "type", label: "类型", filterType: "tag", tone: "muted" },
  {
    key: "status",
    label: "状态",
    filterType: "tag",
    cellRenderer: { kind: "status", map: statusMap },
  },
  { key: "owner", label: "Adapter", filterType: "text", tone: "muted", cellClass: "font-mono text-[12px] text-muted-foreground" },
  { key: "updatedAt", label: "更新时间", filterType: "text", tone: "muted", width: "fill" },
]

const releaseColumns: TableColumn[] = [
  { key: "platform", label: "平台", filterType: "tag", emphasis: "strong", tone: "primary", cellClass: "font-medium text-foreground" },
  { key: "version", label: "版本", filterType: "text", tone: "muted", cellClass: "font-mono text-[12px] text-muted-foreground" },
  { key: "channel", label: "渠道", filterType: "tag", tone: "muted" },
  {
    key: "status",
    label: "状态",
    filterType: "tag",
    cellRenderer: { kind: "status", map: statusMap },
  },
  { key: "updatedAt", label: "更新时间", filterType: "text", tone: "muted", width: "fill" },
]

const webhookColumns: TableColumn[] = [
  { key: "name", label: "Webhook", filterType: "text", emphasis: "strong", tone: "primary", cellClass: "font-medium text-foreground" },
  { key: "event", label: "事件", filterType: "text", tone: "muted", cellClass: "font-mono text-[12px] text-muted-foreground" },
  { key: "target", label: "目标地址", filterType: "text", tone: "muted", cellClass: "font-mono text-[12px] text-muted-foreground", width: "fill" },
  {
    key: "status",
    label: "状态",
    filterType: "tag",
    cellRenderer: { kind: "status", map: statusMap },
  },
]

const tabs = computed(() => [
  { id: "integrations", label: "集成应用" },
  { id: "releases", label: "发布配置" },
  { id: "webhooks", label: "Webhooks" },
])

const currentColumns = computed(() => {
  if (activeTab.value === "releases") return releaseColumns
  if (activeTab.value === "webhooks") return webhookColumns
  return integrationColumns
})

const currentRows = computed<Record<string, unknown>[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const rows = activeTab.value === "releases"
    ? releaseRows
    : activeTab.value === "webhooks"
      ? webhookRows
      : integrationRows

  return rows.filter(row => {
    if (!query) return true
    return Object.values(row).join(" ").toLowerCase().includes(query)
  }) as unknown as Record<string, unknown>[]
})

const currentSearchPlaceholder = computed(() => {
  if (activeTab.value === "releases") return "搜索平台、版本或渠道"
  if (activeTab.value === "webhooks") return "搜索 webhook、事件或目标地址"
  return "搜索应用、类型或 adapter"
})

const emptyState = computed<TablePageEmptyState>(() => ({
  title: searchQuery.value.trim() ? "没有匹配结果" : "暂无应用配置",
  description: searchQuery.value.trim() ? "换个关键词试试。" : `当前 API baseUrl 为 ${props.state.apiBaseUrl}。`,
  icon: searchQuery.value.trim() ? "ri-search-line" : "ri-apps-2-line",
}))

const rowActions = computed<TableRowAction[]>(() => [
  {
    key: "edit",
    label: "配置",
    icon: "ri-settings-3-line",
    onClick: row => toast.info(`配置 ${String(row.name ?? row.platform)}`),
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
  toast.success("已刷新应用 mock")
}

function triggerPrimaryAction() {
  const labels: Record<AppsTabKey, string> = {
    integrations: "添加集成入口已保留。",
    releases: "发布版本入口已保留。",
    webhooks: "创建 Webhook 入口已保留。",
  }
  toast.info(labels[activeTab.value])
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
            :model-value="activeTab"
            :collapse-inactive="false"
            tone="default"
            aria-label="应用设置页签切换"
            @update:model-value="activeTab = $event as AppsTabKey"
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
            <span>{{ activeTab === "releases" ? "发布版本" : activeTab === "webhooks" ? "创建 Webhook" : "添加集成" }}</span>
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
