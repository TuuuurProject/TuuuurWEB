<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="user-plus" class="mr-2" /> Créer un compte
      </h2>
      <div class="badge-success">Gratuit et rapide</div>
    </header>

    <div class="max-w-lg gaming-card mx-auto">
      <form class="space-y-5" @submit.prevent>
        <div>
          <label class="block font-semibold mb-1 text-brand-lightGray" for="username">Pseudo</label>
          <input
            id="username"
            type="text"
            class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
            placeholder="Choisissez un pseudo"
          />
        </div>
        <div>
          <label class="block font-semibold mb-1 text-brand-lightGray" for="email">Email</label>
          <input
            id="email"
            type="email"
            class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
            placeholder="vous@exemple.com"
          />
        </div>
        <div>
          <label class="block font-semibold mb-1 text-brand-lightGray" for="password"
            >Mot de passe</label
          >
          <input
            id="password"
            type="password"
            class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label class="block font-semibold mb-1 text-brand-lightGray" for="confirm"
            >Confirmer le mot de passe</label
          >
          <input
            id="confirm"
            type="password"
            class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
            placeholder="••••••••"
          />
        </div>
        <div class="pt-2 flex items-center justify-end gap-3">
          <button type="button" class="btn btn-secondary" @click="$emit('back')">Annuler</button>
          <button type="submit" class="btn btn-primary">Créer le compte</button>
        </div>
      </form>
      <div class="mt-6 text-sm text-brand-gray text-center">
        Déjà inscrit ?
        <button class="pill hover:bg-brand-purple/10 ml-2" @click="$emit('goto-login')">
          Se connecter
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// UI only
</script>
