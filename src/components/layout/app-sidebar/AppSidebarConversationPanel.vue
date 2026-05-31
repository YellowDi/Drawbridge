<script setup lang="ts">
import { computed, ref } from "vue"

import { Button } from "@/components/ui/button"
import Input from "@/components/ui/input/Input.vue"
import type { AppSidebarConversationItem } from "@/components/layout/app-sidebar/types"

const props = defineProps<{
  items: AppSidebarConversationItem[]
}>()

const keyword = ref("")

type TimeGroupId = "today" | "yesterday" | "earlier"

const TIME_GROUP_LABEL: Record<TimeGroupId, string> = {
  today: "今天",
  yesterday: "昨天",
  earlier: "更早",
}

const TIME_GROUP_ORDER: TimeGroupId[] = ["today", "yesterday", "earlier"]

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getTimeGroup(iso: string): TimeGroupId {
  const time = new Date(iso)
  if (Number.isNaN(time.getTime())) {
    return "earlier"
  }

  const now = new Date()
  const diffDays = Math.round(
    (startOfLocalDay(now).getTime() - startOfLocalDay(time).getTime()) / 86_400_000,
  )

  if (diffDays === 0) return "today"
  if (diffDays === 1) return "yesterday"
  return "earlier"
}

function formatConversationDay(iso: string) {
  const time = new Date(iso)
  if (Number.isNaN(time.getTime())) {
    return ""
  }
  return `${time.getMonth() + 1}月${time.getDate()}日`
}

const filteredItems = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  return props.items.filter((item) => {
    if (!search) return true

    const dayLabel = formatConversationDay(item.updatedAtIso)
    const haystack = `${item.title} ${item.project} ${item.preview} ${item.model} ${dayLabel}`.toLowerCase()
    return haystack.includes(search)
  })
})

function sortInGroup(a: AppSidebarConversationItem, b: AppSidebarConversationItem) {
  if (Boolean(a.pinned) !== Boolean(b.pinned)) {
    return a.pinned ? -1 : 1
  }
  return b.updatedAtIso.localeCompare(a.updatedAtIso)
}

const groupedItems = computed(() => {
  const buckets: Record<TimeGroupId, AppSidebarConversationItem[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  }

  for (const item of filteredItems.value) {
    buckets[getTimeGroup(item.updatedAtIso)].push(item)
  }

  for (const id of TIME_GROUP_ORDER) {
    buckets[id].sort(sortInGroup)
  }

  return TIME_GROUP_ORDER
    .map(id => ({
      id,
      label: TIME_GROUP_LABEL[id],
      items: buckets[id],
    }))
    .filter(group => group.items.length > 0)
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <div class="shrink-0 px-2 py-2">
      <div class="flex items-center gap-2">
        <Input
          v-model="keyword"
          placeholder="搜索上下文..."
          class="h-9 rounded-full bg-background px-3 text-sm shadow-none"
        />
        <Button
          type="button"
          variant="default"
          size="sm"
          class="shrink-0 rounded-full"
        >
          <i class="ri-add-line text-[16px] leading-none" />
          <span>新建</span>
        </Button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
      <template
        v-for="group in groupedItems"
        :key="group.id"
      >
        <p class="px-3 pb-2 pt-4 text-xs text-muted-foreground first:pt-2">
          {{ group.label }}
        </p>
        <div class="flex flex-col gap-0.5">
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-interactive-hover"
          >
            <i
              class="ri-chat-1-line shrink-0 text-[17px] leading-none text-muted-foreground"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {{ item.title }}
            </span>
            <span class="shrink-0 text-xs tabular-nums text-muted-foreground">
              {{ formatConversationDay(item.updatedAtIso) }}
            </span>
          </button>
        </div>
      </template>

      <div
        v-if="groupedItems.length === 0"
        class="px-4 py-10 text-center"
      >
        <p class="text-sm font-medium text-foreground">没有匹配的上下文</p>
        <p class="mt-1 text-xs text-muted-foreground">这里是模板 mock 数据，接入真实数据源后可替换。</p>
      </div>
    </div>
  </div>
</template>
