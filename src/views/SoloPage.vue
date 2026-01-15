<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <SoloSelect v-if="!soloStore.partyId" @back="handleBack" />
    <SoloQuiz v-if="soloStore.partyId" @exit="handleExit" />
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { onMounted, watch } from 'vue'
import SoloSelect from '@/components/solo/SoloSelect.vue'
import SoloQuiz from '@/components/solo/SoloQuiz.vue'
import useSoloStore from '@/stores/solo.js'

const soloStore = useSoloStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  // Si un ID est présent dans l'URL, l'assigner au store
  const partyId = route.params.id as string
  if (partyId) {
    soloStore.partyId = partyId
  }
})

// Si un ID est présent dans l'URL, l'assigner au store
watch(
  () => route.params.id,
  (partyId) => {
    if (partyId && typeof partyId === 'string') {
      soloStore.partyId = partyId
    }
  },
)

// Nettoyer le state après avoir quitté la page
onBeforeRouteLeave(() => {
  // Nettoyer seulement après que la navigation soit complète
  setTimeout(() => {
    soloStore.resetSoloParty()
  }, 0)
  return true
})

const handleBack = () => {
  router.go(-1)
}

const handleExit = () => {
  // Naviguer immédiatement sans nettoyer le state
  // Le nettoyage sera fait par onBeforeRouteLeave
  router.go(-1)
}
</script>
