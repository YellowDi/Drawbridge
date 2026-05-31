import { computed, ref, watch } from "vue"

export type ThemeMode = "light" | "dark"

const STORAGE_KEY = "drawbridge.theme"
const mode = ref<ThemeMode>(readInitialMode())

watch(mode, (value) => {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", value === "dark")
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value)
  }
}, { immediate: true })

export function useThemeMode() {
  const isDark = computed(() => mode.value === "dark")

  function toggleTheme() {
    mode.value = mode.value === "dark" ? "light" : "dark"
  }

  return {
    isDark,
    mode,
    toggleTheme,
  }
}

function readInitialMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light"
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (stored === "light" || stored === "dark") {
    return stored
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}
