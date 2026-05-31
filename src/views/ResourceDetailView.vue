<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import DetailAccordionModule from "@/components/detail/DetailAccordionModule.vue"
import DetailFieldSections from "@/components/detail/DetailFieldSections.vue"
import DetailRelationModule from "@/components/detail/DetailRelationModule.vue"
import DetailTabActionsGroup from "@/components/detail/DetailTabActionsGroup.vue"
import type { DetailFieldSection, DetailRelationModuleSchema } from "@/components/detail/types"
import type { TableStatusCellRenderer } from "@/components/table-page/types"
import { Button } from "@/components/ui/button"
import { getProjectById, projects, type ProjectRecord } from "@/examples/data"
import DetailLayout from "@/layouts/DetailLayout.vue"

type ModuleRow = {
  key: string
  name: string
  owner: string
  status: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()
const activeTab = ref("overview")
const project = computed(() => getProjectById(String(route.params.id ?? "")))
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
const detailSections = computed<DetailFieldSection[]>(() => {
  if (!project.value) return []

  const statusLabel = statusLabelMap[project.value.status]

  return [
    {
      key: "basic",
      title: "基础信息",
      rows: [
        { key: "id", label: "项目编号", value: project.value.id },
        {
          key: "owner",
          label: "负责人",
          value: {
            kind: "contact",
            name: project.value.owner,
            phone: "mock@example.com",
          },
        },
        {
          key: "status",
          label: "状态",
          value: {
            kind: "status",
            value: statusLabel,
            renderer: statusRenderer,
          },
        },
        { key: "modules", label: "模块数", value: project.value.modules },
        { key: "health", label: "健康度", value: `${project.value.health}%` },
        { key: "lastDeploy", label: "最近部署", value: project.value.lastDeploy },
      ],
    },
    {
      key: "template",
      title: "模板能力",
      rows: [
        { key: "menu", label: "菜单配置", value: "drawbridge.config.ts 驱动" },
        { key: "permission", label: "权限适配", value: "adapter mock，可替换为真实 RBAC" },
        { key: "api", label: "API 接入", value: "api-client.ts / auth-session.ts" },
        { key: "deploy", label: "部署方式", value: "Vite 静态产物，可部署到任意静态服务器" },
      ],
    },
  ]
})
const relationSchema = computed<DetailRelationModuleSchema<ModuleRow>>(() => ({
  key: "modules",
  title: "扩展模块",
  count: 6,
  rowKey: "key",
  columnTemplateMobile: "minmax(160px,1.4fr) minmax(96px,1fr) minmax(90px,0.8fr)",
  columnTemplateDesktop: "minmax(180px,1.4fr) minmax(120px,1fr) minmax(96px,0.8fr) minmax(150px,1fr)",
  columns: [
    { key: "name", label: "模块" },
    { key: "owner", label: "维护人" },
    { key: "status", label: "状态" },
    { key: "updatedAt", label: "更新时间" },
  ],
  groups: [
    {
      key: "core",
      title: "核心模板",
      rows: [
        { key: "menu", name: "菜单配置", owner: "Platform", status: "可替换", updatedAt: "2026-05-29" },
        { key: "permission", name: "权限适配", owner: "Platform", status: "可替换", updatedAt: "2026-05-29" },
        { key: "api", name: "API Client", owner: "Platform", status: "可接入", updatedAt: "2026-05-28" },
      ],
    },
    {
      key: "surface",
      title: "页面模式",
      rows: [
        { key: "table", name: "TablePage", owner: "Template", status: "mock", updatedAt: "2026-05-31" },
        { key: "detail", name: "DetailLayout", owner: "Template", status: "mock", updatedAt: "2026-05-31" },
        { key: "form", name: "FormPage", owner: "Template", status: "mock", updatedAt: "2026-05-31" },
      ],
    },
  ],
}))
const activitySchema = computed(() => ({
  key: "activity",
  title: "活动记录",
  count: 3,
  emptyText: "暂无活动",
  items: [
    { key: "a1", title: "更新菜单配置", meta: "2026-05-31", defaultOpen: true },
    { key: "a2", title: "同步 shadcn-vue primitives", meta: "2026-05-30" },
    { key: "a3", title: "生成 mock 列表和详情页", meta: "2026-05-29" },
  ],
}))
const tabs = computed(() => [
  { id: "overview", label: "概览", active: activeTab.value === "overview" },
  { id: "modules", label: "扩展模块", active: activeTab.value === "modules" },
  { id: "activity", label: "活动记录", active: activeTab.value === "activity" },
])
const siblingProjects = computed(() => projects.filter(item => item.id !== project.value?.id).slice(0, 3))

function goBack() {
  void router.push("/projects")
}
</script>

<template>
  <DetailLayout
    :title="project?.name ?? '项目不存在'"
    :subtitle="project ? `${project.owner} · ${project.id}` : ''"
    :empty="!project"
    empty-text="未找到项目"
    back-label="返回列表"
    :tabs="tabs"
    @back="goBack"
    @tab-click="activeTab = $event"
  >
    <template #actions>
      <DetailTabActionsGroup
        :mobile-items="[
          { key: 'edit', label: '编辑', iconClass: 'ri-edit-line' },
          { key: 'deploy', label: '部署', iconClass: 'ri-rocket-line' },
        ]"
        @select="key => key === 'edit' ? router.push(`/projects/${project?.id}/edit`) : undefined"
      >
        <template #trailing>
          <Button variant="outline" size="sm" @click="router.push(`/projects/${project?.id}/edit`)">
            <i class="ri-edit-line" />
            编辑
          </Button>
          <Button size="sm">
            <i class="ri-rocket-line" />
            部署
          </Button>
        </template>
      </DetailTabActionsGroup>
    </template>

    <template #primary>
      <DetailFieldSections
        v-if="activeTab === 'overview'"
        :sections="detailSections"
      />
      <DetailRelationModule
        v-else-if="activeTab === 'modules'"
        :schema="relationSchema"
      />
      <DetailAccordionModule
        v-else
        :schema="activitySchema"
      />
    </template>

    <template #secondary>
      <DetailFieldSections
        :sections="[
          {
            key: 'runtime',
            title: '运行状态',
            rows: [
              { key: 'health', label: '构建健康度', value: project ? `${project.health}%` : '-' },
              { key: 'deploy', label: '最近部署', value: project?.lastDeploy ?? '-' },
              { key: 'mode', label: '数据来源', value: 'Mock adapter' },
            ],
          },
          {
            key: 'related',
            title: '关联示例',
            rows: siblingProjects.map(item => ({
              key: item.id,
              label: item.id,
              value: item.name,
              linkAction: {
                onClick: () => router.push(`/projects/${item.id}`),
              },
            })),
          },
        ]"
        compact
      />
    </template>
  </DetailLayout>
</template>
