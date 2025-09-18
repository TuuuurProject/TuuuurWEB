<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <SoloSelect v-if="!soloParams" @back="router.push({ name: 'Home' })" @start="startSolo" />
    <SoloQuiz
      v-if="soloParams"
      :categories="soloParams.categories"
      :questions="soloParams.questions"
      :shuffle="soloParams.shuffle"
      @exit="router.push({ name: 'Home' })"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SoloSelect from '@/components/solo/SoloSelect.vue'
import SoloQuiz from '@/components/solo/SoloQuiz.vue'

const router = useRouter()

const soloParams = ref<{ categories: string[]; questions: number; shuffle: boolean } | null>(null)

function startSolo(p: { categories: string[]; questions: number; shuffle: boolean }) {
  soloParams.value = p
  router.push({ name: 'SoloQuiz' })
}
</script>
