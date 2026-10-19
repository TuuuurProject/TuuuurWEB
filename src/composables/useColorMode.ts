import { computed, ref } from 'vue'
import { updateGlobalOptions } from 'vue3-toastify'

export type ColorPreference = 'light' | 'dark' | 'system'

// Même clé que le script inline de index.html, qui applique le thème avant le premier rendu
const STORAGE_KEY = 'color-mode'

const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')

function readPreference(): ColorPreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage indisponible (navigation privée) : on suit le système
  }
  return 'system'
}

const preference = ref<ColorPreference>(readPreference())
const systemDark = ref<boolean>(media?.matches ?? false)

const isDark = computed(() =>
  preference.value === 'system' ? systemDark.value : preference.value === 'dark',
)

function apply() {
  document.documentElement.classList.toggle('dark', isDark.value)
  updateGlobalOptions({ theme: isDark.value ? 'dark' : 'light' })
}

media?.addEventListener('change', (event) => {
  systemDark.value = event.matches
  apply()
})

/**
 * Thème clair / sombre de l'application.
 * Par défaut on suit le réglage du système ; un choix explicite est mémorisé.
 */
export function useColorMode() {
  const setPreference = (value: ColorPreference) => {
    preference.value = value
    try {
      if (value === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Préférence non mémorisée, elle reste valable pour la session
    }
    apply()
  }

  const toggle = () => setPreference(isDark.value ? 'light' : 'dark')

  return { preference, isDark, setPreference, toggle, apply }
}
