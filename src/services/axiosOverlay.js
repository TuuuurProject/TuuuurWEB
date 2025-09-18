import axios from 'axios'

const defaultOverlayConfig = {
  mustBeAuthenticated: true,
  retry: true,
  allowRedirect: true,
  functions: {
    getToken: () => {
      console.log('getToken')
      // return window.localStorage.getItem('token')
    },
    setToken: (token) => {
      console.log('setToken', token)
      // window.localStorage.setItem('token', token)
    },
    logout: () => {
      console.log('logout')
      // window.localStorage.setItem('token', null)
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

export default function axiosOverlay(axiosConfig, overlayConfig = defaultOverlayConfig) {
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

  let token = overlayConfig.functions.getToken()

  let instance = axios.create()

  if (overlayConfig.mustBeAuthenticated) {
    instance.defaults.headers.common['Authorization'] = 'Bearer ' + token
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
        if (error.response && error.response.status === 449 && overlayConfig.retry) {
          overlayConfig.functions.setToken(error.response.data.token)
        }

        if (token !== overlayConfig.functions.getToken()) {
          overlayConfig.retry = false
          resolve(axiosOverlay(axiosConfig, overlayConfig))
        }

        if (error.response && error.response.status === 401 && overlayConfig.mustBeAuthenticated) {
          if (!overlayConfig.functions.errorsConfig[401]?.dontLogout)
            overlayConfig.functions.logout()

          if (!overlayConfig.functions.errorsConfig[401]?.dontStopAll) window.stop()
        }

        if (error.response && error.response.status === 498 && overlayConfig.mustBeAuthenticated) {
          if (!overlayConfig.functions.errorsConfig[498]?.dontLogout)
            overlayConfig.functions.logout()

          if (!overlayConfig.functions.errorsConfig[498]?.dontStopAll) window.stop()
        }

        if (error.response?.status && overlayConfig.functions.errorsHandlers[error.response.status])
          overlayConfig.functions.errorsHandlers[error.response.status]({
            error,
            axiosConfig,
            overlayConfig,
            resolve,
            reject,
          })
        else
          overlayConfig.functions.errorsHandlers.default({
            error,
            axiosConfig,
            overlayConfig,
            resolve,
            reject,
          })
      })
  })
}
