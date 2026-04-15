<template>
  <div>
    <label for="input_component" v-if="props.label" class="block mb-1 font-medium text-brand-lightGray">
      {{ props.label }}
    </label>

    <input
      id="input_component"
      :value="props.modelValue"
      :disabled="props.disabled"
      :type="props.type"
      class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 backdrop-blur px-4 py-3 shadow-card focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple text-brand-lightGray placeholder-brand-gray"
      :placeholder="props.placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
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
