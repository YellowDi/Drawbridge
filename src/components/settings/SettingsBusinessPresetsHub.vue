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

type PresetTabKey = "status" | "priority" | "tags"

type PresetRow = {
  id: string
  name: string
  code: string
  sort: number
  remark: string
}

const activeTab = ref<PresetTabKey>("status")
const searchExpanded = ref(false)
const searchQuery = ref("")

const presetGroups: Record<PresetTabKey, { label: string, rows: PresetRow[] }> = {
  status: {
    label: "状态",
    rows: [
      { id: "draft", name: "草稿", code: "draft", sort: 10, remark: "新建后尚未发布的记录。" },
      { id: "active", name: "运行中", code: "active", sort: 20, remark: "可被用户访问或处理。" },
      { id: "paused", name: "已暂停", code: "paused", sort: 30, remark: "暂时停止流转，保留历史状态。" },
    ],
  },
  priority: {
    label: "优先级",
    rows: [
      { id: "p0", name: "最高", code: "P0", sort: 1, remark: "影响核心路径，需要立即处理。" },
      { id: "p1", name: "高", code: "P1", sort: 2, remark: "影响重要用户或重要流程。" },
      { id: "p2", name: "普通", code: "P2", sort: 3, remark: "纳入常规迭代。" },
    ],
  },
  tags: {
    label: "标签",
    rows: [
      { id: "template", name: "模板能力", code: "template", sort: 10, remark: "用于标记可复用框架能力。" },
      { id: "adapter", name: "Adapter", code: "adapter", sort: 20, remark: "用于标记需要项目接入的数据边界。" },
      { id: "deploy", name: "部署", code: "deploy", sort: 30, remark: "用于部署文档和环境配置。" },
    ],
  },
}

const tabs = computed(() => (Object.entries(presetGroups) as Array<[PresetTabKey, { label: string }]>).map(([id, group]) => ({
  id,
  label: group.label,
})))

const tableColumns: TableColumn[] = [
  {
    key: "name",
    label: "条目名称",
    filterType: "text",
    emphasis: "strong",
    tone: "primary",
    cellClass: "font-medium text-foreground",
  },
  {
    key: "code",
    label: "编码",
    filterType: "text",
    tone: "muted",
    cellClass: "font-mono text-[12px] text-muted-foreground",
  },
  {
    key: "sort",
    label: "排序",
    filterType: "number",
    format: "numeric",
  },
  {
    key: "remark",
    label: "备注",
    filterType: "text",
    tone: "muted",
    variant: "note",
    width: "fill",
    cellRenderer: { kind: "note" },
  },
]

const filteredRows = computed<Record<string, unknown>[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const rows = presetGroups[activeTab.value].rows

  return rows.filter(row => {
    if (!query) return true
    return Object.values(row).join(" ").toLowerCase().includes(query)
  }) as unknown as Record<string, unknown>[]
})

const emptyState = computed<TablePageEmptyState>(() => ({
  title: searchQuery.value.trim() ? "没有匹配的条目" : "暂无字典条目",
  description: searchQuery.value.trim() ? "换个关键词试试。" : "当前类型下还没有条目。",
  icon: searchQuery.value.trim() ? "ri-search-line" : "ri-list-check-3",
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
  toast.success("已刷新预设 mock")
}

function triggerPrimaryAction() {
  toast.info(`添加${presetGroups[activeTab.value].label}条目入口已保留。`)
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
            aria-label="预设类型切换"
            @update:model-value="activeTab = $event as PresetTabKey"
          />
        </template>

        <div class="flex flex-nowrap items-center justify-end gap-1">
          <SettingsToolbarSearchInput
            v-model="searchQuery"
            :expanded="searchExpanded"
            placeholder="搜索条目名称、编码或备注"
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
            <span>添加条目</span>
          </Button>
        </div>
      </SettingsToolbarRow>
    </template>

    <SettingsTable
      :columns="tableColumns"
      :rows="filteredRows"
      row-key="id"
      :row-actions="rowActions"
      :empty-state="emptyState"
    />
  </SettingsRightPanelLayout>
</template>
