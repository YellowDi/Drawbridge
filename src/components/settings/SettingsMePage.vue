<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useClipboard } from "@vueuse/core"
import { toast } from "vue-sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TooltipWrap } from "@/components/ui/tooltip"
import SettingsPageHeader from "@/components/settings/SettingsPageHeader.vue"
import SettingsSection from "@/components/settings/SettingsSection.vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  userName: string
  avatarFallback: string
  preferredName: string
  selectedAvatarTone: string
  userId: string
}>()

const emit = defineEmits<{
  "update:preferredName": [value: string]
  "update:selectedAvatarTone": [value: string]
}>()

const isAvatarPickerOpen = ref(false)
const localPreferredName = ref(props.preferredName)
const { copy } = useClipboard()

const avatarOptions = [
  { key: "blue", label: "蓝色", class: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" },
  { key: "green", label: "绿色", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
  { key: "pink", label: "粉色", class: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300" },
  { key: "purple", label: "紫色", class: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
  { key: "gray", label: "灰色", class: "bg-muted text-muted-foreground" },
  { key: "yellow", label: "黄色", class: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
]

const selectedAvatarClass = computed(() =>
  avatarOptions.find(option => option.key === props.selectedAvatarTone)?.class
  ?? avatarOptions[0].class,
)

watch(() => props.preferredName, (value) => {
  localPreferredName.value = value
})

function handleCopyUserId() {
  void copy(props.userId)
  toast.success("已复制到剪贴板")
}

function handleSavePreferredName() {
  emit("update:preferredName", localPreferredName.value)
  toast.success("偏好名称已更新")
}

function handleSelectAvatar(avatarTone: string) {
  if (props.selectedAvatarTone !== avatarTone) {
    emit("update:selectedAvatarTone", avatarTone)
  }
  isAvatarPickerOpen.value = false
}

function handleLogout() {
  toast.info("退出登录由项目 auth adapter 实现，模板中仅保留入口。")
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <SettingsPageHeader
      title="我"
      description="管理你的档案和头像"
    />

    <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
      <div class="mx-auto w-full max-w-4xl space-y-6">
        <SettingsSection
          title="账号"
          description=""
          :show-header="true"
        >
          <div class="space-y-0 py-4">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Popover v-model:open="isAvatarPickerOpen">
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="inline-flex w-fit shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="选择头像"
                  >
                    <Avatar class="size-16 rounded-sm">
                      <AvatarFallback :class="cn('rounded-sm text-xl font-semibold', selectedAvatarClass)">
                        {{ avatarFallback }}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  class="w-auto rounded-xl p-3"
                >
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="avatar in avatarOptions"
                      :key="avatar.key"
                      type="button"
                      :class="cn(
                        'rounded-sm p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        props.selectedAvatarTone === avatar.key && 'ring-2 ring-primary ring-offset-2',
                      )"
                      :aria-label="`选择${avatar.label}头像`"
                      :aria-pressed="props.selectedAvatarTone === avatar.key"
                      @click="handleSelectAvatar(avatar.key)"
                    >
                      <Avatar class="size-14 rounded-sm">
                        <AvatarFallback :class="cn('rounded-sm text-base font-semibold', avatar.class)">
                          {{ avatarFallback }}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <div class="flex-1 space-y-2">
                <label class="text-sm font-medium text-foreground">
                  偏好名称
                </label>
                <div class="flex gap-2">
                  <Input
                    v-model="localPreferredName"
                    placeholder="输入偏好名称"
                    class="h-9 max-w-[280px]"
                  />
                  <Button
                    variant="outline"
                    class="h-9"
                    @click="handleSavePreferredName"
                  >
                    保存
                  </Button>
                </div>
              </div>
            </div>

            <div class="h-6" />

            <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
              <div class="min-w-0 flex-1 gap-1.5">
                <div class="text-sm font-medium text-foreground">
                  用户 ID
                </div>
                <div class="text-sm leading-5 text-muted-foreground">
                  用于定位当前账号。
                </div>
              </div>
              <div class="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:shrink-0">
                <code class="min-w-0 max-w-full truncate rounded bg-muted px-2 py-1 text-sm text-muted-foreground sm:max-w-[320px]">
                  {{ userId }}
                </code>
                <TooltipWrap content="复制用户 ID">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-8 shrink-0"
                    aria-label="复制用户 ID"
                    @click="handleCopyUserId"
                  >
                    <i class="ri-file-copy-line" />
                  </Button>
                </TooltipWrap>
              </div>
            </div>

            <div class="h-6" />

            <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
              <div class="min-w-0 flex-1 gap-1.5">
                <div class="text-sm font-medium text-foreground">
                  退出登录
                </div>
                <div class="text-sm leading-5 text-muted-foreground">
                  真实项目应接入 auth-session 或后端认证服务。
                </div>
              </div>
              <div class="flex shrink-0 items-center justify-end">
                <Button
                  variant="outline"
                  class="h-8 shrink-0 gap-1.5 rounded-md px-3.5 font-medium text-destructive hover:bg-destructive/5 hover:text-destructive"
                  @click="handleLogout"
                >
                  <i class="ri-logout-box-r-line text-base" />
                  退出登录
                </Button>
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  </div>
</template>
