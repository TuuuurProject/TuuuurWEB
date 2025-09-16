<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-display text-3xl">Duel 1v1</h2>
      <div class="pill">Questions à difficulté croissante</div>
    </header>

    <div class="rounded-3xl bg-white/80 p-6 shadow-soft border border-brand-dark/10">
      <div class="grid gap-6 md:grid-cols-2 items-center">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-full bg-brand-light/20 flex items-center justify-center text-2xl">🦊</div>
          <div>
            <div class="font-semibold">Vous</div>
            <div class="text-xs text-brand-dark/70">Elo 1200</div>
          </div>
        </div>
        <div class="flex items-center gap-3 md:justify-end">
          <div class="h-12 w-12 rounded-full bg-brand-orange/20 flex items-center justify-center text-2xl">🐯</div>
          <div class="text-right">
            <div class="font-semibold">Adversaire</div>
            <div class="text-xs text-brand-dark/70">Elo 1215</div>
          </div>
        </div>

        <div class="col-span-full grid gap-3">
          <div>
            <div class="text-xs mb-1">Points de vie — Vous</div>
            <div class="h-3 rounded-full bg-brand-dark/10 overflow-hidden">
              <div class="h-3 bg-brand-green w-10/12"></div>
            </div>
          </div>
          <div>
            <div class="text-xs mb-1">Points de vie — Adversaire</div>
            <div class="h-3 rounded-full bg-brand-dark/10 overflow-hidden">
              <div class="h-3 bg-brand-orange w-9/12"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 rounded-2xl border border-brand-dark/10 bg-white/70 p-6 text-center">
        <div class="font-display text-2xl mb-2">Prêts ?</div>
        <p class="text-brand-dark/70">Le quiz commencera dès que les deux joueurs seront prêts.</p>
        <div class="mt-4 flex items-center justify-center gap-3">
          <button class="btn btn-secondary" @click="$emit('back')">Quitter</button>
          <button class="btn btn-primary" @click="$emit('start')">Lancer le quiz</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// UI only, no logic
</script>
