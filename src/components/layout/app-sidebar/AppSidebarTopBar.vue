<script setup lang="ts">
import TopTabSwitch from "@/components/layout/TopTabSwitch.vue"
import BrandLogo from "@/components/layout/BrandLogo.vue"
import { TooltipWrap } from "@/components/ui/tooltip"
import { useDrawbridgeConfig } from "@/composables/useDrawbridgeConfig"

type TopBarTab = {
  id: string
  label: string
  icon: string
  badge?: string | number
}

const props = defineProps<{
  tabs: TopBarTab[]
  modelValue: string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
  search: []
}>()

const { brand } = useDrawbridgeConfig()
</script>

<template>
  <div class="p-2">
    <RouterLink
      to="/"
      class="inline-flex min-w-0 items-center rounded-md px-2 py-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      aria-label="返回首页"
    >
      <BrandLogo
        :label="brand.name"
        image-class="size-8"
        text-class="truncate text-sm font-semibold"
      />
    </RouterLink>
  </div>

  <div class="py-2 pr-2 pl-[13px]">
    <div class="flex items-center gap-1">
      <TopTabSwitch
        :tabs="props.tabs"
        :model-value="props.modelValue"
        fill-active-icon
        aria-label="侧边栏顶部导航"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <TooltipWrap content="全局搜索">
        <button
          type="button"
          class="top-tab-switch-icon-button ml-auto flex size-10 items-center justify-center rounded-full text-sidebar-foreground/52 transition-transform active:scale-[0.96] hover:text-sidebar-accent-foreground"
          aria-label="打开全局搜索"
          @click="emit('search')"
        >
          <i class="ri-search-line relative z-10 text-[17px] leading-none" />
        </button>
      </TooltipWrap>
    </div>
  </div>
</template>
