<template>
  <p
    class="flex items-center gap-2 text-lg font-bold"
    :class="correct ? 'text-brand-green' : 'text-brand-orange'"
    role="status"
  >
    <font-awesome-icon :icon="correct ? 'check-circle' : 'times-circle'" />
    <template v-if="correct && points">{{
      $t('game.feedback.correctPoints', { points })
    }}</template>
    <template v-else-if="correct">{{ $t('game.feedback.correct') }}</template>
    <template v-else-if="skipped">{{ $t('game.feedback.skipped') }}</template>
    <template v-else-if="timedOut">{{ $t('game.feedback.noAnswer') }}</template>
    <template v-else>{{ $t('game.feedback.wrong') }}</template>
  </p>
</template>

<script setup lang="ts">
defineProps<{
  correct: boolean
  points?: number
  timedOut?: boolean
  skipped?: boolean
}>()
</script>
