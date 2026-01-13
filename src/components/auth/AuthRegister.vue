<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="user-plus" class="mr-2" /> {{ $t('auth.register.title') }}
      </h2>
      <div class="badge-success">{{ $t('auth.register.badge') }}</div>
    </header>

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" class="max-w-lg gaming-card mx-auto">
        <overlay-block :loading="userStore.isLoading">
          <form class="space-y-5" @submit.prevent="registerAuth">
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="nickName">
                {{ $t('auth.register.nickname') }}
              </label>
              <input
                id="nickName"
                v-model="registerData.nickName"
                type="text"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                :placeholder="$t('auth.register.nicknamePlaceholder')"
                required
              />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="email">{{
                $t('auth.register.email')
              }}</label>
              <input
                id="email"
                v-model="registerData.email"
                type="email"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                :placeholder="$t('auth.register.emailPlaceholder')"
                required
              />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="password">
                {{ $t('auth.register.password') }}
              </label>
              <input
                id="password"
                v-model="registerData.password"
                type="password"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                :placeholder="$t('auth.register.passwordPlaceholder')"
                required
              />
            </div>
            <div class="pt-2 flex items-center justify-center gap-3">
              <button type="button" class="btn btn-secondary" @click="$emit('back')">
                {{ $t('common.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ $t('auth.register.submit') }}
              </button>
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
                <li v-for="(msg, idx) in error[field]" :key="idx">
                  {{ typeof msg === 'string' ? msg : msg?.description }}
                </li>
              </ul>
            </div>
          </div>

          <div class="mt-6 text-sm text-brand-gray text-center">
            {{ $t('auth.register.alreadyRegistered') }}
            <button class="pill hover:bg-brand-purple/10 ml-2" @click="$emit('goto-login')">
              {{ $t('auth.register.signIn') }}
            </button>
          </div>
        </overlay-block>
      </div>
      <div v-else class="max-w-lg gaming-card mx-auto">
        <auth-code :loading="userStore.isLoading" @verification="verifyEmail" />
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user'
import OverlayBlock from '@/components/OverlayBlock.vue'
import AuthCode from '@/components/auth/AuthCode.vue'

const userStore = useUserStore()
const router = useRouter()

const step = ref(1)

const registerData = ref<{ nickName: string; email: string; password: string }>({
  nickName: '',
  email: '',
  password: '',
})

interface ErrorMessage {
  description?: string
}

type ErrorField = string | ErrorMessage

const error = ref<Record<string, ErrorField[]> | null>(null)

const registerAuth = async () => {
  error.value = await userStore.register(registerData.value)
  if (typeof error.value === 'boolean' && error.value) step.value = 2
}

const verifyEmail = async (code: string) => {
  error.value = await userStore.verifyEmail({
    login: registerData.value.email,
    code: code,
  })
  // If token exists in error, redirect
  if (error.value && error.value.token) {
    if (userStore.comeFrom) {
      const destination = userStore.comeFrom
      userStore.comeFrom = null // Nettoyer après utilisation
      router.push(destination)
    } else {
      router.push({ name: 'Home' })
    }
  }
}
</script>
