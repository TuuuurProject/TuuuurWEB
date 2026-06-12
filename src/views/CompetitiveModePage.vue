<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <online-mode @back="router.push({ name: 'Home' })" />
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import OnlineMode from '@/components/online/OnlineMode.vue'
import useRankedStore from '@/stores/ranked'

const router = useRouter()
const route = useRoute()
const rankedStore = useRankedStore()

// Assigner synchroniquement pour que OnlineMode (enfant) voie l'id dès son onMounted
const partyId = route.params.id as string
if (partyId && rankedStore.partyId === null) {
  rankedStore.partyId = partyId
}
</script>
