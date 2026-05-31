<script setup lang="ts">
import { computed } from "vue"

import RouteLoadingFallback from "@/components/loading/RouteLoadingFallback.vue"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { useRouteLoadingState } from "@/composables/useRouteLoadingState"

const { isRouteLoading, loadingKind } = useRouteLoadingState()
const showFullPageFallback = computed(() =>
  isRouteLoading.value && loadingKind.value === "auth",
)
</script>

<template>
  <TooltipProvider>
    <RouteLoadingFallback
      v-if="showFullPageFallback"
      full-page
      :kind="loadingKind"
    />
    <RouterView v-else />
    <Toaster position="top-center" />
  </TooltipProvider>
</template>
