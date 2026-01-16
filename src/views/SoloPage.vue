<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <SoloSelect v-if="!soloStore.partyId" @back="handleExit" />
    <SoloQuiz v-if="soloStore.partyId" @exit="handleExit" />
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import SoloSelect from '@/components/solo/SoloSelect.vue'
import SoloQuiz from '@/components/solo/SoloQuiz.vue'
import useSoloStore from '@/stores/solo.js'

const soloStore = useSoloStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  // Si un ID est présent dans l'URL, l'assigner au store
  const partyId = route.params.id as string
  if (partyId && soloStore.partyId === null) {
    soloStore.partyId = partyId
  }
})

const handleExit = () => {
  soloStore.resetSoloParty()
  router.replace({ name: 'SoloQuiz' })
}
</script>
