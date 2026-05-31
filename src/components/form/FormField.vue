<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(defineProps<{
  label: string
  labelFor?: string
  description?: string
  required?: boolean
  error?: string
}>(), {
  labelFor: "",
  description: "",
  required: false,
  error: "",
})

const controlId = computed(() => props.labelFor || undefined)
</script>

<template>
  <div class="grid gap-1.5">
    <label
      :for="controlId"
      class="text-sm font-medium leading-none text-foreground"
    >
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </label>
    <p v-if="description" class="text-xs leading-5 text-muted-foreground">
      {{ description }}
    </p>
    <slot />
    <p v-if="error" class="text-xs leading-5 text-destructive">
      {{ error }}
    </p>
  </div>
</template>
