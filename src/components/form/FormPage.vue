<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router"
import { useRouter } from "vue-router"
import { computed } from "vue"

import FormBodyLoading from "@/components/loading/FormBodyLoading.vue"
import FormHeader from "@/components/form/FormHeader.vue"
import FormQuickNav from "@/components/form/FormQuickNav.vue"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type QuickNavItem = {
  id: string
  label: string
}

type HeaderAction = {
  key: string
  label: string
  permissionCode?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  icon?: string
}

const props = withDefaults(defineProps<{
  title: string
  backTo: RouteLocationRaw
  cancelLabel?: string
  submitLabel?: string
  submitIcon?: string
  secondaryActions?: HeaderAction[]
  resetDialog?: {
    title?: string
    description: string
    confirmText?: string
    cancelText?: string
  }
  loading?: boolean
  saving?: boolean
  submitDisabled?: boolean
  error?: string
  noticeTitle?: string
  noticeDescription?: string
  maxWidth?: "md" | "lg" | "full"
  contentClass?: string
  formClass?: string
  quickNavItems?: QuickNavItem[]
  activeQuickNavId?: string
  quickNavClass?: string
}>(), {
  cancelLabel: "取消",
  submitLabel: "保存",
  submitIcon: "ri-save-3-line",
  secondaryActions: () => [],
  resetDialog: undefined,
  loading: false,
  saving: false,
  submitDisabled: false,
  error: "",
  noticeTitle: "",
  noticeDescription: "",
  maxWidth: "md",
  contentClass: "",
  formClass: "",
  quickNavItems: () => [],
  activeQuickNavId: "",
  quickNavClass: "",
})

const emit = defineEmits<{
  submit: []
  action: [key: string]
  reset: []
  "quick-nav-select": [id: string]
}>()

const router = useRouter()
const pageWidthClass = computed(() => {
  if (props.maxWidth === "full") return "max-w-none"
  if (props.maxWidth === "lg") return "max-w-5xl"
  return "max-w-4xl"
})
const activeQuickNavId = computed(() => props.activeQuickNavId || props.quickNavItems[0]?.id || "")
const showQuickNav = computed(() => props.quickNavItems.length > 0)
const showNotice = computed(() => Boolean(props.noticeTitle || props.noticeDescription))
const headerPrimaryAction = computed(() => ({
  label: props.submitLabel,
  icon: props.saving || props.loading ? "ri-loader-4-line animate-spin" : props.submitIcon,
  disabled: props.loading || props.saving || props.submitDisabled,
}))

function goBack() {
  void router.push(props.backTo)
}

function handleQuickNavSelect(id: string) {
  emit("quick-nav-select", id)
}
</script>

<template>
  <section :class="cn('mx-auto flex w-full min-w-0 flex-col gap-6 pb-8', pageWidthClass)">
    <FormHeader
      :title="props.title"
      :primary-action="headerPrimaryAction"
      :secondary-actions="props.secondaryActions"
      :reset-dialog="props.resetDialog"
      @back="goBack"
      @action="emit('action', $event)"
      @reset="emit('reset')"
      @submit="emit('submit')"
    >
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </FormHeader>

    <Alert v-if="error" variant="destructive">
      <AlertTitle>表单加载失败</AlertTitle>
      <AlertDescription>
        {{ error }}
      </AlertDescription>
    </Alert>

    <Alert v-else-if="showNotice">
      <AlertTitle>{{ props.noticeTitle || "表单提示" }}</AlertTitle>
      <AlertDescription>
        {{ props.noticeDescription }}
      </AlertDescription>
    </Alert>

    <slot name="before" />

    <FormBodyLoading v-if="loading" />

    <div
      v-else
      :class="cn('grid min-w-0 gap-8', showQuickNav ? 'lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_250px]' : '')"
    >
      <div class="min-w-0 space-y-5">
        <form
          :class="cn('min-w-0 space-y-0', props.formClass)"
          :aria-busy="saving"
          @submit.prevent="emit('submit')"
        >
          <div :class="cn(props.contentClass)">
            <slot />
          </div>

          <slot name="footer">
            <div class="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" @click="goBack">
                {{ props.cancelLabel }}
              </Button>
              <Button type="submit" :disabled="saving || submitDisabled">
                <i :class="saving ? 'ri-loader-4-line animate-spin' : props.submitIcon" />
                {{ saving ? "保存中" : submitLabel }}
              </Button>
            </div>
          </slot>
        </form>

        <slot name="after" />
      </div>

      <slot name="side">
        <FormQuickNav
          v-if="showQuickNav"
          :class="cn('hidden lg:sticky lg:top-24 lg:block lg:self-start', props.quickNavClass)"
          :active-id="activeQuickNavId"
          :items="props.quickNavItems"
          @select="handleQuickNavSelect"
        />
      </slot>
    </div>
  </section>
</template>
