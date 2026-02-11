import axiosOverlay from './axiosOverlay'
import useUserStore from '@/stores/user'

import router from '@/router'

export default function axiosOverlayConnector(axiosConfig, overlayConfig = {}) {
  let userStore = useUserStore()

  let functionConfig = {
    getToken: async () => {
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
      401: async ({ error, overlayConfig, resolve, reject, retry }) => {
        if (userStore.isRefreshTokenExist) {
          try {
            // Appel du refresh token avec mustBeAuthenticated false pour éviter la boucle
            const refreshUrl = import.meta.env.VITE_API_URL + 'auth/refresh'
            const refreshConfig = {
              url: refreshUrl,
              method: 'POST',
              data: {
                bearer: userStore.token,
                refreshToken: userStore.refreshToken,
              },
            }

            // Utilise axiosOverlay directement avec mustBeAuthenticated: false
            // et sans les handlers personnalisés pour éviter la boucle
            const response = await axiosOverlay(refreshConfig, {
              retry: false,
              functions: {
                ...overlayConfig.functions,
                errorsHandlers: {
                  default: ({ error, reject }) => {
                    reject(error)
                  },
                },
              },
            })

            // Met à jour les tokens
            userStore.token = response.data.token.token
            userStore.refreshToken = response.data.token.refreshToken

            // Retry la requête originale avec le nouveau token
            const result = await retry()
            resolve(result)
          } catch (refreshError) {
            // Le refresh token a échoué (401 ou autre), on déconnecte l'utilisateur
            console.error('Erreur lors du refresh token:', refreshError)
            userStore.logout()
            reject(refreshError)
          }
        } else {
          // Pas de refresh token valide, on déconnecte
          userStore.logout()
          reject(error)
        }
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
