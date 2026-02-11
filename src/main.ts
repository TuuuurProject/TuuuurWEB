import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Google Login
import vue3GoogleLogin from 'vue3-google-login'

// Toaster
import Vue3Toastify, { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

// Daysjs
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
dayjs.locale('fr')

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faGamepad,
  faUsers,
  faRocket,
  faLightbulb,
  faBullseye,
  faHome,
  faChartBar,
  faTrophy,
  faFire,
  faPalette,
  faDice,
  faStar,
  faGem,
  faCrown,
  faPlay,
  faArrowLeft,
  faQrcode,
  faUserGroup,
  faCog,
  faSignInAlt,
  faFlask,
  faMedal,
  faMusic,
  faFilm,
  faGlobe,
  faLaptopCode,
  faUniversity,
  faWandMagicSparkles,
  faUserPlus,
  faLock,
  faSignOutAlt,
  faCheckCircle,
  faSeedling,
  faBolt,
  faSkull,
  faCircle,
  faListCheck,
  faTimes,
  faRotateRight,
  faTimesCircle,
  faCheck,
  faKey,
  faTrash,
  faCamera,
  faArrowDown,
  faChevronRight,
  faArrowUp,
  faClockRotateLeft,
  faClock,
  faTags,
  faCircleQuestion,
  faPercent,
  faInbox,
  faHourglassHalf,
  faAnglesLeft,
  faChevronLeft,
  faAnglesRight,
  faCopy,
  faDoorOpen,
  faUser,
  faMagnifyingGlass,
  faChartColumn,
  faXmark,
  faGear,
  faTurnDown,
  faPaw,
  faUserNinja,
  faChevronUp,
  faChevronDown,
  faPen,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faGamepad,
  faUsers,
  faRocket,
  faLightbulb,
  faBullseye,
  faHome,
  faChartBar,
  faTrophy,
  faFire,
  faPalette,
  faDice,
  faStar,
  faGem,
  faCrown,
  faPlay,
  faArrowLeft,
  faQrcode,
  faUserGroup,
  faCog,
  faSignInAlt,
  faFlask,
  faMedal,
  faMusic,
  faFilm,
  faGlobe,
  faLaptopCode,
  faUniversity,
  faWandMagicSparkles,
  faUserPlus,
  faLock,
  faSignOutAlt,
  faCheckCircle,
  faSeedling,
  faBolt,
  faSkull,
  faCircle,
  faTrophy,
  faListCheck,
  faTimes,
  faRotateRight,
  faTimesCircle,
  faCheck,
  faKey,
  faTrash,
  faCamera,
  faArrowDown,
  faChevronRight,
  faArrowUp,
  faClockRotateLeft,
  faClock,
  faTags,
  faCircleQuestion,
  faPercent,
  faInbox,
  faHourglassHalf,
  faAnglesLeft,
  faChevronLeft,
  faAnglesRight,
  faCopy,
  faDoorOpen,
  faUser,
  faMagnifyingGlass,
  faChartColumn,
  faXmark,
  faGear,
  faTurnDown,
  faPaw,
  faUserNinja,
  faChevronUp,
  faChevronDown,
  faPen,
)

// Functions
const unixToDate = function (unix: number | null, format = 'DD/MM/YYYY') {
  if (unix === null) return null

  const dateDayjs = dayjs.unix(unix)

  if (!dateDayjs.isValid()) return unix

  if (format === 'DD MMMM YYYY') {
    // Première lettre du mois en majuscule
    const day =
      dateDayjs.format('DD')[0] === '0' ? dateDayjs.format('DD')[1] : dateDayjs.format('DD')
    const month = dateDayjs.format('MMMM')
    const year = dateDayjs.format('YYYY')

    return day + ' ' + month.charAt(0).toUpperCase() + month.slice(1) + ' ' + year
  }

  return dateDayjs.format(format)
}

// Initialize MSW for E2E tests
async function initApp() {
  // Check if we should start MSW
  const isE2EMode = import.meta.env.VITE_MODE === 'e2e' || import.meta.env.VITE_E2E === 'true'

  if (isE2EMode) {
    try {
      console.log('[Main] Starting in E2E mode, initializing MSW...')
      const { startMockServiceWorker } = await import('./mocks/browser')
      await startMockServiceWorker()
      console.log('[Main] ✅ MSW initialized successfully')
    } catch (error) {
      console.error('[Main] ❌ Error initializing MSW:', error)
      // Continue anyway so the app still loads
    }
  }

  const app = createApp(App)

  app.config.globalProperties.$unixToDate = unixToDate
  app.config.globalProperties.$dayjs = dayjs
  app.config.globalProperties.$toast = toast

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.use(Vue3Toastify, {
    theme: 'dark',
    autoClose: 3000,
    position: toast.POSITION.TOP_RIGHT,
  })
  app.use(vue3GoogleLogin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  })
  app.component('font-awesome-icon', FontAwesomeIcon)
  app.mount('#app')
}

initApp()
