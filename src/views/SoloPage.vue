<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <SoloSelect v-if="!soloStore.partyId" @back="router.push({ name: 'Home' })" />
    <SoloQuiz v-if="soloStore.partyId" @exit="router.push({ name: 'Home' })" />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import SoloSelect from '@/components/solo/SoloSelect.vue'
import SoloQuiz from '@/components/solo/SoloQuiz.vue'
import useSoloStore from '@/stores/solo.js'

const soloStore = useSoloStore()
const router = useRouter()
</script>
