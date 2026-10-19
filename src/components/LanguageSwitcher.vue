<template>
  <select
    v-model="locale"
    class="language-select"
    :aria-label="$t('arena.language')"
    @change="saveLocale"
  >
    <option value="fr" lang="fr">Français</option>
    <option value="en" lang="en">English</option>
  </select>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function saveLocale() {
  try {
    localStorage.setItem('locale', locale.value)
  } catch (error) {
    console.error('Unable to save language preference:', error)
  }
}
</script>
