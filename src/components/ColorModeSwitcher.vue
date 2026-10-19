<template>
  <button
    type="button"
    class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-line text-brand-lightGray transition-colors hover:border-brand-purple/50"
    :aria-label="isDark ? $t('nav.colorMode.toLight') : $t('nav.colorMode.toDark')"
    :title="isDark ? $t('nav.colorMode.toLight') : $t('nav.colorMode.toDark')"
    @click="toggle"
  >
    <font-awesome-icon :icon="isDark ? 'sun' : 'moon'" />
  </button>
</template>

<script setup lang="ts">
import { useColorMode } from '@/composables/useColorMode'

const { isDark, toggle } = useColorMode()
</script>
