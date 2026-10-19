<template>
  <overlay-block :loading="userStore.isLoading">
    <div data-testid="profile-info" class="flex flex-col items-center gap-5 text-center">
      <!-- Avatar : cliquer pour le changer -->
      <button
        type="button"
        class="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40"
        :aria-label="$t('profile.avatar.change')"
        :title="$t('profile.avatar.change')"
        @click="triggerFileInput"
      >
        <player-avatar
          :name="userStore.userInfo?.nickName"
          :avatar="userStore.userInfo?.avatar"
          size="xl"
          class="border-4 border-brand-purple"
        />
        <span
          class="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-surface bg-brand-purple text-sm text-white transition-transform group-hover:scale-110"
        >
          <font-awesome-icon icon="camera" />
        </span>
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />

      <!-- Pseudo modifiable -->
      <div class="flex w-full flex-col items-center gap-1">
        <button
          v-if="!isEditingNickname"
          id="nickname"
          type="button"
          class="flex max-w-full items-center gap-2 rounded-xl px-2 text-2xl font-bold transition-colors hover:text-brand-purple"
          :title="$t('profile.nickname.edit')"
          @click="startEditingNickname"
        >
          <span class="truncate">{{ userStore.userInfo?.nickName }}</span>
          <font-awesome-icon icon="pen" class="shrink-0 text-sm text-brand-purple" />
        </button>
        <div v-else class="flex w-full items-center gap-2">
          <input
            ref="nicknameInput"
            v-model="newNickname"
            type="text"
            maxlength="50"
            :aria-label="$t('profile.nickname.edit')"
            class="min-w-0 flex-1 rounded-xl border-2 border-brand-purple bg-brand-surface px-3 py-2 text-lg font-bold text-brand-ink focus:outline-none"
            @keydown.enter="saveNickname"
            @keydown.escape="cancelEditingNickname"
          />
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green"
            :aria-label="$t('common.save')"
            @click="saveNickname"
          >
            <font-awesome-icon icon="check" />
          </button>
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-surface2 text-brand-muted"
            :aria-label="$t('common.cancel')"
            @click="cancelEditingNickname"
          >
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
        <span class="max-w-full truncate text-sm text-brand-muted">{{
          userStore.userInfo?.email
        }}</span>
      </div>

      <div class="flex w-full flex-col gap-1 rounded-2xl bg-brand-surface2/60 p-4">
        <span class="text-sm font-semibold text-brand-muted">
          <font-awesome-icon icon="trophy" class="mr-1 text-brand-yellow" /> {{ $t('profile.elo') }}
        </span>
        <span class="font-display text-4xl font-extrabold tabular-nums">
          {{ userStore.userInfo?.globalElo ?? '—' }}
        </span>
      </div>
    </div>

    <!-- Compte -->
    <div class="mt-6 flex flex-col gap-3 border-t border-brand-line pt-6">
      <button
        v-if="!userStore.userInfo?.isGoogleUser"
        class="btn btn-ghost w-full"
        @click="showModalChangePassword = true"
      >
        <font-awesome-icon icon="key" class="mr-2" /> {{ $t('profile.changePassword') }}
      </button>
      <button data-testid="profile-logout" class="btn btn-ghost w-full" @click="userStore.logout()">
        <font-awesome-icon icon="sign-out-alt" class="mr-2" /> {{ $t('profile.logout') }}
      </button>
      <button
        class="mt-2 self-center text-sm font-semibold text-brand-orange hover:underline"
        @click="showModalCompte = true"
      >
        {{ $t('profile.deleteAccount') }}
      </button>
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
      <p class="text-brand-ink">
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
          class="rounded-2xl border border-brand-orange/40 bg-brand-orange/10 p-4 text-sm font-semibold text-brand-orange"
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
import PlayerAvatar from '@/components/game/PlayerAvatar.vue'
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
    } else if (proxy) {
      // Error occurred
      ;(proxy as any).$toast.error(t('profile.avatar.updateError'))
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

const NICKNAME_REGEX = /^[a-zA-Z0-9\- ]+$/

const saveNickname = async () => {
  const trimmed = newNickname.value.trim()

  if (!trimmed) {
    if (proxy) {
      ;(proxy as any).$toast.error(t('profile.nickname.emptyError'))
    }
    return
  }

  if (trimmed.length > 50 || !NICKNAME_REGEX.test(trimmed)) {
    if (proxy) {
      ;(proxy as any).$toast.error(t('profile.nickname.invalidFormatError'))
    }
    return
  }

  const result = await userStore.updateNickname(trimmed)

  if (result?.email) {
    isEditingNickname.value = false
    if (proxy) {
      ;(proxy as any).$toast.success(t('profile.nickname.updateSuccess'))
    }

    // Attribution des nouvelles valeurs
    userStore.userInfo = result
  } else if (proxy) {
    ;(proxy as any).$toast.error(t('profile.nickname.updateError'))
  }
}

onMounted(() => {
  // Get user info to display
  userStore.getUserInfo()
})
</script>
