<template>
  <overlay-block :loading="loading">
    <form
      data-testid="auth-code-container"
      class="flex flex-col gap-5"
      @submit.prevent="canSendAuthCode && emit('verification', digits.join(''))"
    >
      <fieldset class="flex flex-col gap-2">
        <legend class="field-label">{{ $t('auth.verification.codeLabel') }}</legend>
        <div class="flex justify-between gap-1.5 sm:gap-2">
          <input
            v-for="i in 6"
            :key="i"
            v-model="digits[i - 1]"
            :data-testid="`auth-code-input-${i}`"
            maxlength="1"
            inputmode="numeric"
            autocomplete="one-time-code"
            :aria-label="$t('group.join.digit', { n: i })"
            class="code-digit"
            @input="onInput(i - 1)"
            @keydown.backspace.prevent="onBackspace(i - 1)"
            @paste.prevent="handlePaste"
            @keydown.ctrl.v.prevent="handleKeyboardPaste"
          />
        </div>
      </fieldset>
      <button
        data-testid="auth-code-submit"
        type="submit"
        class="btn btn-primary w-full py-4"
        :disabled="!canSendAuthCode"
      >
        {{ $t('auth.verification.submit') }}
      </button>
    </form>
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

    if (/^\d{6}$/.test(code)) {
      fillDigits(code)
    }
  } catch {}
}

const handleKeyboardPaste = async () => {
  try {
    const code = await navigator.clipboard.readText()
    const cleanCode = code.replace(/\s|-/g, '')

    if (/^\d{6}$/.test(cleanCode)) {
      fillDigits(cleanCode)
    }
  } catch {}
}

const canSendAuthCode = computed(() => {
  return digits.every((d) => d !== '')
})
</script>
