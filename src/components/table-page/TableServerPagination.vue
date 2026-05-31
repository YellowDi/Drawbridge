<script setup lang="ts">
import { computed } from "vue"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { NativeSelect } from "@/components/ui/native-select"

const props = withDefaults(defineProps<{
  page: number
  pageSize: number
  total: number
  disabled?: boolean
  pageSizes?: number[]
}>(), {
  disabled: false,
  pageSizes: () => [10, 20, 50, 100],
})

const emit = defineEmits<{
  "update:page": [page: number]
  "update:pageSize": [pageSize: number]
}>()

const currentPage = computed({
  get: () => props.page,
  set: value => emit("update:page", value),
})
const currentPageSize = computed({
  get: () => String(props.pageSize),
  set: (value) => {
    const nextPageSize = Number(value)

    if (Number.isFinite(nextPageSize) && nextPageSize > 0) {
      emit("update:pageSize", nextPageSize)
    }
  },
})
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const firstRecordIndex = computed(() => {
  if (props.total <= 0) {
    return 0
  }

  return (props.page - 1) * props.pageSize + 1
})
const lastRecordIndex = computed(() => Math.min(props.page * props.pageSize, props.total))
</script>

<template>
  <div class="flex w-full flex-col gap-2 border-t border-border/70 bg-background/95 px-4 py-2.5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
    <div class="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
      <span class="tabular-nums">
        {{ firstRecordIndex }}-{{ lastRecordIndex }} / {{ total }}
      </span>
      <span class="hidden sm:inline">条记录</span>
    </div>

    <div class="flex min-w-0 flex-wrap items-center justify-end gap-3">
      <label class="flex items-center gap-2 text-xs text-muted-foreground">
        <span class="whitespace-nowrap">每页</span>
        <NativeSelect
          v-model="currentPageSize"
          class="h-8 w-[76px] text-xs"
          :disabled="disabled"
          aria-label="每页条数"
        >
          <option
            v-for="size in pageSizes"
            :key="size"
            :value="String(size)"
          >
            {{ size }}
          </option>
        </NativeSelect>
      </label>

      <Pagination
        v-model:page="currentPage"
        :items-per-page="pageSize"
        :total="total"
        :sibling-count="1"
        :disabled="disabled || totalPages <= 1"
        show-edges
        class="w-auto justify-end py-0"
      >
        <PaginationContent v-slot="{ items }" class="justify-end">
          <PaginationFirst />
          <PaginationPrevious />

          <template
            v-for="(item, index) in items"
            :key="`${item.type}-${item.type === 'page' ? item.value : index}`"
          >
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="item.value === page"
            >
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else />
          </template>

          <PaginationNext />
          <PaginationLast />
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>
