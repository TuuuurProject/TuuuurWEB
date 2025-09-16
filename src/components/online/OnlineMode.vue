<template>
  <section>
    <CompetitiveSelect v-if="step==='select'" @back="$emit('back')" @search="goSearch" />
    <Matchmaking v-else-if="step==='search'" state="search" @back="step='select'" @duel="step='found'" />
    <Matchmaking v-else-if="step==='found'" state="found" @back="step='select'" @duel="step='duel'" />
    <Duel1v1 v-else-if="step==='duel'" @back="step='select'" @start="$emit('start')" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CompetitiveSelect from './CompetitiveSelect.vue'
import Matchmaking from './Matchmaking.vue'
import Duel1v1 from './Duel1v1.vue'

type Step = 'select' | 'search' | 'found' | 'duel'
const step = ref<Step>('select')

function goSearch(){ step.value = 'search' }
</script>
