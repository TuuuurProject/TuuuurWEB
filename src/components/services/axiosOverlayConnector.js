import axiosOverlay from './axiosOverlay'
// import { useUserStore } from '@/stores/user'

export default function axiosOverlayConnector(axiosConfig, overlayConfig = {}) {
  // let userStore = useUserStore()

  let functionConfig = {
    getToken: () => {
      // return userStore.token
    },
    setToken: (token) => {
      // userManager.setToken(token)
      // userStore.token = token
    },
    logout() {
      // userManager.logout()
    },
    errorsHandlers: {
      default: ({ error, reject }) => {
        console.log(error)
        // if (overlayConfig.allowRedirect) router.push({ name: 'login' })

        reject(error)
      },
      401: ({ error, overlayConfig, reject }) => {
        if (overlayConfig.allowRedirect)
          //cas de connection en boucle en attente de validation du mail
          // userManager.goToLoginPage()

          reject(error)
      },
      498: ({ error, overlayConfig, reject }) => {
        // if (overlayConfig.allowRedirect) userManager.goToLoginPage()

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
