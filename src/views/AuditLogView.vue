<script setup lang="ts">
import TablePage from "@/components/table-page/TablePage.vue"
import { useTablePage } from "@/components/table-page/useTablePage"
import type { TableStatusCellRenderer } from "@/components/table-page/types"
import { auditLogs, type AuditLogRecord } from "@/examples/data"

type AuditRow = AuditLogRecord & {
  levelLabel: string
}

const levelLabelMap: Record<AuditLogRecord["level"], string> = {
  info: "信息",
  warning: "警告",
  danger: "风险",
}
const levelRenderer: TableStatusCellRenderer = {
  kind: "status",
  map: {
    信息: { tone: "blue", icon: "dot" },
    警告: { tone: "orange", icon: "clock" },
    风险: { tone: "red", icon: "alert" },
  },
}
const rows: AuditRow[] = auditLogs.map(log => ({
  ...log,
  levelLabel: levelLabelMap[log.level],
}))
const page = useTablePage<AuditRow>({
  title: "审计日志",
  description: "展示通用后台的只读列表、状态徽标和筛选能力。",
  rowKey: "id",
  data: rows,
  columns: [
    {
      key: "action",
      label: "操作",
      width: "fill",
      cellRenderer: {
        kind: "dual-stack",
        primaryKey: "action",
        secondaryKey: "target",
      },
      filter: {
        type: "text",
        defaultVisible: true,
        placeholder: "搜索操作、对象或人员",
        value: row => `${row.actor} ${row.action} ${row.target}`,
      },
      sort: true,
    },
    {
      key: "actor",
      label: "操作者",
      filter: {
        type: "tag",
        defaultVisible: true,
      },
    },
    {
      key: "levelLabel",
      label: "级别",
      cellRenderer: levelRenderer,
      filter: {
        type: "tag",
      },
    },
    {
      key: "createdAt",
      label: "发生时间",
      sort: true,
    },
  ],
  sort: {
    initialField: "createdAt",
    initialDirection: "desc",
  },
})
</script>

<template>
  <TablePage :page="page" />
</template>
