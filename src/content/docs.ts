export type DocsSection = {
  id: string
  title: string
  summary: string
  points: string[]
  code?: string
}

export const docsSections: DocsSection[] = [
  {
    id: "quick-start",
    title: "快速开始",
    summary: "Drawbridge 是一个可复用后台管理模板。默认包含工作台、配置式列表、详情页、表单页、设置页和在线文档。",
    points: [
      "运行 `pnpm install` 安装依赖。",
      "运行 `pnpm dev --host 127.0.0.1 --port 5174` 启动开发服务。",
      "运行 `pnpm build` 完成类型检查和生产构建。",
      "新项目先改 `src/config/drawbridge.config.ts`，再替换示例数据和页面。",
    ],
    code: "pnpm install\npnpm dev --host 127.0.0.1 --port 5174\npnpm build",
  },
  {
    id: "structure",
    title: "目录结构",
    summary: "模板按框架能力和业务示例分层，后续项目应优先复用 components、layouts、composables、lib 和 styles。",
    points: [
      "`components/ui` 放低层 UI 原语。",
      "`components/table-page`、`detail`、`form` 放页面模式。",
      "`layouts` 放应用壳，不写具体业务。",
      "`config` 放品牌、菜单、权限、快捷入口和 shell 行为。",
      "`examples` 和 `views` 是示例，可按项目替换。",
      "`lib/api-client.ts` 和 `lib/auth-session.ts` 是真实 API/认证接入起点。",
    ],
    code: "src/\n  config/\n  layouts/\n  components/\n    ui/\n    table-page/\n    detail/\n    form/\n  composables/\n  lib/\n  examples/\n  views/\n  content/\n  styles/",
  },
  {
    id: "ui-primitives",
    title: "shadcn-vue 基座",
    summary: "Drawbridge 已迁入 buildguard-admin 基于 shadcn-vue 改造过的通用 primitives，并以它们作为后续页面模式的基础。",
    points: [
      "`components/ui/button` 使用 class-variance-authority 和 reka-ui Primitive。",
      "`sidebar`、`popover`、`dialog`、`sheet`、`tabs`、`dropdown-menu`、`breadcrumb`、`select/native-select`、`calendar`、`pagination` 和 `sonner` 来自原项目通用层。",
      "`empty`、`skeleton`、`alert-dialog`、`button-group`、`status-badge`、`separator` 保留了 buildguard-admin 的交互和视觉细节。",
      "弹层、空态、骨架、状态徽标和按钮交互应复用这些 primitives，不再手写近似样式。",
      "未迁移业务专用组件，例如地图、上传、报告、工单媒体面板等。",
    ],
    code: "import { Button } from '@/components/ui/button'\nimport { Dialog, DialogContent } from '@/components/ui/dialog'\nimport { StatusBadge } from '@/components/ui/status-badge'\nimport { TooltipWrap } from '@/components/ui/tooltip'",
  },
  {
    id: "shell",
    title: "应用壳配置",
    summary: "AppShell、Header 和 Sidebar 只消费 DrawbridgeConfig，不直接耦合业务系统。项目级差异通过 shell、brand、navItems、quickActions 和 user 注入。",
    points: [
      "`shell.sidebar` 控制侧栏宽度、导航 aria label、Logo 和用户卡片展示。",
      "侧栏顶部胶囊切换保留原项目交互：工作台、对话、日历、收件箱使用同一 AppShell 边界和本地 mock 数据。",
      "进入 `/settings/:category?` 时侧栏切换为设置目录；离开设置页后恢复主导航内容。",
      "`shell.header` 控制面包屑、描述、快捷入口和主题切换；默认关闭附加操作以贴近 buildguard-admin 顶栏。",
      "`shell.content.padding` 控制主内容密度。",
      "Header 的标题和描述来自 route meta；Sidebar 的高亮路径来自 `meta.navActivePath`。",
    ],
    code: "export const drawbridgeConfig = {\n  brand: { name: 'Drawbridge', shortName: 'DB', accentColor: '#0075de' },\n  shell: {\n    sidebar: { width: '255px', showUserCard: true },\n    header: { showBreadcrumb: true, showDescription: false, showQuickActions: false },\n    content: { padding: 'comfortable' },\n  },\n}",
  },
  {
    id: "menu-routes",
    title: "菜单和路由",
    summary: "菜单负责入口展示，路由负责页面装载和权限守卫。两者通过 path、permission 和 navActivePath 保持松耦合。",
    points: [
      "`navItems` 可以配置一级菜单、子菜单、徽标和分隔项。",
      "路由 `meta.permission` 会被 router guard 校验。",
      "详情页或表单页用 `meta.navActivePath` 指回列表菜单。",
      "设置页使用 `settings/:category?`，分类 key 集中在 `components/settings/types.ts`。",
      "复杂项目可以从后端加载菜单，再转换为 DrawbridgeNavItem。",
    ],
    code: "{\n  path: 'projects/:id',\n  component: ProjectDetailView,\n  meta: {\n    title: '项目详情',\n    permission: 'projects.view',\n    navActivePath: '/projects',\n  },\n}",
  },
  {
    id: "permissions",
    title: "权限接入",
    summary: "权限只通过 adapter 暴露给布局、路由和页面。模板不关心角色来源，也不内置业务权限码。",
    points: [
      "`permissions.canAccess(permission)` 用于菜单、快捷入口和路由。",
      "按钮级权限可以在页面层先过滤 action，再传给 TablePage 或 FormPage。",
      "认证失效处理应放在 API client 或 router guard，不放进 UI 组件。",
      "权限码建议按 `resource.action` 命名，例如 `projects.create`。",
    ],
    code: "const granted = new Set(['projects.view', 'projects.create'])\n\nexport const drawbridgeConfig = {\n  permissions: {\n    canAccess(permission) {\n      return !permission || granted.has(permission)\n    },\n  },\n}",
  },
  {
    id: "api",
    title: "API 和认证",
    summary: "Drawbridge 提供轻量 ApiClient 和本地 auth session 工具。真实项目只需要替换 baseUrl、token 来源和错误处理策略。",
    points: [
      "`ApiClient` 支持 query、GET/POST/PUT/PATCH/DELETE 和 Bearer token。",
      "分页接口推荐返回 `{ data, total, page, pageSize }`。",
      "页面负责 loading、error 和重试；底层表格只展示传入状态。",
      "上传 FormData 时 ApiClient 不会强制设置 JSON Content-Type。",
    ],
    code: "import { ApiClient, type PaginatedResponse } from '@/lib/api-client'\nimport { readAuthSession } from '@/lib/auth-session'\n\nconst api = new ApiClient({\n  baseUrl: import.meta.env.VITE_API_BASE_URL,\n  getToken: () => readAuthSession()?.token ?? '',\n})\n\nconst page = await api.get<PaginatedResponse<Project>>('/projects', {\n  query: { page: 1, pageSize: 20, status: 'active' },\n})",
  },
  {
    id: "table-page",
    title: "扩展列表页",
    summary: "TablePage 采用 buildguard-admin 的 schema/controller 模式。页面只声明数据、列、筛选、排序、tabs 和行操作，组件负责统一的列表体验。",
    points: [
      "`useTablePage(schema)` 是推荐入口，schema 包含 `title`、`rowKey`、`data`、`columns`、`rowActions`、`filters`、`sort`、`tabs` 和 `emptyState`。",
      "列支持 `cellRenderer`：文本、双行信息、数组、标签、进度、数值单位、状态徽标和备注。",
      "列级 `filter` 可以声明 text、number、tag、date；列级 `sort` 可以快速加入排序字段。",
      "服务端分页使用 `useServerTablePage` 维护 query/loading/total/page/pageSize，页面只替换 loader。",
      "`serverTabs` 用于服务端 tabs：点击 tab 会写入 query、同步 URL，loader 可返回 `tabCounts` 展示全量计数。",
      "设置 `routeQuery: true` 后，页码、每页条数和 `queryControls[].queryKey` 会同步到 URL，刷新和返回都能恢复列表状态。",
      "`TableServerPagination` 复用原项目 pagination primitives，可通过 footer slot 接到 TablePage 底部。",
      "行操作、主按钮、刷新、导出、选中行和空态都通过小型 props/event 边界接入。",
    ],
    code: "const table = useServerTablePage({\n  pageSize: 20,\n  routeQuery: true,\n  serverTabs: {\n    key: 'status',\n    queryKey: 'status',\n    all: { label: '全部', value: '' },\n    options: [{ label: '运行中', value: 'active' }],\n  },\n  queryControls: [{ type: 'search', key: 'keyword', queryKey: 'q', label: '关键词', icon: 'ri-search-line' }],\n  loader: async ({ page, pageSize, query }) => {\n    const result = await api.get<PaginatedResponse<Project> & { tabCounts: Record<string, number> }>('/projects', {\n      query: { page, pageSize, q: query.keyword, status: query.status },\n    })\n    return { rows: result.data, total: result.total, tabCounts: result.tabCounts }\n  },\n  schema: {\n    title: '项目管理',\n    rowKey: 'id',\n    primaryActionLabel: '新建项目',\n    columns: [{ key: 'name', label: '项目', cellRenderer: { kind: 'dual-stack', primaryKey: 'name', secondaryKey: 'id' } }],\n  },\n})\n\n<TablePage :page=\"table.page\" :loading=\"table.loading\" :query-bar=\"table.queryBar\">\n  <template #footer>\n    <TableServerPagination v-model:page=\"table.pageNum\" v-model:page-size=\"table.pageSize\" :total=\"table.total\" />\n  </template>\n</TablePage>",
  },
  {
    id: "settings",
    title: "设置页扩展",
    summary: "设置页恢复了 buildguard-admin 的侧栏分组和特色页面结构，但数据全部替换为模板级 mock。",
    points: [
      "`components/settings/types.ts` 定义分类 key、分组、状态和表单项类型。",
      "`useSettings()` 提供当前分类、状态和 action adapter，真实项目可替换为后端配置。",
      "已包含：我、偏好设置、应用、成员与角色、菜单与权限、业务预设、检查配置。",
      "表格型设置页统一使用 `SettingsTable`，底层仍是 TablePageTable。",
      "新增分类时只需在 `settings-data.ts` 加 category，并在 `SettingsContent.vue` 映射页面组件。",
    ],
    code: "const category = {\n  key: 'members',\n  group: 'workspace',\n  label: '成员与角色',\n  icon: 'ri-team-line',\n  sections: [],\n}\n\nrouter.push({ name: 'settings', params: { category: 'members' } })",
  },
  {
    id: "detail-form",
    title: "详情页和表单页",
    summary: "详情页保留 sticky header、主栏、侧栏、tabs、空态和 actions；表单页统一返回、提交、取消、错误展示和保存态。",
    points: [
      "详情页使用 `layouts/DetailLayout.vue` 承载 sticky header、返回、tabs、actions、主栏和侧栏。",
      "`DetailFieldSections` 使用原项目字段行/分隔线结构，页面层只需把接口结果转成 sections。",
      "`DetailRelationModule`、`DetailAccordionModule` 和 `DetailTabActionsGroup` 可组合出表格关系、折叠信息和 tab 右侧动作。",
      "`FormPage` 支持 header actions、before/after/footer/side slot、error、loading、saving、右侧 quick nav 和不同最大宽度。",
      "`FormBodyLoading` 和 `FormPageLoading` 已同步原项目结构，可用于异步初始化或路由级 form loading。",
      "复杂字段仍放在页面或业务表单组件中，FormPage 不接管表单状态管理。",
    ],
    code: "<DetailLayout :title=\"record.name\" :tabs=\"tabs\" @back=\"goBack\">\n  <template #primary>\n    <DetailFieldSections :sections=\"sections\" />\n  </template>\n  <template #secondary>\n    <DetailRelationModule :schema=\"relationSchema\" />\n  </template>\n</DetailLayout>\n\n<FormPage title=\"新建项目\" back-to=\"/projects\" :saving=\"saving\" @submit=\"submit\">\n  <FormField label=\"项目名称\" label-for=\"name\" required />\n</FormPage>",
  },
  {
    id: "theme",
    title: "主题和样式",
    summary: "全局样式抽取自 buildguard-admin 的通用 token：中性背景、蓝色主色、紧凑表格、柔和面板阴影和深色模式变量。",
    points: [
      "Tailwind v4 主题变量集中在 `src/styles/global.css`。",
      "优先使用语义 token：`background`、`card`、`border`、`muted`、`primary`、`sidebar`。",
      "不要在业务页面硬编码大面积品牌色。",
      "如需接入真实品牌 Logo，可配置 `brand.logoUrl` 和 `brand.logoDarkUrl`。",
      "项目字体已保留 buildguard-admin 的通用中文管理后台字体资产。",
    ],
    code: ":root {\n  --primary: #0075de;\n  --sidebar-background: #fafafa;\n  --shadow-panel: ...;\n}\n\n@theme inline {\n  --color-primary: var(--primary);\n  --color-sidebar: var(--sidebar);\n}",
  },
  {
    id: "migration",
    title: "从 BuildGuard Admin 迁移",
    summary: "迁移目标是复制通用组件、布局和风格，不把客户、园区、工单、检测等具体业务带进模板核心。",
    points: [
      "已整体迁入：styles、assets、shadcn-vue primitives、AppShell/Header/Sidebar、TablePage、DetailLayout、FormPage、loading 和通用动画。",
      "已保留模板边界：品牌、菜单、用户、权限、API client、认证 session、路由和文档仍由 Drawbridge 配置驱动。",
      "需抽象：菜单、权限、当前用户、API client、主题和部署配置。",
      "不迁移：客户、园区、建筑、工单、检测、地图、COS、报告等业务实现。",
      "示例模块只展示模板能力，后续项目应直接替换。",
    ],
  },
  {
    id: "deployment",
    title: "部署",
    summary: "Drawbridge 是标准 Vite 静态应用。构建后将 `dist/` 发布到任意静态托管服务即可。",
    points: [
      "生产环境先运行 `pnpm build`。",
      "使用 `pnpm preview` 可本地预览构建产物。",
      "如果部署到子路径，需要在 `vite.config.ts` 设置 `base`。",
      "API 地址、鉴权 header 和安全策略建议通过 `.env` 管理。",
      "Nginx、对象存储、Vercel 和内网静态服务器都可以承载构建产物。",
    ],
    code: "VITE_API_BASE_URL=https://api.example.com\n\npnpm build\npnpm preview\n# dist/ 可部署到 Nginx、Vercel、对象存储或任意静态服务器",
  },
]
