<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppTheme } from "@/composables/useAppTheme"
import { clearCurrentUser, useCurrentUser } from "@/composables/useCurrentUser"
import { useDrawbridgeConfig } from "@/composables/useDrawbridgeConfig"
import { clearAuthToken } from "@/lib/auth"
import { cn } from "@/lib/utils"

const router = useRouter()
const { state } = useSidebar()
const { brand } = useDrawbridgeConfig()
const { themeMode, themeOptions } = useAppTheme()
const { currentUser: user } = useCurrentUser()

const open = ref(false)
const userInitial = computed(() => user.value.avatarFallback ?? user.value.name.slice(0, 2).toUpperCase())
const userDescription = computed(() => user.value.role || brand.value.name)
const userContactLine = computed(() => user.value.email)

watch(state, (value) => {
  if (value === "collapsed" && open.value) {
    open.value = false
  }
})

function handleOpenSettings() {
  open.value = false
  void router.push({ name: "settings", params: { category: "me" } })
}

function handleLogout() {
  open.value = false
  clearAuthToken()
  clearCurrentUser()
  void router.push("/")
}
</script>

<template>
  <DropdownMenu v-model:open="open">
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-interactive-hover hover:text-sidebar-accent-foreground"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <Avatar class="size-[22px] rounded-sm">
            <AvatarImage
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              :alt="`${user.name} avatar`"
              class="object-cover"
            />
            <AvatarFallback class="rounded-sm bg-avatar-placeholder text-sidebar-primary">
              <span class="text-[10px] font-semibold">{{ userInitial }}</span>
            </AvatarFallback>
          </Avatar>
          <span class="truncate text-sm font-semibold text-foreground">{{ user.name }}</span>
        </div>
        <i class="ri-arrow-up-s-line shrink-0 text-base text-muted-foreground" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      side="top"
      :side-offset="8"
      align="start"
      :class="cn('w-[280px] rounded-xl border-border p-0 shadow-(--shadow-soft)')"
    >
      <div class="flex flex-col gap-0.5 border-b border-border px-3 py-3">
        <div class="flex items-start gap-2">
          <Avatar class="size-9 rounded-sm">
            <AvatarImage
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              :alt="`${user.name} avatar`"
              class="object-cover"
            />
            <AvatarFallback class="rounded-sm bg-avatar-placeholder text-sidebar-primary">
              <span class="text-sm font-semibold">{{ userInitial }}</span>
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-foreground">{{ user.name }}</span>
            <p class="truncate text-xs text-muted-foreground">{{ userDescription }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ userContactLine }}</p>
          </div>
        </div>
      </div>

      <div class="py-1">
        <div class="px-3 py-1.5">
          <div class="mb-1.5 flex items-center gap-2 text-sm text-foreground">
            <i class="ri-palette-line text-base text-muted-foreground" />
            <span>外观</span>
          </div>
          <Tabs v-model="themeMode" aria-label="主题">
            <TabsList class="w-full">
              <TabsTrigger
                v-for="opt in themeOptions"
                :key="opt.value"
                :value="opt.value"
                class="flex-1 px-2 text-xs"
              >
                <i :class="[opt.icon, 'text-sm']" />
                <span>{{ opt.label }}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <DropdownMenuItem
          as-child
          class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm"
        >
          <button type="button" @click="handleOpenSettings">
            <i class="ri-settings-3-line text-base text-muted-foreground" />
            <span>打开设置</span>
          </button>
        </DropdownMenuItem>

        <DropdownMenuSeparator class="mx-0 my-1 bg-border" />
        <DropdownMenuItem
          as-child
          class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
        >
          <button type="button" @click="handleLogout">
            <i class="ri-logout-box-r-line text-base" />
            <span>退出会话</span>
          </button>
        </DropdownMenuItem>
      </div>

      <div class="border-t border-border px-3 py-2">
        <p class="text-xs text-muted-foreground">{{ brand.name }} template · Adapter ready</p>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
