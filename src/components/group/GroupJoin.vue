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
          />
        </div>
        <p class="text-center text-brand-gray mt-4">Exemple: TUR847</p>

        <div class="mt-8 flex items-center justify-center gap-3">
          <button class="btn btn-secondary" @click="$emit('back')">Retour</button>
          <button class="btn btn-primary" @click="join">Rejoindre</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const digits = reactive<string[]>(['', '', '', '', '', ''])

const emit = defineEmits<{ (e: 'joined', payload: { code: string }): void }>()

function onInput(idx: number) {
  const el = document.activeElement as HTMLInputElement
  if (el && el.value) el.value = el.value.toUpperCase()
  if (idx < 5) {
    const next = el?.nextElementSibling as HTMLInputElement | null
    next?.focus()
  }
}
function join() {
  emit('joined', { code: digits.join('') })
}
</script>
