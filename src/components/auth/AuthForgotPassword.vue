<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="key" class="mr-2" /> {{ $t('auth.forgotPassword.title') }}
      </h2>
    </header>

    <transition name="fade" mode="out-in">
      <!-- Step 1: Request code -->
      <div v-if="step === 1" class="max-w-lg mx-auto">
        <overlay-block :loading="userStore.isLoading">
          <form class="space-y-5" @submit.prevent="requestPasswordReset">
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="login">
                {{ $t('auth.forgotPassword.loginLabel') }}
              </label>
              <input
                id="login"
                v-model="login"
                type="text"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                :placeholder="$t('auth.forgotPassword.loginPlaceholder')"
                required
              />
            </div>
            <div class="pt-2 grid gap-3 sm:grid-cols-2 max-w-lg">
              <button type="button" class="btn btn-secondary" @click="$emit('back')">
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!login.trim()"
                :class="{ 'opacity-50 cursor-not-allowed': !login.trim() }"
              >
                {{ $t('auth.forgotPassword.sendCode') }}
              </button>
            </div>
          </form>
        </overlay-block>
      </div>

      <!-- Step 2: Enter code and new password -->
      <div v-else-if="step === 2" class="max-w-lg mx-auto">
        <overlay-block :loading="userStore.isLoading">
          <div class="space-y-6">
            <!-- Code verification -->
            <div>
              <h3 class="font-semibold text-lg text-brand-lightGray mb-2 text-center">
                {{ $t('auth.forgotPassword.codeTitle') }}
              </h3>
              <p class="text-brand-gray text-sm mb-4 text-center">
                {{ $t('auth.forgotPassword.codeDescription') }}
              </p>
              <div class="flex items-center gap-1 sm:gap-2 justify-center">
                <input
                  v-for="i in 6"
                  :key="i"
                  maxlength="1"
                  class="w-10 h-10 sm:w-12 sm:h-12 text-center rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 font-branding text-xl sm:text-2xl shadow-neon text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
                  v-model="codeDigits[i - 1]"
                  @input="onCodeInput(i - 1)"
                  @keydown.backspace.prevent="onCodeBackspace(i - 1)"
                  @paste.prevent="handleCodePaste"
                />
              </div>
            </div>

            <!-- New Password -->
            <form class="space-y-5" @submit.prevent="resetPassword">
              <div>
                <label class="block font-semibold mb-1 text-brand-lightGray" for="newPassword">
                  {{ $t('auth.forgotPassword.newPassword') }}
                </label>
                <input
                  id="newPassword"
                  v-model="newPassword"
                  type="password"
                  class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                  :placeholder="$t('auth.forgotPassword.newPasswordPlaceholder')"
                  required
                />
              </div>
              <div>
                <label
                  class="block font-semibold mb-1 text-brand-lightGray"
                  for="confirmNewPassword"
                >
                  {{ $t('auth.forgotPassword.confirmPassword') }}
                </label>
                <input
                  id="confirmNewPassword"
                  v-model="confirmNewPassword"
                  type="password"
                  class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                  :placeholder="$t('auth.forgotPassword.confirmPasswordPlaceholder')"
                  required
                />
              </div>

              <!-- Password validation rules -->
              <transition name="slide-fade">
                <div
                  v-if="newPassword"
                  class="rounded-lg p-4 bg-brand-darkGray/30 border border-brand-purple/20"
                >
                  <ul class="space-y-1.5 text-sm">
                    <li class="flex items-center gap-2">
                      <font-awesome-icon
                        :icon="passwordRules.minLength ? 'check-circle' : 'times-circle'"
                        :class="passwordRules.minLength ? 'text-green-400' : 'text-red-400'"
                      />
                      <span :class="passwordRules.minLength ? 'text-green-400' : 'text-brand-gray'">
                        {{ $t('auth.register.passwordMinLength') }}
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <font-awesome-icon
                        :icon="passwordRules.hasLowercase ? 'check-circle' : 'times-circle'"
                        :class="passwordRules.hasLowercase ? 'text-green-400' : 'text-red-400'"
                      />
                      <span
                        :class="passwordRules.hasLowercase ? 'text-green-400' : 'text-brand-gray'"
                      >
                        {{ $t('auth.register.passwordLowercase') }}
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <font-awesome-icon
                        :icon="passwordRules.hasUppercase ? 'check-circle' : 'times-circle'"
                        :class="passwordRules.hasUppercase ? 'text-green-400' : 'text-red-400'"
                      />
                      <span
                        :class="passwordRules.hasUppercase ? 'text-green-400' : 'text-brand-gray'"
                      >
                        {{ $t('auth.register.passwordUppercase') }}
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <font-awesome-icon
                        :icon="passwordRules.hasNumber ? 'check-circle' : 'times-circle'"
                        :class="passwordRules.hasNumber ? 'text-green-400' : 'text-red-400'"
                      />
                      <span :class="passwordRules.hasNumber ? 'text-green-400' : 'text-brand-gray'">
                        {{ $t('auth.register.passwordNumber') }}
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <font-awesome-icon
                        :icon="passwordRules.passwordsMatch ? 'check-circle' : 'times-circle'"
                        :class="passwordRules.passwordsMatch ? 'text-green-400' : 'text-red-400'"
                      />
                      <span
                        :class="passwordRules.passwordsMatch ? 'text-green-400' : 'text-brand-gray'"
                      >
                        {{ $t('auth.register.passwordsMatch') }}
                      </span>
                    </li>
                  </ul>
                </div>
              </transition>

              <div v-if="error" class="my-5">
                <div
                  class="rounded-lg p-4 text-sm text-red-400 bg-red-900/10 border border-red-400"
                  role="alert"
                >
                  <template
                    v-if="
                      typeof error === 'string' ||
                      (typeof error === 'object' && error?.name?.includes('Axios'))
                    "
                  >
                    {{ error }}
                  </template>
                  <template v-else-if="error && typeof error === 'object'">
                    <ul
                      v-for="field in Object.keys(error)"
                      :key="field"
                      class="mt-1 list-disc list-inside"
                    >
                      <li v-for="(msg, idx) in error[field]" :key="idx">
                        {{ typeof msg === 'string' ? msg : msg?.description }}
                      </li>
                    </ul>
                  </template>
                </div>
              </div>

              <div class="pt-2 grid gap-3 sm:grid-cols-2 max-w-lg">
                <button type="button" class="btn btn-secondary" @click="$emit('back')">
                  {{ $t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="!isFormValid"
                  :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
                >
                  {{ $t('auth.forgotPassword.resetPassword') }}
                </button>
              </div>
            </form>
          </div>
        </overlay-block>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import useUserStore from '@/stores/user'
import OverlayBlock from '@/components/OverlayBlock.vue'

const { t } = useI18n()
const userStore = useUserStore()
const proxy = getCurrentInstance()?.proxy

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'success'): void
}>()

