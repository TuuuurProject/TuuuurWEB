<template>
  <div class="flex flex-col gap-4">
    <form class="flex flex-col gap-4" @submit.prevent="join">
      <fieldset class="flex flex-col gap-2">
        <legend class="mb-2 text-sm font-semibold text-brand-muted">
          {{ $t('group.join.code') }}
        </legend>
        <div class="flex justify-between gap-1.5 sm:gap-2">
          <input
            v-for="i in 6"
            :key="i"
            v-model="digits[i - 1]"
            maxlength="1"
            inputmode="numeric"
            autocomplete="one-time-code"
            :aria-label="$t('group.join.digit', { n: i })"
            class="h-14 w-full min-w-0 rounded-2xl border-2 border-brand-line bg-brand-surface text-center font-display text-2xl font-extrabold text-brand-ink transition-colors focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
            @input="onInput(i - 1)"
            @keydown.backspace.prevent="onBackspace(i - 1)"
            @paste.prevent="handlePaste"
            @keydown.ctrl.v.prevent="handleKeyboardPaste"
          />
        </div>
      </fieldset>

      <button type="submit" class="btn btn-secondary w-full py-4" :disabled="!canJoin">
        {{ $t('group.join.joinButton') }}
      </button>
    </form>

    <div
      v-if="error"
      class="rounded-2xl border border-brand-orange/40 bg-brand-orange/10 p-4 text-sm font-semibold text-brand-orange"
      role="alert"
    >
      <template
        v-if="
          typeof error === 'string' || (typeof error === 'object' && error?.name?.includes('Axios'))
        "
      >
        {{ error }}
      </template>
      <ul v-else-if="error && typeof error === 'object'" class="flex flex-col gap-1">
        <template v-for="field in Object.keys(error)" :key="field">
          <li v-for="(msg, idx) in error[field]" :key="idx">
            {{ typeof msg === 'string' ? msg : msg?.description }}
          </li>
        </template>
      </ul>
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
      <div class="flex flex-col gap-2">
        <label for="nicknameInputJoin" class="text-sm text-brand-muted">
          {{ $t('group.join.modal.nicknameHint') }}
        </label>
        <input
          id="nicknameInputJoin"
          v-model="username"
          type="text"
          maxlength="50"
          class="w-full rounded-2xl border-2 border-brand-line bg-brand-surface px-4 py-3 text-lg font-semibold text-brand-ink focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
          :placeholder="$t('group.join.modal.nicknamePlaceholder')"
          @keydown.enter.prevent="joinGroupInvited"
        />
      </div>

      <div
        v-if="errorUsername"
        class="mt-4 rounded-2xl border border-brand-orange/40 bg-brand-orange/10 p-4 text-sm font-semibold text-brand-orange"
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
        <ul
          v-else-if="errorUsername && typeof errorUsername === 'object'"
          class="flex flex-col gap-1"
        >
          <template v-for="field in Object.keys(errorUsername)" :key="field">
            <li v-for="(msg, idx) in errorUsername[field]" :key="idx">
              {{ typeof msg === 'string' ? msg : msg?.description }}
            </li>
          </template>
        </ul>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
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
  if (!canJoin.value) return

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

onMounted(async () => {
  // If code is in url, try to join the group (handles page refresh and direct link with code)
  const urlParams = new URLSearchParams(globalThis.location.search)
  const codeFromUrl = urlParams.get('code')

  if (codeFromUrl && !groupeStore.groupeId) {
    fillDigits(codeFromUrl)

    if (userStore.isLogged) {
      error.value = await groupeStore.joinGroupe(codeFromUrl)
      if (groupeStore.groupeId) emit('joined', true)
    } else {
      // If user isn't logged in, ask for username and create temp token
      showModalUsername.value = true
    }

    urlParams.delete('code')
    const newUrl = `${globalThis.location.pathname}`
    globalThis.history.replaceState({}, '', newUrl)
  }
})
</script>
