<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="font-display text-xl">Choisir un avatar</h4>
      <button class="pill" @click="randomize">Aléatoire</button>
    </div>

    <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
      <button
        v-for="seed in seeds"
        :key="seed"
        type="button"
        class="relative rounded-2xl border border-brand-dark/10 bg-white p-2 hover:shadow-soft transition"
        :class="selected === urlForSeed(seed) ? 'ring-2 ring-brand-light/40' : ''"
        @click="select(urlForSeed(seed))"
      >
        <img :src="urlForSeed(seed)" :alt="seed" class="h-16 w-16 rounded-xl object-cover bg-white" />
        <div class="mt-2 text-xs text-center truncate">{{ seed }}</div>
      </button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <div>
        <label class="block text-sm font-semibold mb-1">Depuis une URL</label>
        <input
          type="url"
          v-model="urlInput"
          placeholder="https://exemple.com/avatar.png"
          class="w-full rounded-2xl border border-brand-dark/10 bg-white px-3 py-2 shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-light/30"
        />
        <div class="mt-2 flex items-center gap-3" v-if="urlInput">
          <img :src="urlInput" alt="preview" class="h-12 w-12 rounded-xl border border-brand-dark/10 bg-white object-cover" />
          <button class="btn btn-secondary" @click="select(urlInput)">Utiliser</button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-semibold mb-1">Téléverser une image</label>
        <input type="file" accept="image/*" @change="onFile" class="block w-full text-sm" />
        <div class="mt-2 flex items-center gap-3" v-if="filePreview">
          <img :src="filePreview" alt="upload" class="h-12 w-12 rounded-xl border border-brand-dark/10 bg-white object-cover" />
          <button class="btn btn-secondary" @click="select(filePreview)">Utiliser</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ selected: string | null }>()
const emit = defineEmits<{ (e: 'update:selected', url: string): void }>()

const seeds = [
  'Renard', 'Panda', 'Tigre', 'Loutre', 'Koala', 'Aigle', 'Lynx', 'Loup', 'Cerf', 'Bison',
]

const urlInput = ref('')
const filePreview = ref('')

function urlForSeed(seed: string) {
  const s = encodeURIComponent(seed)
  return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${s}`
}
function select(url: string) {
  emit('update:selected', url)
}
function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files && input.files[0]
  if (!f) return
  const url = URL.createObjectURL(f)
  filePreview.value = url
}
function randomize() {
  const i = Math.floor(Math.random() * seeds.length)
  select(urlForSeed(seeds[i]))
}

const selected = props.selected
</script>
