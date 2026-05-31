<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { getLocalTimeZone, today } from "@internationalized/date"
import { toast } from "vue-sonner"

import AppSidebarCalendarSourceSheet from "@/components/layout/app-sidebar/AppSidebarCalendarSourceSheet.vue"
import AppSidebarMiniCalendar from "@/components/layout/app-sidebar/AppSidebarMiniCalendar.vue"
import type { AppSidebarCalendarDate, AppSidebarCalendarItem } from "@/components/layout/app-sidebar/types"

type CalendarDataSourceEntry = {
  type: AppSidebarCalendarItem["type"]
  label: string
  dateFieldLabel: string
  count: number
}

const calendarItemTypePresentation: Record<
  AppSidebarCalendarItem["type"],
  { swatch: string, badge: string, shortLabel: string }
> = {
  deadline: {
    swatch: "bg-orange-500 dark:bg-orange-400",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    shortLabel: "截止",
  },
  release: {
    swatch: "bg-blue-500 dark:bg-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    shortLabel: "发布",
  },
  maintenance: {
    swatch: "bg-emerald-500 dark:bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    shortLabel: "维护",
  },
}

const router = useRouter()
const loading = ref(false)
const sourceSheetOpen = ref(false)
const selectedSourceType = ref<AppSidebarCalendarItem["type"] | null>(null)
const selectedDate = ref<AppSidebarCalendarDate>(getTodayDate())

const allEvents = computed<AppSidebarCalendarItem[]>(() => [
  {
    dateKey: offsetDateKey(0),
    time: "10:30",
    title: "项目评审: Admin Template 基础能力确认",
    meta: "模板团队",
    type: "deadline",
    uuid: "cal-001",
    path: "/projects/prj-1024",
  },
  {
    dateKey: offsetDateKey(1),
    time: "14:00",
    title: "版本发布: 预览环境更新",
    meta: "Vite 静态部署",
    type: "release",
    uuid: "cal-002",
    path: "/docs",
  },
  {
    dateKey: offsetDateKey(3),
    time: "09:20",
    title: "维护窗口: 权限 adapter 演练",
    meta: "菜单 / 按钮 / API",
    type: "maintenance",
    uuid: "cal-003",
    path: "/settings/developer",
  },
  {
    dateKey: offsetDateKey(7),
    time: "16:15",
    title: "项目评审: 表格筛选接口复核",
    meta: "TablePage",
    type: "deadline",
    uuid: "cal-004",
    path: "/projects",
  },
])

const eventDateKeys = computed(() => new Set(allEvents.value.map(event => event.dateKey)))

const dataSources = computed<CalendarDataSourceEntry[]>(() => {
  const list = allEvents.value
  return [
    {
      type: "deadline",
      label: "项目截止",
      dateFieldLabel: "截止日期",
      count: list.filter(event => event.type === "deadline").length,
    },
    {
      type: "release",
      label: "版本发布",
      dateFieldLabel: "发布时间",
      count: list.filter(event => event.type === "release").length,
    },
    {
      type: "maintenance",
      label: "维护窗口",
      dateFieldLabel: "开始时间",
      count: list.filter(event => event.type === "maintenance").length,
    },
  ]
})

watch(
  sourceSheetOpen,
  (open) => {
    document.documentElement.classList.toggle("calendar-source-sheet-open", open)
  },
  { flush: "post" },
)

onUnmounted(() => {
  document.documentElement.classList.remove("calendar-source-sheet-open")
})

const sourceSheetGroups = computed(() => {
  if (!selectedSourceType.value) {
    return [] as Array<{ sectionLabel: string, events: AppSidebarCalendarItem[] }>
  }

  const list = allEvents.value
    .filter(event => event.type === selectedSourceType.value)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.time.localeCompare(b.time))
  const todayKey = dateValueToKey(getTodayDate())
  const map = new Map<string, AppSidebarCalendarItem[]>()

  for (const event of list) {
    const events = map.get(event.dateKey) ?? []
    events.push(event)
    map.set(event.dateKey, events)
  }

  return [...map.keys()].sort().map(key => ({
    sectionLabel: sectionLabelForDateKey(key, todayKey),
    events: map.get(key) ?? [],
  }))
})

const selectedSourceMeta = computed(() => {
  if (!selectedSourceType.value) {
    return { label: "", subtitle: "", swatch: "" }
  }

  const source = dataSources.value.find(item => item.type === selectedSourceType.value)
  const presentation = calendarItemTypePresentation[selectedSourceType.value]
  return {
    label: source?.label ?? "",
    subtitle: source?.dateFieldLabel ?? "",
    swatch: presentation.swatch,
  }
})

const eventsForSelectedDate = computed(() => getEventsForDate(selectedDate.value))

const selectedDateLabel = computed(() => {
  const date = selectedDate.value
  const current = getTodayDate()
  if (date.year === current.year && date.month === current.month && date.day === current.day) {
    return "今日安排"
  }
  return `${date.month}月${date.day}日安排`
})

function getTodayDate(): AppSidebarCalendarDate {
  return today(getLocalTimeZone()) as unknown as AppSidebarCalendarDate
}

function offsetDateKey(delta: number) {
  const current = getTodayDate()
  const date = new Date(current.year, current.month - 1, current.day)
  date.setDate(date.getDate() + delta)
  return toJsDateKey(date)
}

function toJsDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function dateValueToKey(date: AppSidebarCalendarDate) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`
}

function addDaysToDateKey(dateKey: string, delta: number) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + delta)
  return toJsDateKey(date)
}

function sectionLabelForDateKey(dateKey: string, todayKey: string) {
  if (dateKey === todayKey) return "今天"
  if (dateKey === addDaysToDateKey(todayKey, 1)) return "明天"

  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()]
  return `${month}月${day}日 ${weekday}`
}

function getEventsForDate(date: AppSidebarCalendarDate) {
  const key = dateValueToKey(date)
  return allEvents.value.filter(event => event.dateKey === key)
}

function hasEventsOnDate(date: AppSidebarCalendarDate) {
  return eventDateKeys.value.has(dateValueToKey(date))
}

function toggleSourceSheet(source: CalendarDataSourceEntry) {
  if (sourceSheetOpen.value && selectedSourceType.value === source.type) {
    sourceSheetOpen.value = false
    selectedSourceType.value = null
    return
  }

  selectedSourceType.value = source.type
  sourceSheetOpen.value = true
}

function onSourceSheetOpenChange(open: boolean) {
  if (!open) {
    selectedSourceType.value = null
  }
}

function getEventTypeText(event: AppSidebarCalendarItem) {
  const [prefix] = event.title.split(/[:：]/, 1)
  if (prefix?.trim()) return prefix.trim()
  return calendarItemTypePresentation[event.type].shortLabel
}

function getEventTitleText(event: AppSidebarCalendarItem) {
  const parts = event.title.split(/[:：]\s*/, 2)
  return parts[1]?.trim() || event.title
}

function navigateToEvent(event: AppSidebarCalendarItem) {
  if (event.path) {
    void router.push(event.path)
    return
  }

  toast.info("这是模板日历 mock 事件，可在项目中接入真实详情页。")
}

function onSheetSelectEvent(event: AppSidebarCalendarItem) {
  sourceSheetOpen.value = false
  selectedSourceType.value = null
  navigateToEvent(event)
}

function handleSheetAdd() {
  toast.info("这里保留创建入口，真实项目可挂接发布、维护或截止日期表单。")
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <AppSidebarMiniCalendar
      v-model="selectedDate"
      :has-event-on-date="hasEventsOnDate"
    />

    <div class="mt-2 shrink-0 border-t border-sidebar-border/80 pt-2.5">
      <ul class="space-y-0.5" role="list">
        <li
          v-for="source in dataSources"
          :key="source.type"
          role="button"
          tabindex="0"
          class="flex w-full cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1.5 text-left transition-colors hover:bg-interactive-hover"
          :class="sourceSheetOpen && selectedSourceType === source.type ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''"
          @click="toggleSourceSheet(source)"
          @keydown.enter.prevent="toggleSourceSheet(source)"
          @keydown.space.prevent="toggleSourceSheet(source)"
        >
          <span
            class="size-3 shrink-0 rounded-[3px]"
            :class="calendarItemTypePresentation[source.type].swatch"
            aria-hidden="true"
          />

          <span class="min-w-0 flex-1 truncate text-sm text-foreground">
            {{ source.label }}
          </span>
          <span class="shrink-0 whitespace-nowrap text-right text-xs text-muted-foreground">
            {{ source.dateFieldLabel }}
          </span>
        </li>
      </ul>
    </div>

    <div class="mt-3 min-h-0 flex-1 overflow-y-auto border-t border-sidebar-border pt-3">
      <div class="flex items-center justify-between px-3 py-2.5">
        <p class="text-sm font-semibold text-foreground">
          {{ selectedDateLabel }}
        </p>
        <span class="text-xs text-muted-foreground">
          <template v-if="loading">加载中...</template>
          <template v-else>{{ eventsForSelectedDate.length }} 项</template>
        </span>
      </div>

      <div
        v-if="!loading && eventsForSelectedDate.length === 0"
        class="px-3 py-6 text-center"
      >
        <p class="text-sm text-muted-foreground">暂无安排</p>
      </div>

      <div v-else class="space-y-1">
        <article
          v-for="event in eventsForSelectedDate"
          :key="`${event.type}-${event.uuid}`"
          class="cursor-pointer rounded-xl px-3 py-3 transition-colors hover:bg-interactive-hover"
          @click="navigateToEvent(event)"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="truncate text-xs font-medium text-muted-foreground">
              {{ getEventTypeText(event) }}
            </p>
            <span
              class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
              :class="calendarItemTypePresentation[event.type].badge"
            >
              {{ calendarItemTypePresentation[event.type].shortLabel }}
            </span>
          </div>
          <div class="mt-1.5 min-w-0">
            <p class="truncate text-sm font-medium text-foreground">
              {{ getEventTitleText(event) }}
            </p>
            <p
              v-if="event.meta || event.time"
              class="mt-0.5 truncate text-xs text-muted-foreground"
            >
              <span v-if="event.time">{{ event.time }}</span>
              <span v-if="event.time && event.meta" class="mx-1">·</span>
              <span v-if="event.meta">{{ event.meta }}</span>
            </p>
          </div>
        </article>
      </div>
    </div>

    <AppSidebarCalendarSourceSheet
      v-model:open="sourceSheetOpen"
      :source-type="selectedSourceType"
      :title="selectedSourceMeta.label"
      :subtitle="selectedSourceMeta.subtitle"
      :loading="loading"
      :groups="sourceSheetGroups"
      :swatch-class="selectedSourceMeta.swatch"
      @update:open="onSourceSheetOpenChange"
      @add="handleSheetAdd"
      @select-event="onSheetSelectEvent"
    />
  </div>
</template>
