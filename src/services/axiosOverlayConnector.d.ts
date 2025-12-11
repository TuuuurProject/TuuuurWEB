import { AxiosResponse } from 'axios'

interface OverlayConfig {
  allowRedirect?: boolean
  functions?: {
    getToken?: () => string | null
    setToken?: (token: string) => void
    logout?: () => void
    errorsHandlers?: Record<string | number, (params: any) => void>
    errorsConfig?: Record<string, any>
  }
}

declare function axiosOverlayConnector(
  axiosConfig: any,
  overlayConfig?: OverlayConfig,
): Promise<AxiosResponse>

export default axiosOverlayConnector
