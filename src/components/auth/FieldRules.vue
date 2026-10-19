<template>
  <ul class="flex flex-col gap-1.5 text-sm" :aria-label="label">
    <li
      v-for="rule in rules"
      :key="rule.label"
      class="flex items-start gap-2"
      :class="rule.ok ? 'text-brand-green' : 'text-brand-gray'"
    >
      <font-awesome-icon
        :icon="rule.ok ? 'check-circle' : 'circle'"
        class="mt-1 w-4 shrink-0 text-xs"
      />
      {{ rule.label }}
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  rules: Array<{ ok: boolean; label: string }>
  label?: string
}>()
</script>
