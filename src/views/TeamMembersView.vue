<script setup lang="ts">
import TablePage from "@/components/table-page/TablePage.vue"
import { useTablePage } from "@/components/table-page/useTablePage"
import type { TableStatusCellRenderer } from "@/components/table-page/types"
import { teamMembers, type TeamMemberRecord } from "@/examples/data"

type TeamRow = TeamMemberRecord & {
  statusLabel: string
}

const statusMap: Record<TeamMemberRecord["status"], string> = {
  active: "正常",
  invited: "待邀请",
  disabled: "停用",
}
const statusRenderer: TableStatusCellRenderer = {
  kind: "status",
  map: {
    正常: { tone: "green", icon: "check" },
    待邀请: { tone: "orange", icon: "clock" },
    停用: { tone: "gray", icon: "minus" },
  },
}
const rows: TeamRow[] = teamMembers.map(member => ({
  ...member,
  statusLabel: statusMap[member.status],
}))
const page = useTablePage<TeamRow>({
  title: "团队成员",
  description: "用户数据使用 mock，权限边界由 Drawbridge adapter 接管。",
  rowKey: "id",
  data: rows,
  tabs: {
    mode: "enum",
    all: { label: "全部", value: "all" },
    field: "statusLabel",
  },
  columns: [
    {
      key: "name",
      label: "成员",
      width: "fill",
      cellRenderer: {
        kind: "dual-stack",
        primaryKey: "name",
        secondaryKey: "email",
      },
      filter: {
        type: "text",
        defaultVisible: true,
        placeholder: "搜索姓名、邮箱或角色",
        value: row => `${row.name} ${row.email} ${row.role}`,
      },
      sort: true,
    },
    {
      key: "role",
      label: "角色",
      filter: {
        type: "tag",
        defaultVisible: true,
      },
    },
    {
      key: "statusLabel",
      label: "状态",
      cellRenderer: statusRenderer,
      filter: {
        type: "tag",
      },
    },
    {
      key: "lastSeen",
      label: "最近在线",
      sort: true,
    },
  ],
})
</script>

<template>
  <TablePage :page="page" />
</template>
