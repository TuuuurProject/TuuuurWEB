<template>
  <overlay-block :loading="userStore.isLoading">
    <div
      data-testid="profile-info"
      class="gap-4 p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 grid sm:grid-cols-1 md:grid-cols-2"
    >
      <div class="flex items-center gap-3 sm:gap-4">
        <div class="relative group cursor-pointer" @click="triggerFileInput">
          <img
            v-if="userStore.userInfo?.avatar"
            :src="userStore.userInfo?.avatar"
            alt="avatar"
            class="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-brand-purple shadow-neon object-cover"
          />
          <div
            v-else
            class="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-brand-purple flex items-center justify-center"
          >
            <span id="nickaname" class="text-2xl font-bold text-brand-purple">
              {{ userStore.userInfo?.nickName?.charAt(0).toUpperCase() || '?' }}
            </span>
          </div>
          <!-- Camera overlay on hover -->
          <div
            class="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <font-awesome-icon icon="camera" class="text-white text-xl" />
          </div>
          <!-- Hidden file input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />
        </div>
        <div class="flex-1">
          <div v-if="!isEditingNickname" class="flex items-center gap-2">
            <div
              id="nickname"
              class="font-branding text-sm md:text-2xl text-brand-lightGray cursor-pointer hover:text-brand-purple transition-colors flex items-center"
              @click="startEditingNickname"
            >
              {{ userStore.userInfo?.nickName }}
              <font-awesome-icon icon="pen" class="ml-2 text-sm text-brand-purple" />
            </div>
          </div>
          <div v-else class="flex items-center gap-2">
            <input
              ref="nicknameInput"
              v-model="newNickname"
              type="text"
              class="font-branding text-sm md:text-2xl text-brand-lightGray bg-transparent border-b-2 border-brand-purple focus:outline-none px-1"
              @keydown.enter="saveNickname"
              @keydown.escape="cancelEditingNickname"
            />
            <button
              class="text-green-400 hover:text-green-300 transition-colors"
              @click="saveNickname"
            >
              <font-awesome-icon icon="check" />
            </button>
            <button
              class="text-red-400 hover:text-red-300 transition-colors"
              @click="cancelEditingNickname"
            >
              <font-awesome-icon icon="xmark" />
            </button>
          </div>
          <div class="text-sm text-brand-gray">{{ userStore.userInfo?.email }}</div>
        </div>
      </div>
      <div class="text-right flex items-center justify-start sm:justify-end" style="z-index: -1">
        <div class="pill bg-brand-orange/20 border-brand-orange/40 text-brand-orange font-bold">
          <font-awesome-icon icon="trophy" class="mr-1" /> {{ $t('profile.elo') }}:
          {{ userStore.userInfo?.globalElo ?? '—' }}
        </div>
      </div>
    </div>

    <div class="mt-4 gap-5 md:gap-2 grid md:grid-cols-2 sm:grid-cols-1 mx-auto">
      <div>
        <button
          v-if="!userStore.userInfo?.isGoogleUser"
          class="btn btn-ghost border border-brand-purple hover:bg-brand-purple/10 h-full w-full md:w-auto"
          @click="showModalChangePassword = true"
        >
          <font-awesome-icon icon="key" class="mr-2" /> {{ $t('profile.changePassword') }}
        </button>
      </div>
      <div class="gap-5 grid md:grid-cols-2 sm:grid-cols-1">
        <button
          class="btn text-brand-orange hover:bg-brand-orange/10 border border-transparent hover:border-brand-orange"
          @click="showModalCompte = true"
        >
          <font-awesome-icon icon="trash" class="mr-2" /> {{ $t('profile.deleteAccount') }}
        </button>
        <button
          data-testid="profile-logout"
          class="btn btn-ghost text-danger"
          @click="userStore.logout()"
        >
          <font-awesome-icon icon="sign-out-alt" class="mr-2" /> {{ $t('profile.logout') }}
        </button>
      </div>
    </div>
  </overlay-block>

  <ModalDialog
    :open="showModalCompte"
    :title="$t('profile.deleteAccountModal.title')"
    :loading="userStore.isLoading"
    @close="showModalCompte = false"
    @confirm="deleteAccount"
  >
    <div class="space-y-3">
      <p class="font-bold text-lg text-brand-orange">
        {{ $t('profile.deleteAccountModal.warning') }}
      </p>
      <p class="text-brand-lightGray">
        {{ $t('profile.deleteAccountModal.message') }}
      </p>
      <p class="font-bold">
        {{ $t('profile.deleteAccountModal.confirmMessage') }}
      </p>
    </div>
  </ModalDialog>

  <ModalDialog
    :open="showModalChangePassword"
    :title="$t('profile.changePasswordModal.title')"
    :loading="userStore.isLoading"
    :disabledConfirm="!canConfirmPasswordChange"
    @close="showModalChangePassword = false"
    @confirm="changePassword"
  >
    <div class="space-y-3">
      <input-component
        type="password"
        v-model="changePasswordInfo.currentPassword"
        :label="$t('profile.changePasswordModal.currentPassword')"
        :placeholder="$t('profile.changePasswordModal.currentPasswordPlaceholder')"
      />
      <input-component
        type="password"
        v-model="changePasswordInfo.newPassword"
        :label="$t('profile.changePasswordModal.newPassword')"
        :placeholder="$t('profile.changePasswordModal.newPasswordPlaceholder')"
      />
      <input-component
        type="password"
        v-model="changePasswordInfo.confirmNewPassword"
        :label="$t('profile.changePasswordModal.confirmPassword')"
        :placeholder="$t('profile.changePasswordModal.confirmPasswordPlaceholder')"
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
            <li v-for="(msg, idx) in errorsPasswords[field]" :key="idx">
              {{ typeof msg === 'string' ? msg : (msg as any)?.description }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </ModalDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, getCurrentInstance, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import OverlayBlock from '@/components/OverlayBlock.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import InputComponent from '@/components/InputComponent.vue'
import { resizeImage } from '@/services/fileUtils.js'

const { t } = useI18n()
const instance = getCurrentInstance()
const proxy = instance?.proxy

import useUserStore from '@/stores/user.js'

const userStore = useUserStore()
const showModalCompte = ref(false)
const showModalChangePassword = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isEditingNickname = ref(false)
const newNickname = ref('')
const nicknameInput = ref<HTMLInputElement | null>(null)

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
    errorsPasswords.value = {
      password: [t('profile.changePasswordModal.passwordMismatch')],
    }
    return
  }

  errorsPasswords.value = await userStore.changePassword(
    changePasswordInfo.value.currentPassword,
    changePasswordInfo.value.newPassword,
  )

  // If email exist in errors, close the modal and reset
  if (typeof errorsPasswords.value === 'object' && errorsPasswords.value?.email) {
    changePasswordInfo.value = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    }
    showModalChangePassword.value = false

    // Toast to notify user
    if (proxy) {
      ;(proxy as any).$toast.success(t('profile.changePasswordModal.success'))
    }
  }
}

