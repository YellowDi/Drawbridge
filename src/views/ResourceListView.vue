<script setup lang="ts">
import { useRouter } from "vue-router"

import TableServerPagination from "@/components/table-page/TableServerPagination.vue"
import TablePage from "@/components/table-page/TablePage.vue"
import { useServerTablePage } from "@/components/table-page/useServerTablePage"
import type { TableStatusCellRenderer } from "@/components/table-page/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { projects, type ProjectRecord } from "@/examples/data"
import { fetchProjectPage } from "@/examples/mock-api"

type ResourceRow = ProjectRecord & {
  statusLabel: string
}

const router = useRouter()
const statusLabelMap: Record<ProjectRecord["status"], string> = {
  active: "运行中",
  paused: "已暂停",
  draft: "草稿",
}
const statusRenderer: TableStatusCellRenderer = {
  kind: "status",
  map: {
    运行中: { tone: "green", icon: "check" },
    已暂停: { tone: "orange", icon: "clock" },
    草稿: { tone: "gray", icon: "dot" },
  },
}
const ownerOptions = Array.from(new Set(projects.map(project => project.owner)))
  .map(owner => ({ value: owner, label: owner }))
const {
  page,
  loading,
  errorMessage,
  pageNum,
  pageSize,
  total,
  queryBar,
  exportRowsResolver,
  load,
  handleQueryChange,
  handleQueryClear,
} = useServerTablePage<ResourceRow>({
  pageSize: 5,
  routeQuery: true,
  serverTabs: {
    key: "status",
    queryKey: "status",
    all: { label: "全部", value: "" },
    options: [
      { label: "运行中", value: "active" },
      { label: "已暂停", value: "paused" },
      { label: "草稿", value: "draft" },
    ],
  },
  queryControls: [
    {
      type: "search",
      key: "keyword",
      queryKey: "q",
      label: "关键词",
      icon: "ri-search-line",
      placeholder: "项目、负责人或编号",
      expandedWidth: 260,
      collapsedMaxWidth: 260,
    },
    {
      type: "select",
      key: "owner",
      queryKey: "owner",
      label: "负责人",
      icon: "ri-user-line",
      options: ownerOptions,
      placeholder: "选择负责人",
      expandedWidth: 220,
      collapsedMaxWidth: 220,
    },
  ],
  loader: async ({ page, pageSize, query }) => {
    const result = await fetchProjectPage({
      page,
      pageSize,
      keyword: toQueryText(query.keyword),
      owner: toQueryText(query.owner),
      status: toProjectStatusQuery(query.status),
    })

    return {
      rows: result.data.map(toResourceRow),
      total: result.total,
      tabCounts: result.tabCounts,
    }
  },
  schema: {
    title: "项目管理",
    description: "服务端分页列表示例。真实项目替换 loader 即可接入 API。",
    rowKey: "id",
    primaryActionLabel: "新建项目",
    showIndex: false,
    stickyHeader: true,
    sort: {
      initialField: "lastDeploy",
      initialDirection: "desc",
    },
    emptyState: {
      title: "暂无项目",
      description: "替换 mock 数据或接入服务端接口后会显示真实记录。",
      icon: "ri-folder-3-line",
    },
    columns: [
      {
        key: "name",
        label: "项目",
        width: "fill",
        cellRenderer: {
          kind: "dual-stack",
          primaryKey: "name",
          secondaryKey: "id",
        },
        filter: {
          type: "text",
          defaultVisible: true,
          placeholder: "搜索项目、负责人或日期",
          value: row => `${row.name} ${row.owner} ${row.id} ${row.lastDeploy}`,
        },
        sort: true,
      },
      {
        key: "owner",
        label: "负责人",
        filter: {
          type: "tag",
          defaultVisible: true,
        },
        sort: true,
      },
      {
        key: "statusLabel",
        label: "状态",
        cellRenderer: statusRenderer,
        filter: {
          type: "tag",
          defaultVisible: true,
        },
      },
      {
        key: "modules",
        label: "模块数",
        variant: "metric",
        filterType: "number",
        sort: {
          kind: "metric",
        },
      },
      {
        key: "health",
        label: "健康度",
        cellRenderer: {
          kind: "metric-unit",
          unit: "%",
        },
        sort: {
          kind: "metric",
        },
      },
      {
        key: "lastDeploy",
        label: "最近部署",
        sort: true,
      },
    ],
    rowActions: [
      {
        key: "detail",
        label: "查看详情",
        onClick: row => void router.push(`/projects/${row.id}`),
      },
      {
        key: "edit",
        label: "编辑",
        onClick: row => void router.push(`/projects/${row.id}/edit`),
      },
    ],
    onRowClick: row => void router.push(`/projects/${row.id}`),
  },
})

function createProject() {
  void router.push("/projects/new")
}

function toResourceRow(project: ProjectRecord): ResourceRow {
  return {
    ...project,
    statusLabel: statusLabelMap[project.status],
  }
}

function toQueryText(value: string | string[] | undefined) {
  return typeof value === "string" ? value : ""
}

function toProjectStatusQuery(value: string | string[] | undefined) {
  return value === "active" || value === "paused" || value === "draft" ? value : ""
}
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col">
    <div v-if="errorMessage" class="px-4 pb-3 pt-3">
      <Alert variant="destructive">
        <i class="ri-error-warning-line" />
        <AlertTitle>列表加载失败</AlertTitle>
        <AlertDescription class="flex flex-wrap items-center gap-3">
          <span>{{ errorMessage }}</span>
          <Button size="sm" variant="outline" class="gap-2" @click="load">
            <i class="ri-refresh-line text-sm" />
            重试
          </Button>
        </AlertDescription>
      </Alert>
    </div>

    <TablePage
      :page="page"
      :loading="loading"
      :query-bar="queryBar"
      :export-rows-resolver="exportRowsResolver"
      :export-filtered-rows-count="total"
      :export-total-rows-count="total"
      fill-available-height
      @refresh-action="load"
      @primary-action="createProject"
      @query-change="handleQueryChange"
      @query-clear="handleQueryClear"
    >
      <template #footer>
        <TableServerPagination
          v-model:page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :disabled="loading"
        />
      </template>
    </TablePage>
  </section>
</template>
