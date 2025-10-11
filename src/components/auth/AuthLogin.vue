<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="lock" class="mr-2" /> Connexion
      </h2>
      <div class="badge-info">Pseudo + mot de passe</div>
    </header>

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" class="max-w-lg gaming-card mx-auto">
        <overlay-block :loading="userStore.isLoading">
          <form class="space-y-5" @submit.prevent="loginUser">
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="username"
                >Pseudo</label
              >
              <input
                id="username"
                v-model="login"
                type="text"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                placeholder="Votre pseudo"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="password"
                >Mot de passe</label
              >
              <input
                id="password"
                v-model="password"
                type="password"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                placeholder="••••••••"
              />
              <div class="mt-2 text-sm">
                <button type="button" class="pill hover:bg-brand-purple/10">
                  Mot de passe oublié ?
                </button>
              </div>
            </div>
            <div class="pt-2 flex items-center justify-center gap-3">
              <button type="button" class="btn btn-secondary" @click="$emit('back')">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary">Se connecter</button>
            </div>
          </form>

          <div v-if="error" class="my-5">
            <div
              v-for="field in Object.keys(error)"
              :key="field"
              class="rounded-lg p-4 text-sm text-red-400 bg-red-900/10 border border-red-400"
              role="alert"
            >
              <ul class="mt-1 list-disc list-inside">
                <li>{{ error[field]?.description }}</li>
              </ul>
            </div>
          </div>

          <div class="mt-6 text-sm text-brand-gray text-center">
            Pas de compte ?
            <button class="pill hover:bg-brand-purple/10 ml-2" @click="$emit('goto-register')">
              Créer un compte
            </button>
          </div>
        </overlay-block>
      </div>
      <div v-else class="max-w-lg gaming-card mx-auto">
        <overlay-block :loading="userStore.isLoading">
          <div class="max-w-md mx-auto">
            <h2 class="font-branding text-3xl text-brand-lightGray glow-text text-center mb-4">
              Vérification de votre email
            </h2>
            <label class="block font-semibold mb-8 text-brand-green text-center">
              Un code a été envoyé à votre adresse email.
            </label>
            <div class="flex items-center gap-2 justify-center">
              <input
                v-for="i in 6"
                :key="i"
                maxlength="1"
                class="w-12 h-12 text-center rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 font-branding text-2xl shadow-neon text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
                v-model="digits[i - 1]"
                @input="onInput(i - 1)"
                @paste.prevent="handlePaste"
                @keydown.ctrl.v.prevent="handleKeyboardPaste"
              />
            </div>
            <div class="mt-8 flex items-center justify-center gap-3">
              <!-- <button class="btn btn-secondary" @click="step = 1">Retour</button> -->
              <button class="btn btn-primary" @click="verifyEmail">Confirmer</button>
            </div>
          </div>
        </overlay-block>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import useUserStore from '@/stores/user'
import OverlayBlock from '@/components/OverlayBlock.vue'
import router from '@/router'

const login = ref('')
const password = ref('')
const error = ref<Record<string, string[]> | null>(null)
const digits = reactive<string[]>(['', '', '', '', '', ''])
const step = ref(1) // 1: login, 2: verify email

const userStore = useUserStore()

function onInput(idx: number) {
  const el = document.activeElement as HTMLInputElement
  if (el && el.value) el.value = el.value.toUpperCase()
  if (idx < 5) {
    const next = el?.nextElementSibling as HTMLInputElement | null
    next?.focus()
  }
}

// Connect user
const loginUser = async () => {
  if (!login.value || !password.value) return
  error.value = await userStore.login({ login: login.value, password: password.value })
  if (typeof error.value === 'boolean' && error.value) step.value = 2
}

const verifyEmail = async () => {
  error.value = await userStore.verifyEmail({
    login: login.value,
    code: digits.join(''),
  })
  // If token exists in error, redirect to home
  if (error.value && error.value.token) router.push({ name: 'Home' })
}

const fillDigits = (code: string) => {
  // Empty all inputs first
  for (let i = 0; i < 6; i++) {
    digits[i] = ''
  }
  // Then fill with the new code
  for (let i = 0; i < 6; i++) {
    digits[i] = code[i].toUpperCase()
  }
  // Focus the last input
  setTimeout(() => {
    const inputs = document.querySelectorAll('input[maxlength="1"]')
    const lastInput = inputs[5] as HTMLInputElement
    lastInput?.focus()
  }, 10)
}

const handlePaste = async (event: ClipboardEvent) => {
  try {
    const code = event.clipboardData?.getData('text')?.replace(/\s|-/g, '') || ''

    if (/^[0-9]{6}$/.test(code)) {
      fillDigits(code)
    }
  } catch {}
}

const handleKeyboardPaste = async () => {
  try {
    const code = await navigator.clipboard.readText()
    const cleanCode = code.replace(/\s|-/g, '')

    if (/^[0-9]{6}$/.test(cleanCode)) {
      fillDigits(cleanCode)
    }
  } catch {}
}
</script>
