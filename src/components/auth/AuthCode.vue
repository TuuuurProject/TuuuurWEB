<template>
  <overlay-block :loading="loading">
    <div class="max-w-md mx-auto">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text text-center mb-4">
        Vérification de votre email
      </h2>
      <label class="block font-semibold mb-8 text-brand-green text-center">
        Un code a été envoyé à votre adresse email.
      </label>
      <div class="flex items-center gap-2 justify-center">
        <input
          v-for="i in 6"
          :key="i"
          maxlength="1"
          class="w-12 h-12 text-center rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 font-branding text-2xl shadow-neon text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
          v-model="digits[i - 1]"
          @input="onInput(i - 1)"
          @paste.prevent="handlePaste"
          @keydown.ctrl.v.prevent="handleKeyboardPaste"
        />
      </div>
      <div class="mt-8 flex items-center justify-center gap-3">
        <!-- <button class="btn btn-secondary" @click="step = 1">Retour</button> -->
        <button class="btn btn-primary" @click="emit('verification', digits.join(''))">
          Confirmer
        </button>
      </div>
    </div>
  </overlay-block>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
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
</script>
