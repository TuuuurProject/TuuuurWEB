import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

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
)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
