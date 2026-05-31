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

type InspectionHubTabKey = "items" | "categories" | "templates"

const activeTab = ref<InspectionHubTabKey>("items")
const searchExpanded = ref(false)
const searchQueries = ref<Record<InspectionHubTabKey, string>>({
  items: "",
  categories: "",
  templates: "",
})

const tabs = computed(() => [
  { id: "items", label: "检查项" },
  { id: "categories", label: "分类" },
  { id: "templates", label: "模板" },
])

const itemsRows = [
  { id: "item-access", name: "权限入口校验", category: "基础能力", content: "验证路由、菜单和按钮权限是否按 adapter 生效。", required: "是" },
  { id: "item-table", name: "表格查询能力", category: "页面模式", content: "验证搜索、筛选、分页和行操作是否稳定。", required: "是" },
  { id: "item-deploy", name: "部署配置检查", category: "交付", content: "确认 base path、环境变量和静态资源路径。", required: "否" },
]

const categoryRows = [
  { id: "cat-basic", name: "基础能力", sort: 10, itemCount: 4, remark: "导航、权限、主题和布局。" },
  { id: "cat-page", name: "页面模式", sort: 20, itemCount: 5, remark: "列表、详情、表单和设置页。" },
  { id: "cat-delivery", name: "交付", sort: 30, itemCount: 3, remark: "构建、预览和部署。" },
]

const templateRows = [
  { id: "tpl-admin", name: "后台项目交付检查", categories: ["基础能力", "页面模式", "交付"], itemCount: 12, updatedAt: "2026-06-01 10:00" },
  { id: "tpl-api", name: "API 接入检查", categories: ["基础能力", "交付"], itemCount: 7, updatedAt: "2026-05-30 15:40" },
]

const itemColumns: TableColumn[] = [
  { key: "name", label: "检查项", filterType: "text", emphasis: "strong", tone: "primary", cellClass: "font-medium text-foreground" },
  { key: "category", label: "分类", filterType: "tag", tone: "muted" },
  { key: "content", label: "内容", filterType: "text", tone: "muted", variant: "note", width: "fill", cellRenderer: { kind: "note" } },
  { key: "required", label: "必填", filterType: "tag", tone: "muted" },
]

const categoryColumns: TableColumn[] = [
  { key: "name", label: "分类", filterType: "text", emphasis: "strong", tone: "primary", cellClass: "font-medium text-foreground" },
  { key: "sort", label: "排序", filterType: "number", format: "numeric" },
  { key: "itemCount", label: "检查项", filterType: "number", format: "numeric" },
  { key: "remark", label: "备注", filterType: "text", tone: "muted", variant: "note", width: "fill", cellRenderer: { kind: "note" } },
]

const templateColumns: TableColumn[] = [
  { key: "name", label: "模板", filterType: "text", emphasis: "strong", tone: "primary", cellClass: "font-medium text-foreground" },
  {
    key: "categories",
    label: "分类",
    filterType: "tag",
    cellRenderer: {
      kind: "tags",
      itemClass: "rounded bg-muted px-1.5 py-0.5 text-[12px] text-muted-foreground",
    },
  },
  { key: "itemCount", label: "检查项", filterType: "number", format: "numeric" },
  { key: "updatedAt", label: "更新时间", filterType: "text", tone: "muted", width: "fill" },
]

const currentSearchQuery = computed({
  get: () => searchQueries.value[activeTab.value],
  set: (value: string) => {
    searchQueries.value[activeTab.value] = value
  },
})

const currentColumns = computed(() => {
  if (activeTab.value === "categories") return categoryColumns
  if (activeTab.value === "templates") return templateColumns
  return itemColumns
})

const currentRows = computed<Record<string, unknown>[]>(() => {
  const query = currentSearchQuery.value.trim().toLowerCase()
  const rows = activeTab.value === "categories"
    ? categoryRows
    : activeTab.value === "templates"
      ? templateRows
      : itemsRows

  return rows.filter(row => {
    if (!query) return true
    return Object.values(row).flat().join(" ").toLowerCase().includes(query)
  }) as unknown as Record<string, unknown>[]
})

const currentSearchPlaceholder = computed(() => {
  if (activeTab.value === "items") return "搜索检查项、分类、内容"
  if (activeTab.value === "categories") return "搜索分类名称或备注"
  return "搜索模板名称或分类"
})

const actionLabel = computed(() => {
  if (activeTab.value === "items") return "添加检查项"
  if (activeTab.value === "categories") return "添加分类"
  return "添加模板"
})

const emptyState = computed<TablePageEmptyState>(() => ({
  title: currentSearchQuery.value.trim() ? "没有匹配结果" : "暂无配置",
  description: currentSearchQuery.value.trim() ? "换个关键词试试。" : "真实项目可接入检查模板 API。",
  icon: currentSearchQuery.value.trim() ? "ri-search-line" : "ri-shield-check-line",
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
  if (searchExpanded.value && currentSearchQuery.value) {
    currentSearchQuery.value = ""
    return
  }
  searchExpanded.value = !searchExpanded.value
}

function refreshData() {
  toast.success("已刷新检查配置 mock")
}

function triggerPrimaryAction() {
  toast.info(`${actionLabel.value}入口已保留。`)
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
            aria-label="检查配置页签切换"
            @update:model-value="activeTab = $event as InspectionHubTabKey"
          />
        </template>

        <div class="flex flex-nowrap items-center justify-end gap-1">
          <SettingsToolbarSearchInput
            v-model="currentSearchQuery"
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
            <span>{{ actionLabel }}</span>
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
