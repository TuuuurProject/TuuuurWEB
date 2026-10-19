<template>
  <button
    type="button"
    class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40 flex items-center justify-center"
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