const step = ref(1) // 1: request code, 2: reset password
const login = ref('')
const codeDigits = reactive<string[]>(['', '', '', '', '', ''])
const newPassword = ref('')
const confirmNewPassword = ref('')

interface ErrorMessage {
  description?: string
}

type ErrorField = string | ErrorMessage

const error = ref<Record<string, ErrorField[]> | null>(null)

// Password validation rules (reused from AuthRegister)
const passwordRules = computed(() => ({
  minLength: newPassword.value.length >= 8,
  hasLowercase: /[a-z]/.test(newPassword.value),
  hasUppercase: /[A-Z]/.test(newPassword.value),
  hasNumber: /[0-9]/.test(newPassword.value),
  passwordsMatch:
    newPassword.value === confirmNewPassword.value &&
    newPassword.value.length > 0 &&
    confirmNewPassword.value.length > 0,
}))

const canSendCode = computed(() => {
  return codeDigits.every((d) => d !== '')
})

const isFormValid = computed(() => {
  return (
    canSendCode.value &&
    passwordRules.value.minLength &&
    passwordRules.value.hasLowercase &&
    passwordRules.value.hasUppercase &&
    passwordRules.value.hasNumber &&
    passwordRules.value.passwordsMatch
  )
})

// Request password reset code
const requestPasswordReset = async () => {
  if (!login.value.trim()) return

  error.value = null
  const result = await userStore.forgotPassword(login.value)

  if (result === null || result === true) {
    // Success
    if (proxy) {
      ;(proxy as any).$toast.success(t('auth.forgotPassword.codeSent'))
    }
    step.value = 2
  } else {
    // Error
    if (proxy) {
      ;(proxy as any).$toast.error(t('auth.forgotPassword.codeError'))
    }
    error.value = result
  }
}

// Reset password
const resetPassword = async () => {
  if (!isFormValid.value) return

  error.value = null
  const code = codeDigits.join('')
  const result = await userStore.resetPassword(login.value, newPassword.value, code)

  if (result === null || result === true || (result && result.token)) {
    // Success
    if (proxy) {
      ;(proxy as any).$toast.success(t('auth.forgotPassword.resetSuccess'))
    }
    emit('success')
  } else {
    // Error
    if (proxy) {
      ;(proxy as any).$toast.error(t('auth.forgotPassword.resetError'))
    }
    error.value = result
  }
}

// Code input handlers (reused from AuthCode)
function onCodeInput(idx: number) {
  const el = document.activeElement as HTMLInputElement
  if (el && el.value) el.value = el.value.toUpperCase()
  if (idx < 5) {
    const next = el?.nextElementSibling as HTMLInputElement | null
    next?.focus()
  }
}

function onCodeBackspace(idx: number) {
  const el = document.activeElement as HTMLInputElement
  if (!el) return

  if (codeDigits[idx] !== '') {
    codeDigits[idx] = ''
  } else if (idx > 0) {
    const prev = el.previousElementSibling as HTMLInputElement | null
    prev?.focus()
    codeDigits[idx - 1] = ''
  }
}

const fillCodeDigits = (code: string) => {
  for (let i = 0; i < 6; i++) {
    codeDigits[i] = ''
  }
  for (let i = 0; i < 6 && i < code.length; i++) {
    codeDigits[i] = code[i].toUpperCase()
  }
  setTimeout(() => {
    const inputs = document.querySelectorAll('input[maxlength="1"]')
    const lastInput = inputs[5] as HTMLInputElement
    lastInput?.focus()
  }, 10)
}

const handleCodePaste = async (event: ClipboardEvent) => {
  try {
    const code = event.clipboardData?.getData('text')?.replace(/\s|-/g, '') || ''

    if (/^[0-9]{6}$/.test(code)) {
      fillCodeDigits(code)
    }
  } catch {}
}
</script>

<style scoped>
/* Transition smooth pour l'apparition du panneau de validation */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
