<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-display text-3xl text-brand-lightGray glow-text">👤 Profil Joueur</h2>
      <div class="badge-info">Aperçu — UI uniquement</div>
    </header>

    <div class="">
      <div class="gaming-card justify-self-center w-full">
        <!-- Logged in -->
        <div v-if="userStore.isLogged" class="space-y-6">
          <!-- Profil utilisateur avec design gaming -->
          <div
            class="flex items-center gap-4 p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/20"
          >
            <div class="relative">
              <img
                :src="avatarUrl"
                alt="avatar"
                class="h-16 w-16 rounded-full border-2 border-brand-purple shadow-neon object-cover"
              />
              <div
                class="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-green rounded-full border-2 border-brand-darkGray flex items-center justify-center"
              >
                <font-awesome-icon icon="fire" class="text-xs" />
              </div>
            </div>
            <div class="flex-1">
              <div class="font-branding text-2xl text-brand-lightGray">sanbiX</div>
              <div class="text-sm text-brand-gray">Joueur #123456</div>
              <div class="flex items-center gap-2 mt-1">
                <span class="badge-success">Actif</span>
                <span class="badge-warning">Niveau 12</span>
              </div>
            </div>
            <div class="text-right">
              <div
                class="pill bg-brand-orange/20 border-brand-orange/40 text-brand-orange font-bold"
              >
                <font-awesome-icon icon="trophy" class="mr-1" /> Élo: 1210
              </div>
              <button class="btn btn-ghost mt-2 text-xs py-1 px-3" @click="openPicker = true">
                <font-awesome-icon icon="cog" class="mr-1" /> Modifier avatar
              </button>
            </div>
          </div>

          <ModalDialog
            :open="openPicker"
            title="Choisir un avatar gaming"
            @close="openPicker = false"
            @confirm="applyAvatar"
          >
            <AvatarPicker v-model:selected="tempAvatar" />
          </ModalDialog>

          <!-- Section sécurité redesignée -->
          <!-- <div class="p-4 rounded-2xl bg-brand-darkGray/50 border border-brand-purple/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan"
                >
                  🔒
                </div>
                <div>
                  <div class="font-semibold text-brand-lightGray">Sécurité</div>
                  <div class="text-xs text-brand-gray">Réinitialisez votre mot de passe</div>
                </div>
              </div>
              <button class="btn btn-ghost">🔄 Réinitialiser</button>
            </div>
          </div> -->

          <!-- Historique des parties avec style gaming -->
          <div>
            <!-- <h4 class="font-display text-xl mb-4 text-brand-lightGray flex items-center gap-2">
              📈 Historique des parties
              <span class="badge-info text-xs">Dernières sessions</span>
            </h4>
            <ul class="space-y-3">
              <li class="gaming-card p-4 flex items-center gap-4">
                <div
                  class="w-8 h-8 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green font-bold text-sm"
                >
                  S
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-brand-lightGray">Mode Solo</span>
                    <span class="text-brand-green">• Score 870</span>
                  </div>
                  <div class="text-xs text-brand-gray">Aujourd'hui à 12:45</div>
                </div>
                <div class="badge-success">+12 Élo</div>
              </li>
              <li class="gaming-card p-4 flex items-center gap-4">
                <div
                  class="w-8 h-8 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange font-bold text-sm"
                >
                  D
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-brand-lightGray">Duel 1v1</span>
                    <span class="text-brand-orange">• Victoire 3-1</span>
                  </div>
                  <div class="text-xs text-brand-gray">Hier à 18:22</div>
                </div>
                <div class="badge-warning">+8 Élo</div>
              </li>
            </ul> -->
            <div class="mt-4 flex items-center justify-end">
              <!-- <button class="btn btn-ghost" disabled>
                <font-awesome-icon icon="chart-bar" class="mr-2" /> Voir toutes les statistiques
              </button> -->

              <button class="btn btn-ghost" @click="userStore.logout()">
                <font-awesome-icon icon="sign-out-alt" class="mr-2" /> Se déconnecter
              </button>
            </div>
          </div>
        </div>
        <!-- Not logged in -->
        <div v-else class="text-center p-6 text-brand-gray">
          <p class="mb-4">Vous n'êtes pas connecté.</p>
          <div class="flex items-center justify-center gap-6">
            <button class="btn btn-primary" @click="router.push({ name: 'Login' })">
              <font-awesome-icon icon="lock" class="mr-2" /> Se connecter
            </button>

            <button class="btn btn-secondary ml-2" @click="router.push({ name: 'Register' })">
              <font-awesome-icon icon="user-plus" class="mr-2" /> Créer un compte
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModalDialog from '../ModalDialog.vue'
import AvatarPicker from './AvatarPicker.vue'

import useUserStore from '@/stores/user.js'
import router from '@/router'

const userStore = useUserStore()

const username = 'sanbiX'
const avatarUrl = ref(
  `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(username)}`,
)
const openPicker = ref(false)
const tempAvatar = ref(avatarUrl.value)

function applyAvatar() {
  avatarUrl.value = tempAvatar.value
  openPicker.value = false
}
</script>
