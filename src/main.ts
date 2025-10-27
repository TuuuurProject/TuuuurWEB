import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

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

const app = createApp(App)

app.config.globalProperties.$unixToDate = unixToDate
app.config.globalProperties.$dayjs = dayjs

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
