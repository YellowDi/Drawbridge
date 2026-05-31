import { computed, onMounted, ref, shallowRef, watch, type ComputedRef } from "vue"
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from "vue-router"

import type { TableExportRowsResolver } from "@/components/table-page/export-utils"
import { useTablePage } from "@/components/table-page/useTablePage"
import type { HeaderTab, TablePageSchema, TableQueryBarConfig, TableQueryControl } from "@/components/table-page/types"
import { handleApiError } from "@/lib/api-errors"

export type ServerTableQueryValue = string | string[]
export type ServerTableQuery = Record<string, ServerTableQueryValue>

export type ServerTableRequest = {
  page: number
  pageSize: number
  query: ServerTableQuery
}

export type ServerTableResponse<Row> = {
  rows: Row[]
  total: number
  tabCounts?: Record<string, number>
}

export type ServerTableLoader<Row> = (request: ServerTableRequest) => Promise<ServerTableResponse<Row>>

export type ServerTableTabOption = {
  label: string
  value: string
  count?: number
}

export type ServerTableTabs = {
  key: string
  queryKey?: string
  all?: ServerTableTabOption
  options: ServerTableTabOption[]
  defaultValue?: string
}

type ResolvedServerTableTabs = {
  key: string
  queryKey?: string
  all: ServerTableTabOption
  options: ServerTableTabOption[]
  defaultValue: string
}

export type ServerTableRouteQuerySync = boolean | {
  enabled?: boolean
  pageKey?: string
  pageSizeKey?: string
  replace?: boolean
}

export type UseServerTablePageOptions<Row> = {
  schema: Omit<TablePageSchema<Row>, "data">
  loader: ServerTableLoader<Row>
  queryControls?: TableQueryControl[]
  serverTabs?: ServerTableTabs
  initialQuery?: ServerTableQuery
  initialPage?: number
  pageSize?: number
  immediate?: boolean
  errorFallback?: string
  routeQuery?: ServerTableRouteQuerySync
}

