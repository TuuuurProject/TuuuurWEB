<template>
  <overlay-block :loading="loading">
    <div data-testid="auth-code-container" class="max-w-md mx-auto">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text text-center mb-4">
        {{ $t('auth.verification.title') }}
      </h2>
      <label class="block font-semibold mb-8 text-brand-green text-center">
        {{ $t('auth.verification.message') }}
      </label>
      <div class="flex items-center gap-1 sm:gap-2 justify-center">
        <input
          v-for="i in 6"
          :key="i"
          :data-testid="`auth-code-input-${i}`"
          maxlength="1"
          class="w-10 h-10 sm:w-12 sm:h-12 text-center rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 font-branding text-xl sm:text-2xl shadow-neon text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
          v-model="digits[i - 1]"
          @input="onInput(i - 1)"
          @keydown.backspace.prevent="onBackspace(i - 1)"
          @paste.prevent="handlePaste"
          @keydown.ctrl.v.prevent="handleKeyboardPaste"
        />
      </div>
      <div class="mt-8 flex items-center justify-center gap-3">
        <button
          data-testid="auth-code-submit"
          class="btn btn-primary"
          :disabled="!canSendAuthCode"
          @click="emit('verification', digits.join(''))"
        >
          {{ $t('auth.verification.submit') }}
        </button>
      </div>
    </div>
  </overlay-block>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import OverlayBlock from '@/components/OverlayBlock.vue'

defineProps<{
  loading: boolean
}>()
const emit = defineEmits<{
  (e: 'verification', code: string): void
}>()

const digits = reactive<string[]>(['', '', '', '', '', ''])

function onInput(idx: number) {
  const el = document.activeElement as HTMLInputElement
  if (el && el.value) el.value = el.value.toUpperCase()
  if (idx < 5) {
    const next = el?.nextElementSibling as HTMLInputElement | null
    next?.focus()
  }
}

function onBackspace(idx: number) {
  const el = document.activeElement as HTMLInputElement
  if (!el) return

  if (digits[idx] !== '') {
    // Si le champ actuel contient une valeur, on la supprime seulement
    // Le focus reste sur le champ actuel pour pouvoir retaper immédiatement
    digits[idx] = ''
  } else if (idx > 0) {
    // Si le champ actuel est vide et qu'on n'est pas sur le premier,
    // on recule au champ précédent et on supprime sa valeur
    const prev = el.previousElementSibling as HTMLInputElement | null
    prev?.focus()
    digits[idx - 1] = ''
  }
}

const fillDigits = (code: string) => {
  // Empty all inputs first
  for (let i = 0; i < 6; i++) {
    digits[i] = ''
  }
  // Then fill with the new code
  for (let i = 0; i < 6; i++) {
    digits[i] = code[i].toUpperCase()
  }
  // Focus the last input
  setTimeout(() => {
    const inputs = document.querySelectorAll('input[maxlength="1"]')
    const lastInput = inputs[5] as HTMLInputElement
    lastInput?.focus()
  }, 10)
}

const handlePaste = async (event: ClipboardEvent) => {
  try {
    const code = event.clipboardData?.getData('text')?.replace(/\s|-/g, '') || ''

    if (/^[0-9]{6}$/.test(code)) {
      fillDigits(code)
    }
  } catch {}
}

const handleKeyboardPaste = async () => {
  try {
    const code = await navigator.clipboard.readText()
    const cleanCode = code.replace(/\s|-/g, '')

    if (/^[0-9]{6}$/.test(cleanCode)) {
      fillDigits(cleanCode)
    }
  } catch {}
}

const canSendAuthCode = computed(() => {
  return digits.every((d) => d !== '')
})
</script>
