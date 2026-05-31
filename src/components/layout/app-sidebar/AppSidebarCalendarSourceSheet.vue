<script setup lang="ts">
import { computed } from "vue"
import { onKeyStroke } from "@vueuse/core"

import AppSidebarCalendarSourceSheetBody from "@/components/layout/app-sidebar/AppSidebarCalendarSourceSheetBody.vue"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useSidebar } from "@/components/ui/sidebar"
import { SIDEBAR_WIDTH } from "@/components/ui/sidebar/utils"
import type { AppSidebarCalendarItem } from "@/components/layout/app-sidebar/types"

const props = defineProps<{
  open: boolean
  sourceType: AppSidebarCalendarItem["type"] | null
  title: string
  subtitle: string
  loading: boolean
  groups: Array<{ sectionLabel: string, events: AppSidebarCalendarItem[] }>
  swatchClass: string
}>()

const emit = defineEmits<{
  "update:open": [value: boolean]
  add: []
  "select-event": [event: AppSidebarCalendarItem]
}>()

const { open: sidebarOpen, isMobile } = useSidebar()

const drawerOpen = computed({
  get: () => props.open && !!props.sourceType,
  set: (value) => {
    if (!value) {
      close()
    }
  },
})

const panelFrameStyle = computed(() => {
  const docked = sidebarOpen.value
  return {
    top: "0",
    bottom: "0",
    left: docked ? SIDEBAR_WIDTH : "0",
    width: docked
      ? `min(22rem, calc(100vw - ${SIDEBAR_WIDTH}))`
      : "min(22rem, 100vw)",
  }
})

function close() {
  emit("update:open", false)
}

function handleAdd() {
  emit("add")
}

function onSelectEvent(event: AppSidebarCalendarItem) {
  emit("select-event", event)
}

onKeyStroke("Escape", (event) => {
  if (props.open && !isMobile.value && props.sourceType) {
    event.preventDefault()
    close()
  }
})
</script>

<template>
  <Drawer
    v-if="isMobile"
    v-model:open="drawerOpen"
    direction="bottom"
  >
    <DrawerContent
      class="flex flex-col gap-0 border-0 outline-none"
      :aria-label="title"
    >
      <AppSidebarCalendarSourceSheetBody
        :title="title"
        :subtitle="subtitle"
        :swatch-class="swatchClass"
        :loading="loading"
        :groups="groups"
        @close="close"
        @add="handleAdd"
        @select-event="onSelectEvent"
      />
    </DrawerContent>
  </Drawer>

  <Teleport v-else to="body">
    <Transition name="calendar-sheet">
      <div
        v-if="open && sourceType"
        class="fixed z-20 flex min-h-0 flex-col overflow-hidden bg-background [outline:1px_solid_var(--border-whisper)] shadow-(--shadow-deep)"
        :style="panelFrameStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <AppSidebarCalendarSourceSheetBody
          :title="title"
          :subtitle="subtitle"
          :swatch-class="swatchClass"
          :loading="loading"
          :groups="groups"
          @close="close"
          @add="handleAdd"
          @select-event="onSelectEvent"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.calendar-sheet-enter-active,
.calendar-sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.calendar-sheet-leave-active {
  transition-duration: 0.25s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.7, 0.2);
}

.calendar-sheet-enter-from,
.calendar-sheet-leave-to {
  transform: translateX(-100%);
}

.calendar-sheet-enter-to,
.calendar-sheet-leave-from {
  transform: translateX(0);
}
</style>