export function useServerTablePage<Row>(options: UseServerTablePageOptions<Row>) {
  const queryControls = options.queryControls ?? []
  const serverTabs = options.serverTabs ? normalizeServerTabs(options.serverTabs) : null
  const routeQuery = normalizeRouteQuerySync(options.routeQuery)
  const route = routeQuery.enabled ? useRoute() : null
  const router = routeQuery.enabled ? useRouter() : null
  const defaultPage = options.initialPage ?? 1
  const defaultPageSize = options.pageSize ?? 20
  const initialQuery = buildInitialQuery(queryControls, options.initialQuery, serverTabs)
  const routeState = route ? readRouteState(route.query, queryControls, serverTabs, routeQuery, {
    page: defaultPage,
    pageSize: defaultPageSize,
    query: initialQuery,
  }) : null
  const rows = shallowRef<Row[]>([])
  const loading = ref(false)
  const errorMessage = ref("")
  const pageNum = ref(routeState?.page ?? defaultPage)
  const pageSize = ref(routeState?.pageSize ?? defaultPageSize)
  const total = ref(0)
  const tabCounts = ref<Record<string, number>>({})
  const query = ref<ServerTableQuery>(routeState?.query ?? initialQuery)
  let syncingFromRoute = false
  let syncingToRoute = false
  let latestRequestId = 0

  const basePage = useTablePage<Row>({
    ...options.schema,
    tabs: serverTabs ? { mode: "none" } : options.schema.tabs,
    data: rows,
  })
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const selectedServerTab = computed(() => serverTabs ? getServerTabValue(query.value, serverTabs) : "all")
  const serverHeaderTabs = computed<HeaderTab[]>(() => serverTabs ? buildServerHeaderTabs(serverTabs, selectedServerTab.value, tabCounts.value) : [])
  const page = serverTabs
    ? {
        ...basePage,
        selectedTab: selectedServerTab,
        tabs: serverHeaderTabs,
        handleTabClick: handleServerTabClick,
      }
    : basePage
  const queryBar = computed<TableQueryBarConfig | null>(() => {
    if (!queryControls.length) {
      return null
    }

    return {
      controls: queryControls.map(control => bindControlValue(control, query.value[control.key])),
      values: query.value,
      canClear: hasActiveQuery(query.value, queryControls),
    }
  })
  const exportRowsResolver: ComputedRef<TableExportRowsResolver> = computed(() => async (payload) => {
    if (payload.scope !== "filtered") {
      return payload.defaultRows
    }

    const pageSizeForExport = Math.max(total.value, pageSize.value, 1)
    const result = await options.loader({
      page: 1,
      pageSize: pageSizeForExport,
      query: cloneQuery(query.value),
    })

    return result.rows as Record<string, unknown>[]
  })

  watch(pageNum, () => {
    if (syncingFromRoute) {
      return
    }

    void syncRouteAndLoad()
  })

  watch(pageSize, () => {
    if (syncingFromRoute) {
      return
    }

    if (pageNum.value !== 1) {
      pageNum.value = 1
      return
    }

    void syncRouteAndLoad()
  })

  if (route) {
    watch(
      () => route.query,
      (nextQuery) => {
        if (syncingToRoute) {
          return
        }

        const nextState = readRouteState(nextQuery, queryControls, serverTabs, routeQuery, {
          page: defaultPage,
          pageSize: defaultPageSize,
          query: initialQuery,
        })

        if (
          pageNum.value === nextState.page
          && pageSize.value === nextState.pageSize
          && isSameQuery(query.value, nextState.query)
        ) {
          return
        }

        syncingFromRoute = true
        pageNum.value = nextState.page
        pageSize.value = nextState.pageSize
        query.value = nextState.query
        syncingFromRoute = false

        void load()
      },
      { deep: true },
    )
  }

  onMounted(() => {
    if (options.immediate !== false) {
      void load()
    }
  })

  async function load() {
    const requestId = ++latestRequestId
    loading.value = true
    errorMessage.value = ""

    try {
      const result = await options.loader({
        page: pageNum.value,
        pageSize: pageSize.value,
        query: cloneQuery(query.value),
      })

      if (requestId !== latestRequestId) {
        return
      }

      rows.value = result.rows
      total.value = Math.max(0, result.total)
      tabCounts.value = result.tabCounts ?? tabCounts.value

      if (pageNum.value > totalPages.value) {
        pageNum.value = totalPages.value
      }
    }
    catch (error) {
      if (requestId !== latestRequestId) {
        return
      }

      rows.value = []
      total.value = 0
      errorMessage.value = handleApiError(error, {
        mode: "silent",
        fallback: options.errorFallback ?? "列表数据加载失败，请稍后重试。",
      })
    }
    finally {
      if (requestId === latestRequestId) {
        loading.value = false
      }
    }
  }

  function handleQueryChange(payload: { key: string; value: string | string[] }) {
    const nextValue = normalizeQueryValue(payload.value)

    if (isSameQueryValue(query.value[payload.key], nextValue)) {
      return
    }

    query.value = {
      ...query.value,
      [payload.key]: nextValue,
    }
    reloadFromFirstPage()
  }

  function handleQueryClear() {
    const nextQuery = buildInitialQuery(queryControls, undefined, serverTabs)

    if (serverTabs) {
      nextQuery[serverTabs.key] = getServerTabValue(query.value, serverTabs)
    }

    if (isSameQuery(query.value, nextQuery)) {
      return
    }

    query.value = nextQuery
    reloadFromFirstPage()
  }

  function reloadFromFirstPage() {
    if (pageNum.value !== 1) {
      pageNum.value = 1
      return
    }

    void syncRouteAndLoad()
  }

  function handleServerTabClick(tab: { value?: string | number; label: string }) {
    if (!serverTabs) {
      return
    }

    const nextValue = normalizeServerTabValue(serverTabs, typeof tab.value === "string" || typeof tab.value === "number" ? String(tab.value) : "")

    if (isSameQueryValue(query.value[serverTabs.key], nextValue)) {
      return
    }

    query.value = {
      ...query.value,
      [serverTabs.key]: nextValue,
    }
    reloadFromFirstPage()
  }

  async function syncRouteAndLoad() {
    await syncRouteQuery()
    void load()
  }

  async function syncRouteQuery() {
    if (!route || !router || syncingFromRoute) {
      return
    }

    const nextRouteQuery = buildRouteQuery(route.query, queryControls, serverTabs, routeQuery, {
      page: pageNum.value,
      pageSize: pageSize.value,
      defaultPage,
      defaultPageSize,
      query: query.value,
    })

    if (isSameLocationQuery(route.query, nextRouteQuery)) {
      return
    }

    syncingToRoute = true

    try {
      await (routeQuery.replace
        ? router.replace({ query: nextRouteQuery })
        : router.push({ query: nextRouteQuery }))
    }
    finally {
      syncingToRoute = false
    }
  }

  return {
    page,
    rows,
    loading,
    errorMessage,
    pageNum,
    pageSize,
    total,
    tabCounts,
    totalPages,
    query,
    queryBar,
    exportRowsResolver,
    load,
    handleQueryChange,
    handleQueryClear,
  }
}

