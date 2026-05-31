export type ProjectStatus = "active" | "paused" | "draft"

export type ProjectRecord = {
  id: string
  name: string
  owner: string
  status: ProjectStatus
  modules: number
  lastDeploy: string
  health: number
}

export type TeamMemberRecord = {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "invited" | "disabled"
  lastSeen: string
}

export type AuditLogRecord = {
  id: string
  actor: string
  action: string
  target: string
  level: "info" | "warning" | "danger"
  createdAt: string
}

export const projects: ProjectRecord[] = [
  {
    id: "prj-1024",
    name: "Northwind Operations",
    owner: "Maya Lin",
    status: "active",
    modules: 12,
    lastDeploy: "2026-05-29 18:20",
    health: 98,
  },
  {
    id: "prj-1025",
    name: "Atlas Finance Console",
    owner: "Victor Zhou",
    status: "active",
    modules: 9,
    lastDeploy: "2026-05-28 09:12",
    health: 94,
  },
  {
    id: "prj-1026",
    name: "Beacon Service Desk",
    owner: "Iris Wang",
    status: "paused",
    modules: 7,
    lastDeploy: "2026-05-20 15:44",
    health: 87,
  },
  {
    id: "prj-1027",
    name: "Harbor Content Admin",
    owner: "Noah Sun",
    status: "draft",
    modules: 4,
    lastDeploy: "-",
    health: 72,
  },
  {
    id: "prj-1028",
    name: "Cedar Identity Hub",
    owner: "Maya Lin",
    status: "active",
    modules: 8,
    lastDeploy: "2026-05-27 14:08",
    health: 91,
  },
  {
    id: "prj-1029",
    name: "Quartz Billing Center",
    owner: "Victor Zhou",
    status: "paused",
    modules: 6,
    lastDeploy: "2026-05-25 11:36",
    health: 83,
  },
  {
    id: "prj-1030",
    name: "Summit Partner Portal",
    owner: "Iris Wang",
    status: "active",
    modules: 11,
    lastDeploy: "2026-05-24 17:22",
    health: 96,
  },
  {
    id: "prj-1031",
    name: "Lumen Data Console",
    owner: "Alex Chen",
    status: "draft",
    modules: 5,
    lastDeploy: "-",
    health: 76,
  },
  {
    id: "prj-1032",
    name: "Orbit Review Workspace",
    owner: "Noah Sun",
    status: "active",
    modules: 10,
    lastDeploy: "2026-05-22 20:10",
    health: 93,
  },
  {
    id: "prj-1033",
    name: "Pioneer Ops Desk",
    owner: "Maya Lin",
    status: "paused",
    modules: 7,
    lastDeploy: "2026-05-18 08:44",
    health: 86,
  },
  {
    id: "prj-1034",
    name: "Meridian Reporting Admin",
    owner: "Alex Chen",
    status: "active",
    modules: 13,
    lastDeploy: "2026-05-17 16:30",
    health: 95,
  },
  {
    id: "prj-1035",
    name: "Signal Workflow Studio",
    owner: "Iris Wang",
    status: "draft",
    modules: 3,
    lastDeploy: "-",
    health: 69,
  },
]

export const teamMembers: TeamMemberRecord[] = [
  {
    id: "usr-001",
    name: "Alex Chen",
    email: "alex@example.com",
    role: "Platform Admin",
    status: "active",
    lastSeen: "刚刚",
  },
  {
    id: "usr-002",
    name: "Maya Lin",
    email: "maya@example.com",
    role: "Product Owner",
    status: "active",
    lastSeen: "12 分钟前",
  },
  {
    id: "usr-003",
    name: "Victor Zhou",
    email: "victor@example.com",
    role: "Developer",
    status: "invited",
    lastSeen: "等待接受邀请",
  },
  {
    id: "usr-004",
    name: "Iris Wang",
    email: "iris@example.com",
    role: "Auditor",
    status: "disabled",
    lastSeen: "2026-05-12",
  },
]

export const auditLogs: AuditLogRecord[] = [
  {
    id: "log-901",
    actor: "Alex Chen",
    action: "发布生产部署",
    target: "Northwind Operations",
    level: "info",
    createdAt: "2026-05-31 10:30",
  },
  {
    id: "log-902",
    actor: "Maya Lin",
    action: "修改权限策略",
    target: "Atlas Finance Console",
    level: "warning",
    createdAt: "2026-05-30 16:12",
  },
  {
    id: "log-903",
    actor: "System",
    action: "拒绝不安全 API 配置",
    target: "Harbor Content Admin",
    level: "danger",
    createdAt: "2026-05-29 21:08",
  },
  {
    id: "log-904",
    actor: "Victor Zhou",
    action: "新增表格页面",
    target: "Beacon Service Desk",
    level: "info",
    createdAt: "2026-05-28 11:42",
  },
]

export function getProjectById(id: string) {
  return projects.find(project => project.id === id) ?? null
}
