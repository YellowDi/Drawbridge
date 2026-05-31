import { computed, watch } from "vue"

import { useDrawbridgeConfig } from "@/composables/useDrawbridgeConfig"

const DEFAULT_FAVICON_HREF = `${import.meta.env.BASE_URL}favicon.png`
const { brand } = useDrawbridgeConfig()

const siteName = computed(() => brand.value.name)
const logoSrc = computed(() => brand.value.logoUrl ?? "")
const logoDarkSrc = computed(() => brand.value.logoDarkUrl ?? brand.value.logoUrl ?? "")
const faviconHref = computed(() => DEFAULT_FAVICON_HREF)

function applyToDocument() {
  if (typeof document === "undefined") {
    return
  }

  document.title = siteName.value

  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
  if (!link) {
    link = document.createElement("link")
    link.rel = "icon"
    document.head.appendChild(link)
  }

  link.type = "image/png"
  link.href = faviconHref.value
}

watch(siteName, applyToDocument, { immediate: true })

export function useGlobalBranding() {
  return {
    siteName,
    logoSrc,
    logoDarkSrc,
    faviconHref,
    applyToDocument,
  }
}
