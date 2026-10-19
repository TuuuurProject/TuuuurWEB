<template>
  <div>
    <label v-if="props.label" :for="inputId" class="field-label">
      {{ props.label }}
    </label>

    <input
      :id="inputId"
      :value="props.modelValue"
      :disabled="props.disabled"
      :type="props.type"
      class="field-input"
      :placeholder="props.placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const inputId = useId()
const props = withDefaults(
  defineProps<{
    modelValue: string
    disabled?: boolean
    label?: string
    placeholder?: string
    type?: string
  }>(),
  {
    disabled: false,
    label: '',
    placeholder: '',
    type: 'text',
  },
)
defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>
