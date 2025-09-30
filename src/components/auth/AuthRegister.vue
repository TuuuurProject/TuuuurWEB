<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="user-plus" class="mr-2" /> Créer un compte
      </h2>
      <div class="badge-success">Simple</div>
    </header>

    <div class="max-w-lg gaming-card mx-auto">
      <overlay-block :loading="userStore.isLoading">
        <form class="space-y-5" @submit.prevent="registerAuth">
          <div>
            <label class="block font-semibold mb-1 text-brand-lightGray" for="nickName"
              >Pseudo</label
            >
            <input
              id="nickName"
              v-model="registerData.nickName"
              type="text"
              class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
              placeholder="Choisissez un pseudo"
              required
            />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-brand-lightGray" for="email">Email</label>
            <input
              id="email"
              v-model="registerData.email"
              type="email"
              class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
              placeholder="vous@exemple.com"
              required
            />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-brand-lightGray" for="password">
              Mot de passe
            </label>
            <input
              id="password"
              v-model="registerData.password"
              type="password"
              class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
              placeholder="••••••••"
              required
            />
          </div>
          <div class="pt-2 flex items-center justify-center gap-3">
            <button type="button" class="btn btn-secondary" @click="$emit('back')">Annuler</button>
            <button type="submit" class="btn btn-primary">Créer le compte</button>
          </div>
        </form>

        <div v-if="error" class="my-5">
          <div
            v-for="field in Object.keys(error)"
            :key="field"
            class="rounded-lg p-4 text-sm text-red-400 bg-red-900/10 border border-red-400"
            role="alert"
          >
            <strong class="font-medium capitalize">{{ field }}:</strong>
            <ul class="mt-1 list-disc list-inside">
              <li v-for="(message, index) in error[field]" :key="index">{{ message }}</li>
            </ul>
          </div>
        </div>

        <div class="mt-6 text-sm text-brand-gray text-center">
          Déjà inscrit ?
          <button class="pill hover:bg-brand-purple/10 ml-2" @click="$emit('goto-login')">
            Se connecter
          </button>
        </div>
      </overlay-block>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useUserStore from '@/stores/user'
import OverlayBlock from '@/components/OverlayBlock.vue'

const userStore = useUserStore()

const registerData = ref<{ nickName: string; email: string; password: string }>({
  nickName: '',
  email: '',
  password: '',
})

const error = ref<Record<string, string[]> | null>(null)

const registerAuth = async () => {
  error.value = await userStore.register(registerData.value)
}
</script>
