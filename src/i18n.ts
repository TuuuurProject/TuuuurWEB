import { createI18n } from 'vue-i18n'
import fr from './locales/fr.json'
import en from './locales/en.json'

// Get saved locale from localStorage or use default
const savedLocale = localStorage.getItem('locale') || 'fr'

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: savedLocale, // Use saved or default locale
  fallbackLocale: 'en', // Fallback locale
  messages: {
    fr,
    en,
  },
  globalInjection: true, // Enable global $t
})

export default i18n
