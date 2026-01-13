<template>
  <div class="relative">
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center rounded-lg"
      :style="overlayStyle"
      style="z-index: 50"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4"
        style="border-block-color: #6c5ce7"
      ></div>
      <span class="sr-only">{{ $t('common.loading') }}</span>
    </div>
    <slot name="default"> </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
    required: true,
  },
  opacity: {
    type: Number,
    default: 60,
    required: false,
    validator: (value: number) => value >= 0 && value <= 100,
  },
})

const overlayStyle = computed(() => ({
  backgroundColor: `rgba(10,11,30,${props.opacity / 100})`,
  boxShadow: 'inset 0 0 0 10px rgba(10,11,30,0.5)',
}))
</script>
