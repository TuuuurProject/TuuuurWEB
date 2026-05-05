<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray">{{ $t('group.join.title') }}</h2>
    </header>

    <div class="gaming-card">
      <div class="max-w-md mx-auto">
        <div class="block font-semibold mb-3 text-brand-lightGray">{{ $t('group.join.code') }}</div>
        <div class="flex items-center gap-1 sm:gap-2 justify-center">
          <input
            v-for="i in 6"
            :key="i"
            maxlength="1"
            class="w-10 h-10 sm:w-12 sm:h-12 text-center rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 font-branding text-xl sm:text-2xl shadow-neon text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
            v-model="digits[i - 1]"
            @input="onInput(i - 1)"
            @keydown.backspace.prevent="onBackspace(i - 1)"
            @paste.prevent="handlePaste"
            @keydown.ctrl.v.prevent="handleKeyboardPaste"
          />
        </div>
        <p class="text-center text-brand-gray mt-4">{{ $t('group.join.example') }}</p>

        <div class="mt-8 flex items-center justify-center gap-3">
          <button class="btn btn-secondary" @click="$emit('back')">{{ $t('common.back') }}</button>
          <button class="btn btn-primary" :disabled="!canJoin" @click="join">
            {{ $t('group.join.joinButton') }}
          </button>
        </div>
      </div>

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
            <ul v-for="field in Object.keys(error)" :key="field" class="mt-1 list-disc list-inside">
              <li v-for="(msg, idx) in error[field]" :key="idx">
                {{ typeof msg === 'string' ? msg : msg?.description }}
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>

    <ModalDialog
      :open="showModalUsername"
      :title="$t('group.join.modal.nickname')"
      :loading="userStore.isLoading"
      :confirmation-title="$t('group.join.modal.submit')"
      :disabled-confirm="!username || userStore.isLoading"
      @confirm="joinGroupInvited"
      @close="showModalUsername = false"
    >
      <div class="space-y-3">
        <input
          id="nicknameInputJoin"
          v-model="username"
          type="text"
          class="my-5 font-branding text-2xl text-brand-lightGray bg-transparent border-b-2 border-brand-purple focus:outline-none px-1 w-full"
          :placeholder="$t('group.join.modal.nicknamePlaceholder')"
        />
      </div>

      <div v-if="errorUsername" class="my-5">
        <div
          class="rounded-lg p-4 text-sm text-red-400 bg-red-900/10 border border-red-400"
          role="alert"
        >
          <template
            v-if="
              typeof errorUsername === 'string' ||
              (typeof errorUsername === 'object' && errorUsername?.name?.includes('Axios'))
            "
          >
            {{ errorUsername }}
          </template>
          <template v-else-if="errorUsername && typeof errorUsername === 'object'">
            <ul
              v-for="field in Object.keys(errorUsername)"
              :key="field"
              class="mt-1 list-disc list-inside"
            >
              <li v-for="(msg, idx) in errorUsername[field]" :key="idx">
                {{ typeof msg === 'string' ? msg : msg?.description }}
              </li>
            </ul>
          </template>
        </div>
      </div>
    </ModalDialog>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import useGroupeStore from '@/stores/groupe'
import useUserStore from '@/stores/user'
import ModalDialog from '@/components/ModalDialog.vue'

const groupeStore = useGroupeStore()
const userStore = useUserStore()

interface ErrorMessage {
  description?: string
}

type ErrorField = string | ErrorMessage

const error = ref<Record<string, ErrorField[]> | null>(null)
const errorUsername = ref<Record<string, ErrorField[]> | null>(null)

const digits = reactive<string[]>(['', '', '', '', '', ''])

const showModalUsername = ref(false)

const username = ref('')

const emit = defineEmits<{
  (e: 'joined', joined: boolean): void
  (e: 'back'): void
}>()

watch(
  () => showModalUsername.value,
  (newValue) => {
    if (newValue) {
      setTimeout(() => {
        const input = document.querySelector(
          'input[id="nicknameInputJoin"]',
        ) as HTMLInputElement | null
        input?.focus()
      }, 100)
    }
  },
)

function onInput(idx: number) {
  const el = document.activeElement as HTMLInputElement
  if (el && el.value) el.value = el.value.toUpperCase()
  if (idx < 5) {
    const next = el?.nextElementSibling as HTMLInputElement | null
    next?.focus()
  }
}

function onBackspace(idx: number) {
  const el = document.activeElement as HTMLInputElement
  if (!el) return

  if (digits[idx] !== '') {
    // Si le champ actuel contient une valeur, on la supprime seulement
    // Le focus reste sur le champ actuel pour pouvoir retaper immédiatement
    digits[idx] = ''
  } else if (idx > 0) {
    // Si le champ actuel est vide et qu'on n'est pas sur le premier,
    // on recule au champ précédent et on supprime sa valeur
    const prev = el.previousElementSibling as HTMLInputElement | null
    prev?.focus()
    digits[idx - 1] = ''
  }
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

    if (/^\d{6}$/.test(code)) {
      fillDigits(code)
    }
  } catch {}
}

const handleKeyboardPaste = async () => {
  try {
    const code = await navigator.clipboard.readText()
    const cleanCode = code.replace(/\s|-/g, '')

    if (/^\d{6}$/.test(cleanCode)) {
      fillDigits(cleanCode)
    }
  } catch {}
}

const canJoin = computed(() => {
  return digits.every((d) => d !== '')
})

const join = async () => {
  // If user isn't logged in, ask for username and create temp token
  if (!userStore.isLogged) {
    showModalUsername.value = true
    return
  }

  error.value = await groupeStore.joinGroupe(digits.join(''))

  if (groupeStore.groupeId) emit('joined', true)
  else {
    for (let i = 0; i < 6; i++) {
      digits[i] = ''
    }
  }
}

const joinGroupInvited = async () => {
  if (!username.value) return

  // Create invited token
  await userStore.getInvitedToken(username.value)

  errorUsername.value = await groupeStore.joinGroupe(digits.join(''))

  if (groupeStore.groupeId) {
    showModalUsername.value = false
    username.value = ''

    emit('joined', true)
  } else {
    for (let i = 0; i < 6; i++) {
      digits[i] = ''
    }
  }
}
</script>
