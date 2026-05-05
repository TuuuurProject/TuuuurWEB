import axios from 'axios'

const defaultOverlayConfig = {
  mustBeAuthenticated: true,
  retry: true,
  allowRedirect: true,
  functions: {
    getToken: () => {
      console.log('getToken')
    },
    setToken: (token) => {
      console.log('setToken', token)
    },
    logout: () => {
      console.log('logout')
    },
    setHeaders: (instance) => {
      instance.defaults.headers.common['Accept'] = 'application/json'
      return instance
    },
    errorsConfig: {},
    errorsHandlers: {
      default: ({ error, reject }) => {
        console.log('default')
        reject(error)
      },
    },
  },
}

export default async function axiosOverlay(axiosConfig, overlayConfig = defaultOverlayConfig) {
  // if config missing in overlayConfig pick the default one
  overlayConfig = { ...defaultOverlayConfig, ...overlayConfig }
  overlayConfig.functions = { ...defaultOverlayConfig.functions, ...overlayConfig.functions }
  overlayConfig.functions.errorsConfig = {
    ...defaultOverlayConfig.functions.errorsConfig,
    ...overlayConfig.functions.errorsConfig,
  }
  overlayConfig.functions.errorsHandlers = {
    ...defaultOverlayConfig.functions.errorsHandlers,
    ...overlayConfig.functions.errorsHandlers,
  }

  let initialToken = await Promise.resolve(overlayConfig.functions.getToken())

  let instance = axios.create()

  if (overlayConfig.mustBeAuthenticated && initialToken) {
    instance.defaults.headers.common['Authorization'] = 'Bearer ' + initialToken
  }

  instance = overlayConfig.functions.setHeaders(instance)

  if (overlayConfig.bonusHeader) {
    for (const [key, value] of Object.entries(overlayConfig.bonusHeader)) {
      instance.defaults.headers.common[key] = value
    }
  }

  return new Promise((resolve, reject) => {
    instance(axiosConfig)
      .then((response) => {
        resolve(response)
      })
      .catch(async (error) => {
        if (error.response?.status === 449 && overlayConfig.retry) {
          try {
            overlayConfig.functions.setToken(error.response.data.token)

            // Vérifie que le token a bien été mis à jour
            const newToken = await Promise.resolve(overlayConfig.functions.getToken())
            if (newToken && newToken !== initialToken) {
              const retryConfig = {
                ...overlayConfig,
                retry: false,
              }
              return resolve(axiosOverlay(axiosConfig, retryConfig))
            }
          } catch (tokenError) {
            console.error('Erreur lors du setToken:', tokenError)
          }
        }

        // Fonction retry pour permettre la relance de la requête
        // Récupère le token mis à jour et évite de repasser par les handlers personnalisés
        const retry = async () => {
          const retryConfig = {
            ...overlayConfig,
            retry: false,
            mustBeAuthenticated: true,
            functions: {
              ...overlayConfig.functions,
              errorsHandlers: {
                default: overlayConfig.functions.errorsHandlers.default,
              },
            },
          }
          return axiosOverlay(axiosConfig, retryConfig)
        }

        if (error.response?.status && overlayConfig.functions.errorsHandlers[error.response.status])
          overlayConfig.functions.errorsHandlers[error.response.status]({
            error,
            axiosConfig,
            overlayConfig,
            resolve,
            reject,
            retry,
          })
        else
          overlayConfig.functions.errorsHandlers.default({
            error,
            axiosConfig,
            overlayConfig,
            resolve,
            reject,
            retry,
          })
      })
  })
}
