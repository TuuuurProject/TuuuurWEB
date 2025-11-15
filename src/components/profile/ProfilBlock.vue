<template>
  <overlay-block :loading="userStore.isLoading">
    <div
      class="flex items-center gap-4 p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/20"
    >
      <div class="relative">
        <img
          v-if="userStore.userInfo?.avatar"
          :src="userStore.userInfo?.avatar"
          alt="avatar"
          class="h-16 w-16 rounded-full border-2 border-brand-purple shadow-neon object-cover"
        />
        <div
          v-else
          class="h-16 w-16 rounded-full border-2 border-brand-purple flex items-center justify-center"
        >
          <span class="text-2xl font-bold text-brand-purple">
            {{ userStore.userInfo?.nickName?.charAt(0).toUpperCase() || '?' }}
          </span>
        </div>
      </div>
      <div class="flex-1">
        <div class="font-branding text-2xl text-brand-lightGray">
          {{ userStore.userInfo?.nickName }}
        </div>
        <div class="text-sm text-brand-gray">{{ userStore.userInfo?.email }}</div>
      </div>
      <div class="text-right">
        <div class="pill bg-brand-orange/20 border-brand-orange/40 text-brand-orange font-bold">
          <font-awesome-icon icon="trophy" class="mr-1" /> Élo: 1210
        </div>
        <!-- <button class="btn btn-ghost mt-2 text-xs py-1 px-3" @click="openPicker = true">
          <font-awesome-icon icon="cog" class="mr-1" /> Modifier avatar
        </button> -->
      </div>
    </div>

    <div>
      <div class="mt-4 flex items-center justify-between gap-2">
        <button
          class="btn btn-ghost border border-brand-purple hover:bg-brand-purple/10"
          @click="showModalChangePassword = true"
        >
          <font-awesome-icon icon="key" class="mr-2" /> Changer de mot de passe
        </button>
        <div class="flex gap-5">
          <button
            class="btn text-brand-orange hover:bg-brand-orange/10 hover:border hover:border-brand-orange"
            @click="showModalCompte = true"
          >
            <font-awesome-icon icon="trash" class="mr-2" /> Supprimer mon compte
          </button>
          <button class="btn btn-ghost text-danger" @click="userStore.logout()">
            <font-awesome-icon icon="sign-out-alt" class="mr-2" /> Se déconnecter
          </button>
        </div>
      </div>
    </div>
  </overlay-block>

  <ModalDialog
    :open="showModalCompte"
    title="Suppression de votre compte"
    :loading="userStore.isLoading"
    @close="showModalCompte = false"
    @confirm="deleteAccount"
  >
    <div class="space-y-3">
      <p class="font-bold text-lg text-brand-orange">Attention !</p>
      <p class="text-brand-lightGray">
        Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et
        entraînera la perte de toutes vos données.
      </p>
      <p class="font-bold">
        Veuillez confirmer cette action en cliquant sur le bouton "Confirmer".
      </p>
    </div>
  </ModalDialog>

  <ModalDialog
    :open="showModalChangePassword"
    title="Changement de votre mot de passe"
    :loading="userStore.isLoading"
    :disabledConfirm="!canConfirmPasswordChange"
    @close="showModalChangePassword = false"
    @confirm="changePassword"
  >
    <div class="space-y-3">
      <input-component
        type="password"
        v-model="changePasswordInfo.currentPassword"
        label="Mot de passe actuel"
        placeholder="Entrez votre mot de passe actuel"
      />
      <input-component
        type="password"
        v-model="changePasswordInfo.newPassword"
        label="Nouveau mot de passe"
        placeholder="Entrez votre nouveau mot de passe"
      />
      <input-component
        type="password"
        v-model="changePasswordInfo.confirmNewPassword"
        label="Confirmez le nouveau mot de passe"
        placeholder="Confirmez votre nouveau mot de passe"
      />

      <div v-if="errorsPasswords" class="my-5">
        <div
          class="rounded-lg p-4 text-sm text-red-400 bg-red-900/10 border border-red-400"
          role="alert"
        >
          <ul
            v-for="field in Object.keys(errorsPasswords)"
            :key="field"
            class="mt-1 list-disc list-inside"
          >
            <li>{{ errorsPasswords[field]?.description }}</li>
          </ul>
        </div>
      </div>
    </div>
  </ModalDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import router from '@/router'
import OverlayBlock from '@/components/OverlayBlock.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import InputComponent from '@/components/InputComponent.vue'

import useUserStore from '@/stores/user.js'

const userStore = useUserStore()
const showModalCompte = ref(false)
const showModalChangePassword = ref(false)

const changePasswordInfo = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const errorsPasswords = ref<Record<string, string[]> | null>(null)

const canConfirmPasswordChange = computed(() => {
  return (
    changePasswordInfo.value.currentPassword.length > 0 &&
    changePasswordInfo.value.newPassword.length > 0 &&
    changePasswordInfo.value.confirmNewPassword.length > 0
  )
})

const changePassword = async () => {
  if (changePasswordInfo.value.newPassword !== changePasswordInfo.value.confirmNewPassword) {
    errorsPasswords.value = [
      {
        code: '',
        description: 'Le nouveau mot de passe et sa confirmation ne correspondent pas.',
      },
    ]
    return
  }

  errorsPasswords.value = await userStore.changePassword(
    changePasswordInfo.value.currentPassword,
    changePasswordInfo.value.newPassword,
  )

  console.log('errorsPasswords.value', errorsPasswords.value)

  // If email exist in errors, close the modal and reset
  if (typeof errorsPasswords.value === 'object' && errorsPasswords.value?.email) {
    changePasswordInfo.value = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    }
    showModalChangePassword.value = false
  }
}

const deleteAccount = async () => {
  await userStore.deleteAccount()
  showModalCompte.value = false

  // Redirect to home page after account deletion
  router.push('/')
}

onMounted(() => {
  // Get user info to display
  userStore.getUserInfo()
})
</script>
