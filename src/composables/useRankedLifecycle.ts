import { getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import signalrService from '@/services/signalrService'
import useRankedStore from '@/stores/ranked'
import useUserStore from '@/stores/user'

/**
 * Composable pour gérer le cycle de vie de la connexion SignalR ranked.
 * Miroir de useGroupLifecycle, adapté pour le mode ranked (1v1).
 */
export function useRankedLifecycle() {
  const rankedStore = useRankedStore()
  const userStore = useUserStore()
  const { t } = useI18n()

  const instance = getCurrentInstance()
  const proxy = instance?.proxy

  let isCleaningUp = false

  /**
   * Remet à zéro le store ranked et déconnecte SignalR.
   * La garde isCleaningUp évite les doubles appels concurrents.
   */
  const cleanupRanked = async () => {
    if (isCleaningUp) return
    isCleaningUp = true

    try {
      rankedStore.reset()

      if (signalrService.isConnected()) {
        await signalrService.disconnect()
      }
    } catch (error) {
      console.error('Error during ranked cleanup:', error)
    } finally {
      isCleaningUp = false
    }
  }

  /**
   * Connecte SignalR au hub ranked si ce n'est pas déjà fait.
   * Lance une exception en cas d'échec (à gérer par l'appelant).
   */
  const connectSignalR = async () => {
    if (!signalrService.isConnected()) {
      try {
        await signalrService.connect(userStore.token || '', true)
        if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
          console.log('SignalR connected for ranked')
      } catch (error) {
        console.error('Failed to connect to SignalR for ranked:', error)
        proxy?.$toast.error(t('group.lobby.connectionError'))
        throw error
      }
    }
  }

  return { cleanupRanked, connectSignalR }
}
