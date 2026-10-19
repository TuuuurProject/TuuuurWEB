<template>
  <section class="flex flex-col gap-6">
    <transition name="fade" mode="out-in">
      <!-- Step 1: Request code -->
      <div v-if="step === 1">
        <overlay-block :loading="userStore.isLoading">
          <form class="flex flex-col gap-5" @submit.prevent="requestPasswordReset">
            <div>
              <label class="field-label" for="login">
                {{ $t('auth.forgotPassword.loginLabel') }}
              </label>
              <input
                id="login"
                v-model="login"
                type="text"
                class="field-input"
                :placeholder="$t('auth.forgotPassword.loginPlaceholder')"
                required
              />
            </div>
            <div class="flex flex-col gap-3">
              <button type="submit" class="btn btn-primary w-full py-4" :disabled="!login.trim()">
                {{ $t('auth.forgotPassword.sendCode') }}
              </button>
              <button type="button" class="text-link self-center text-sm" @click="$emit('back')">
                {{ $t('auth.forgotPassword.backToLogin') }}
              </button>
            </div>
          </form>
        </overlay-block>
      </div>

      <!-- Step 2: Enter code and new password -->
      <div v-else-if="step === 2">
        <overlay-block :loading="userStore.isLoading">
          <div class="flex flex-col gap-6">
            <!-- Code verification -->
            <div>
              <h3 class="field-label">
                {{ $t('auth.forgotPassword.codeTitle') }}
              </h3>
              <p class="mb-3 text-sm text-brand-muted">
                {{ $t('auth.forgotPassword.codeDescription') }}
              </p>
              <div class="flex justify-between gap-1.5 sm:gap-2">
                <input
                  v-for="i in 6"
                  :key="i"
                  maxlength="1"
                  class="code-digit"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  :aria-label="$t('group.join.digit', { n: i })"
                  v-model="codeDigits[i - 1]"
                  @input="onCodeInput(i - 1)"
                  @keydown.backspace.prevent="onCodeBackspace(i - 1)"
                  @paste.prevent="handleCodePaste"
                />
              </div>
            </div>

            <!-- New Password -->
            <form class="flex flex-col gap-5" @submit.prevent="resetPassword">
              <div>
                <label class="field-label" for="newPassword">
                  {{ $t('auth.forgotPassword.newPassword') }}
                </label>
                <input
                  id="newPassword"
                  v-model="newPassword"
                  type="password"
                  class="field-input"
                  :placeholder="$t('auth.forgotPassword.newPasswordPlaceholder')"
                  required
                />
              </div>
              <div>
                <label class="field-label" for="confirmNewPassword">
                  {{ $t('auth.forgotPassword.confirmPassword') }}
                </label>
                <input
                  id="confirmNewPassword"
                  v-model="confirmNewPassword"
                  type="password"
                  class="field-input"
                  :placeholder="$t('auth.forgotPassword.confirmPasswordPlaceholder')"
                  required
                />
              </div>

              <field-rules v-if="newPassword" :rules="passwordRuleList" />

              <div v-if="error">
                <div class="form-error" role="alert">
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

              <div class="flex flex-col gap-3">
                <button type="submit" class="btn btn-primary w-full py-4" :disabled="!isFormValid">
                  {{ $t('auth.forgotPassword.resetPassword') }}
                </button>
                <button type="button" class="text-link self-center text-sm" @click="$emit('back')">
                  {{ $t('auth.forgotPassword.backToLogin') }}
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
import FieldRules from '@/components/auth/FieldRules.vue'
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
  hasNumber: /\d/.test(newPassword.value),
  passwordsMatch:
    newPassword.value === confirmNewPassword.value &&
    newPassword.value.length > 0 &&
    confirmNewPassword.value.length > 0,
}))

const passwordRuleList = computed(() => [
  { ok: passwordRules.value.minLength, label: t('auth.register.passwordMinLength') },
  { ok: passwordRules.value.hasLowercase, label: t('auth.register.passwordLowercase') },
  { ok: passwordRules.value.hasUppercase, label: t('auth.register.passwordUppercase') },
  { ok: passwordRules.value.hasNumber, label: t('auth.register.passwordNumber') },
  { ok: passwordRules.value.passwordsMatch, label: t('auth.register.passwordsMatch') },
])

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

    if (/^\d{6}$/.test(code)) {
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