const deleteAccount = async () => {
  const res = await userStore.deleteAccount()
  showModalCompte.value = false

  // Redirect to home page after account deletion
  if (res) {
    router.push({ name: 'Home' })
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    // Compress and convert to base64
    const compressedBase64 = await resizeImage({
      file,
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
    })

    // Update avatar via API
    const result = await userStore.updateAvatar(compressedBase64)

    if (result?.email) {
      // Success - avatar updated
      if (proxy) {
        ;(proxy as any).$toast.success(t('profile.avatar.updateSuccess'))
      }
    } else {
      // Error occurred
      if (proxy) {
        ;(proxy as any).$toast.error(t('profile.avatar.updateError'))
      }
    }
  } catch (error) {
    console.error('Error processing avatar:', error)
    if (proxy) {
      ;(proxy as any).$toast.error(t('profile.avatar.processingError'))
    }
  } finally {
    // Reset file input
    target.value = ''
  }
}

const startEditingNickname = () => {
  newNickname.value = userStore.userInfo?.nickName || ''
  isEditingNickname.value = true
  nextTick(() => {
    nicknameInput.value?.focus()
    nicknameInput.value?.select()
  })
}

const cancelEditingNickname = () => {
  isEditingNickname.value = false
  newNickname.value = ''
}

const saveNickname = async () => {
  if (!newNickname.value.trim()) {
    if (proxy) {
      ;(proxy as any).$toast.error(t('profile.nickname.emptyError'))
    }
    return
  }

  const result = await userStore.updateNickname(newNickname.value.trim())

  if (result?.email) {
    isEditingNickname.value = false
    if (proxy) {
      ;(proxy as any).$toast.success(t('profile.nickname.updateSuccess'))
    }

    // Attribution des nouvelles valeurs
    userStore.userInfo = result
  } else {
    if (proxy) {
      ;(proxy as any).$toast.error(t('profile.nickname.updateError'))
    }
  }
}

onMounted(() => {
  // Get user info to display
  userStore.getUserInfo()
})
</script>
