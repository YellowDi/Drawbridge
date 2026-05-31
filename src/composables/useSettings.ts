import { computed, reactive, ref, watch } from "vue"
import { toast } from "vue-sonner"

import { createSettingsCategories, createSettingsState } from "@/components/settings/settings-data"
import {
  DEFAULT_SETTINGS_CATEGORY_KEY,
  type SettingsActionKey,
  type SettingsCategoryKey,
} from "@/components/settings/types"
import { useAppTheme } from "@/composables/useAppTheme"
import { useDrawbridgeConfig } from "@/composables/useDrawbridgeConfig"

const activeKey = ref<SettingsCategoryKey>(DEFAULT_SETTINGS_CATEGORY_KEY)

export function useSettings() {
  const { user } = useDrawbridgeConfig()
  const { sidebarColor, themeMode } = useAppTheme()
  const state = reactive(createSettingsState(user.value))

  state.themeMode = themeMode.value
  state.sidebarColor = sidebarColor.value

  watch(() => state.themeMode, value => {
    themeMode.value = value
  })

  watch(() => state.sidebarColor, value => {
    sidebarColor.value = value
  })

  const categories = computed(() => createSettingsCategories(user.value))
  const activeCategory = computed(() =>
    categories.value.find(category => category.key === activeKey.value)
    ?? categories.value.find(category => category.key === DEFAULT_SETTINGS_CATEGORY_KEY)
    ?? categories.value[0],
  )

  function setActiveKey(value: SettingsCategoryKey) {
    activeKey.value = value
  }

  function runAction(actionKey: SettingsActionKey) {
    const labels: Record<SettingsActionKey, string> = {
      "open-members-directory": "成员目录入口已保留，可接入真实通讯录。",
      "review-member-invites": "邀请审核入口已保留，可接入真实审批流。",
      "export-settings-schema": "设置 schema 可从配置文件或后端元数据生成。",
      "rotate-api-token": "API token 轮换入口已保留，可接入认证服务。",
    }

    toast.info(labels[actionKey])
  }

  return {
    activeCategory,
    activeKey,
    categories,
    runAction,
    setActiveKey,
    state,
  }
}