function normalizeRouteQuerySync(routeQuery: ServerTableRouteQuerySync | undefined) {
  if (routeQuery === true) {
    return {
      enabled: true,
      pageKey: "page",
      pageSizeKey: "pageSize",
      replace: true,
    }
  }

  if (!routeQuery) {
    return {
      enabled: false,
      pageKey: "page",
      pageSizeKey: "pageSize",
      replace: true,
    }
  }

  return {
    enabled: routeQuery.enabled !== false,
    pageKey: routeQuery.pageKey ?? "page",
    pageSizeKey: routeQuery.pageSizeKey ?? "pageSize",
    replace: routeQuery.replace !== false,
  }
}

function normalizeServerTabs(tabs: ServerTableTabs): ResolvedServerTableTabs {
  const all = tabs.all ?? { label: "全部", value: "" }

  return {
    ...tabs,
    all,
    defaultValue: tabs.defaultValue ?? all.value,
  }
}

function buildInitialQuery(
  controls: TableQueryControl[],
  initialQuery: ServerTableQuery = {},
  serverTabs: ResolvedServerTableTabs | null = null,
) {
  const query = Object.fromEntries(controls.map(control => [
    control.key,
    normalizeQueryValue(initialQuery[control.key] ?? getEmptyControlValue(control)),
  ])) as ServerTableQuery

  if (serverTabs) {
    query[serverTabs.key] = normalizeServerTabValue(serverTabs, initialQuery[serverTabs.key])
  }

  return query
}

function readRouteState(
  routeQuery: LocationQuery,
  controls: TableQueryControl[],
  serverTabs: ResolvedServerTableTabs | null,
  sync: ReturnType<typeof normalizeRouteQuerySync>,
  fallback: {
    page: number
    pageSize: number
    query: ServerTableQuery
  },
) {
  return {
    page: readPositiveInteger(routeQuery[sync.pageKey], fallback.page),
    pageSize: readPositiveInteger(routeQuery[sync.pageSizeKey], fallback.pageSize),
    query: {
      ...Object.fromEntries(controls.map(control => [
        control.key,
        readRouteQueryValue(routeQuery[getControlRouteKey(control)], control, fallback.query[control.key]),
      ])),
      ...(serverTabs
        ? {
            [serverTabs.key]: readRouteServerTabValue(
              routeQuery[getServerTabRouteKey(serverTabs)],
              serverTabs,
              fallback.query[serverTabs.key],
            ),
          }
        : {}),
    } as ServerTableQuery,
  }
}

function buildRouteQuery(
  currentQuery: LocationQuery,
  controls: TableQueryControl[],
  serverTabs: ResolvedServerTableTabs | null,
  sync: ReturnType<typeof normalizeRouteQuerySync>,
  state: {
    page: number
    pageSize: number
    defaultPage: number
    defaultPageSize: number
    query: ServerTableQuery
  },
) {
  const managedKeys = new Set([
    sync.pageKey,
    sync.pageSizeKey,
    ...controls.map(getControlRouteKey),
    ...(serverTabs ? [getServerTabRouteKey(serverTabs)] : []),
  ])
  const nextQuery: LocationQueryRaw = {}

  for (const [key, value] of Object.entries(currentQuery)) {
    if (!managedKeys.has(key) && value !== null && value !== undefined) {
      nextQuery[key] = value
    }
  }

  if (state.page > 1 && state.page !== state.defaultPage) {
    nextQuery[sync.pageKey] = String(state.page)
  }

  if (state.pageSize !== state.defaultPageSize) {
    nextQuery[sync.pageSizeKey] = String(state.pageSize)
  }

  for (const control of controls) {
    const value = state.query[control.key]
    const routeKey = getControlRouteKey(control)

    if (Array.isArray(value)) {
      if (value.length) {
        nextQuery[routeKey] = value
      }
      continue
    }

    if (value) {
      nextQuery[routeKey] = value
    }
  }

  if (serverTabs) {
    const value = getServerTabValue(state.query, serverTabs)

    if (value && value !== serverTabs.all.value) {
      nextQuery[getServerTabRouteKey(serverTabs)] = value
    }
  }

  return nextQuery
}

function getControlRouteKey(control: TableQueryControl) {
  return control.queryKey ?? control.key
}

function getServerTabRouteKey(tabs: ResolvedServerTableTabs) {
  return tabs.queryKey ?? tabs.key
}

