<script setup lang="ts">
import SettingsPageHeader from "@/components/settings/SettingsPageHeader.vue"

const props = defineProps<{
  variant: "with-tabs" | "title-only"
  title: string
  description?: string | null
}>()
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col" style="--table-page-sticky-top: -1rem;">
    <SettingsPageHeader
      :title="props.title"
      :description="props.description"
    >
      <slot v-if="props.variant === 'with-tabs'" name="toolbar" />
    </SettingsPageHeader>

    <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
      <div class="mx-auto w-full min-w-0 max-w-4xl">
        <slot />
      </div>
    </div>
  </div>
</template>
