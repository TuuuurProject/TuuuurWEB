import axiosOverlay from './axiosOverlay'
import useUserStore from '@/stores/user'

import router from '@/router'

export default function axiosOverlayConnector(axiosConfig, overlayConfig = {}) {
  let userStore = useUserStore()

  let functionConfig = {
    getToken: () => {
      return userStore.token
    },
    setToken: (token) => {
      userStore.token = token
    },
    logout() {
      userStore.logout()
    },
    errorsHandlers: {
      default: ({ error, reject }) => {
        console.log(error)
        if (overlayConfig.allowRedirect) router.push({ name: 'Home' })

        reject(error)
      },
      401: ({ error, overlayConfig, reject }) => {
        if (overlayConfig.allowRedirect) reject(error)
        // cas de connection en boucle en attente de validation du mail
        // router.push({ name: 'Home' })

        reject(error)
      },
      498: ({ error, overlayConfig, reject }) => {
        if (overlayConfig.allowRedirect) router.push({ name: 'Home' })

        reject(error)
      },
    },
  }

  if (!overlayConfig.functions) overlayConfig.functions = {}

  // overwrite functionConfig with overlayConfig.functions
  overlayConfig.functions = { ...functionConfig, ...overlayConfig.functions }
  overlayConfig.functions.errorsHandlers = {
    ...functionConfig.errorsHandlers,
    ...overlayConfig.functions.errorsHandlers,
  }
  overlayConfig.functions.errorsConfig = {
    ...functionConfig.errorsConfig,
    ...overlayConfig.functions.errorsConfig,
  }

  return axiosOverlay(axiosConfig, overlayConfig)
}
