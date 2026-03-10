import { onBeforeUnmount, onMounted, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import signalrService, { GroupEvent } from '@/services/signalrService'
import useGroupeStore from '@/stores/groupe'
import useUserStore from '@/stores/user'

/**
 * Composable pour gérer le cycle de vie d'un groupe multi-joueurs
 * Gère la connexion/déconnexion SignalR, le cleanup et la fermeture de page
 */
export function useGroupLifecycle() {
  const groupeStore = useGroupeStore()
  const userStore = useUserStore()
  const { t } = useI18n()

  const instance = getCurrentInstance()
  const proxy = instance?.proxy

  let isCleaningUp = false

  /**
   * Quitte proprement le groupe et déconnecte SignalR
   */
  const cleanupGroup = async (skipApiCall = false) => {
    if (isCleaningUp) return
    isCleaningUp = true

    try {
      // Appel API pour quitter le groupe (sauf si explicitement ignoré)
      if (!skipApiCall && groupeStore.groupeId) {
        await groupeStore.leaveGroupe()
      }

      // Nettoyer l'état local
      groupeStore.groupeId = null
      groupeStore.groupePartyInfo = null

      // Déconnexion SignalR si connecté
      if (signalrService.isConnected()) {
        await signalrService.disconnect()
      }
    } catch (error) {
      console.error('Error during group cleanup:', error)
    } finally {
      isCleaningUp = false
    }
  }

  /**
   * Gère la fermeture de page (navigateur fermé, onglet fermé, etc.)
   */
  const handleBeforeUnload = () => {
    if (groupeStore.groupeId) {
      // Utiliser la méthode synchrone du store qui utilise fetch + keepalive
      groupeStore.leaveGroupeSync()
    }
  }

  /**
   * Configure les événements SignalR pour gérer les erreurs et déconnexions
   */
  const setupSignalRErrorHandling = () => {
    const handleError = (error: any) => {
      console.error('SignalR error:', error)
      proxy?.$toast.error(error)

      // Si erreur critique, nettoyer le groupe
      if (error && typeof error === 'string' && error.toLowerCase().includes('parti')) {
        cleanupGroup(true)
      }
    }

    const handlePartyDeleted = () => {
      proxy?.$toast.warning(t('group.lobby.lobbyDeleted'))
      cleanupGroup(true)
    }

    signalrService.on(GroupEvent.Error, handleError)
    signalrService.on(GroupEvent.PartyDeleted, handlePartyDeleted)

    return () => {
      signalrService.off(GroupEvent.Error, handleError)
      signalrService.off(GroupEvent.PartyDeleted, handlePartyDeleted)
    }
  }

  /**
   * Connecte à SignalR et configure les handlers
   */
  const connectSignalR = async () => {
    if (!signalrService.isConnected()) {
      try {
        const token = userStore.isLogged
          ? userStore.token
          : userStore.isLoggedAsInvited
            ? userStore.invitedToken
            : null

        await signalrService.connect(token || '')
        if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('SignalR connected for group')
      } catch (error) {
        console.error('Failed to connect to SignalR:', error)
        proxy?.$toast.error(t('group.lobby.connectionError'))
        throw error
      }
    }
  }

  /**
   * Setup automatique du lifecycle lors du montage/démontage du composant
   */
  const setupAutoCleanup = () => {
    onMounted(() => {
      window.addEventListener('beforeunload', handleBeforeUnload)
    })

    onBeforeUnmount(async () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      await cleanupGroup()
    })
  }

  return {
    cleanupGroup,
    connectSignalR,
    setupAutoCleanup,
    setupSignalRErrorHandling,
  }
}
