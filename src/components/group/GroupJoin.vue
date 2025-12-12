<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray">Rejoindre une partie</h2>
      <div class="pill">Entrez le code du salon</div>
    </header>

    <div class="gaming-card">
      <div class="max-w-md mx-auto">
        <label class="block font-semibold mb-3 text-brand-lightGray">Code de la partie</label>
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
        <p class="text-center text-brand-gray mt-4">Exemple: 538950</p>

        <div class="mt-8 flex items-center justify-center gap-3">
          <button class="btn btn-secondary" @click="$emit('back')">Retour</button>
          <button class="btn btn-primary" @click="join">Rejoindre</button>
        </div>
      </div>

      <div v-if="error" class="my-5">
        <div
          class="rounded-lg p-4 text-sm text-red-400 bg-red-900/10 border border-red-400"
          role="alert"
        >
          <ul class="mt-1 list-disc list-inside">
            <li v-for="(msg, idx) in error" :key="idx">{{ (msg as ErrorMessage)?.description }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import useGroupeStore from '@/stores/groupe'

const groupeStore = useGroupeStore()

interface ErrorMessage {
  description?: string
}

type ErrorField = string | ErrorMessage

const error = ref<Record<string, ErrorField[]> | null>(null)

const digits = reactive<string[]>(['', '', '', '', '', ''])

const emit = defineEmits<{
  (e: 'joined', joined: boolean): void
  (e: 'back'): void
}>()

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

const join = async () => {
  error.value = await groupeStore.joinGroupe(digits.join(''))

  if (groupeStore.groupeId) emit('joined', true)
  else {
    for (let i = 0; i < 6; i++) {
      digits[i] = ''
    }
  }
}
</script>