function readRouteServerTabValue(
  value: LocationQuery[string],
  tabs: ResolvedServerTableTabs,
  fallback: ServerTableQueryValue | undefined,
) {
  const textValue = Array.isArray(value) ? value[0] : value
  return normalizeServerTabValue(tabs, typeof textValue === "string" ? textValue : fallback)
}

function normalizeServerTabValue(tabs: ResolvedServerTableTabs, value: ServerTableQueryValue | undefined) {
  const text = typeof value === "string" ? value.trim() : ""
  const allowedValues = new Set([tabs.all.value, ...tabs.options.map(option => option.value)])

  return allowedValues.has(text) ? text : tabs.defaultValue
}

function getServerTabValue(query: ServerTableQuery, tabs: ResolvedServerTableTabs) {
  return normalizeServerTabValue(tabs, query[tabs.key])
}

function buildServerHeaderTabs(
  tabs: ResolvedServerTableTabs,
  selectedValue: string,
  counts: Record<string, number>,
) {
  return [tabs.all, ...tabs.options].map(tab => ({
    label: tab.label,
    value: tab.value,
    count: resolveServerTabCount(tab, counts),
    active: selectedValue === tab.value,
  }))
}

function resolveServerTabCount(tab: ServerTableTabOption, counts: Record<string, number>) {
  const count = counts[tab.value]
  return typeof count === "number" && Number.isFinite(count) ? count : tab.count
}

function readRouteQueryValue(
  value: LocationQuery[string],
  control: TableQueryControl,
  fallback: ServerTableQueryValue | undefined,
): ServerTableQueryValue {
  if (control.type === "select" && control.multiple) {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    }

    if (typeof value === "string" && value.trim()) {
      return [value.trim()]
    }

    return Array.isArray(fallback) ? fallback : []
  }

  const textValue = Array.isArray(value) ? value[0] : value
  if (typeof textValue === "string") {
    return textValue.trim()
  }

  return typeof fallback === "string" ? fallback : ""
}

function readPositiveInteger(value: LocationQuery[string], fallback: number) {
  const rawValue = Array.isArray(value) ? value[0] : value
  const numberValue = typeof rawValue === "string" ? Number(rawValue) : NaN

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : fallback
}

function isSameLocationQuery(left: LocationQuery, right: LocationQueryRaw) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])

  for (const key of keys) {
    const leftValues = normalizeLocationQueryValue(left[key])
    const rightValues = normalizeLocationQueryValue(right[key])

    if (
      leftValues.length !== rightValues.length
      || leftValues.some((value, index) => value !== rightValues[index])
    ) {
      return false
    }
  }

  return true
}

function normalizeLocationQueryValue(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string | number => typeof item === "string" || typeof item === "number")
      .map(String)
      .filter(Boolean)
  }

  if (typeof value === "string" || typeof value === "number") {
    return value ? [String(value)] : []
  }

  return []
}

function bindControlValue(control: TableQueryControl, value: ServerTableQueryValue | undefined): TableQueryControl {
  if (control.type === "select" && control.multiple) {
    return {
      ...control,
      value: Array.isArray(value) ? value : [],
    }
  }

  return {
    ...control,
    value: typeof value === "string" ? value : "",
  }
}

function getEmptyControlValue(control: TableQueryControl): ServerTableQueryValue {
  return control.type === "select" && control.multiple ? [] : ""
}

function normalizeQueryValue(value: ServerTableQueryValue | undefined): ServerTableQueryValue {
  if (Array.isArray(value)) {
    return value.map(item => item.trim()).filter(Boolean)
  }

  return typeof value === "string" ? value.trim() : ""
}

function cloneQuery(query: ServerTableQuery) {
  return Object.fromEntries(Object.entries(query).map(([key, value]) => [
    key,
    Array.isArray(value) ? [...value] : value,
  ])) as ServerTableQuery
}

function hasActiveQuery(query: ServerTableQuery, controls: TableQueryControl[]) {
  return controls.some((control) => {
    const value = query[control.key]
    return Array.isArray(value) ? value.length > 0 : Boolean(value)
  })
}

function isSameQuery(left: ServerTableQuery, right: ServerTableQuery) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])

  for (const key of keys) {
    if (!isSameQueryValue(left[key], right[key])) {
      return false
    }
  }

  return true
}

function isSameQueryValue(left: ServerTableQueryValue | undefined, right: ServerTableQueryValue | undefined) {
  if (Array.isArray(left) || Array.isArray(right)) {
    const leftItems = Array.isArray(left) ? left : []
    const rightItems = Array.isArray(right) ? right : []
    return leftItems.length === rightItems.length && leftItems.every((item, index) => item === rightItems[index])
  }

  return (left ?? "") === (right ?? "")
}
