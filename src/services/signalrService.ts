import {
  HttpTransportType,
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
  HubConnection,
} from '@microsoft/signalr'

export enum GroupEvent {
  /** Un joueur rejoint le salon (lobby). */
  PlayerJoined = 'OnPlayerJoined',

  /** Un joueur quitte le salon (lobby). */
  PlayerLeft = 'OnPlayerLeft',

  /** Le salon est supprimé (souvent par l’hôte). */
  PartyDeleted = 'OnPartyDeleted',

  /** Les paramètres/état du salon sont mis à jour. */
  PartyUpdated = 'OnPartyUpdated',

  /** Lancer le démarrage de la partie */
  StartGroupParty = 'StartGroupParty',

  /** La partie démarre officiellement pour le groupe. */
  PartyStarted = 'OnPartyStarted',

  /** Décompte avant une action (ex: avant question). */
  Countdown = 'OnCountdown',

  /** Envoi de la question courante au joueur (unicast). */
  QuestionSend = 'OnQuestionSend',

  /** Envoi d’une réponse par un joueur (unicast). */
  SendAnswer = 'SendAnswer',

  /** Indique qu’un joueur a validé sa réponse (feedback UI). */
  UserAnswer = 'OnUserAnswer',

  /** Envoi du résultat : bonne réponse + score (unicast). */
  QuestionAnswerSend = 'OnQuestionAnswerSend',

  /** Mise à jour du tableau des scores (entre questions). */
  ScoreUpdate = 'OnScoreUpdate',

  /** Fin de partie et classement final. */
  PartyFinished = 'OnPartyFinished',

  /** Erreur côté serveur suite à une action client. */
  Error = 'OnError',
}

type EventHandler = (...args: unknown[]) => void

class SignalRService {
  private connection: HubConnection | null = null
  private handlers: Map<string, Set<EventHandler>> = new Map()

  async connect(token?: string): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return
    }

    const url = import.meta.env.VITE_BASE_API_URL + 'group'

    this.connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => token || '',
        withCredentials: false,
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Critical)
      .build()

    // Replay des handlers enregistrés avant la création/connexion
    for (const [eventName, callbacks] of this.handlers.entries()) {
      for (const cb of callbacks) {
        this.connection.on(eventName, cb)
      }
    }

    this.connection.onreconnecting((error: Error | undefined) => {
      console.warn('SignalR reconnecting...', error)
    })

    this.connection.onreconnected((connectionId: string | undefined) => {
      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('SignalR reconnected:', connectionId)
    })

    this.connection.onclose(() => {
      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('SignalR connection closed')
    })

    try {
      await this.connection.start()
      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('SignalR connected successfully')
    } catch (error) {
      console.error('Error connecting to SignalR:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      this.handlers.clear()

      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('SignalR disconnected')
    }
  }

  on(eventName: string, callback: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set())
    }
    this.handlers.get(eventName)!.add(callback)

    if (this.connection) {
      this.connection.on(eventName, callback)
    }
  }

  off(eventName: string, callback?: EventHandler): void {
    if (callback) {
      const eventHandlers = this.handlers.get(eventName)
      if (eventHandlers) {
        eventHandlers.delete(callback)
        if (eventHandlers.size === 0) {
          this.handlers.delete(eventName)
        }
      }
      if (this.connection) {
        this.connection.off(eventName, callback)
      }
    } else {
      this.handlers.delete(eventName)
      if (this.connection) {
        this.connection.off(eventName)
      }
    }
  }

  /**
   * Appelle une méthode du Hub (Client -> Serveur) en attendant un retour (si le serveur en renvoie un).
   * Ex: invoke("StartGroupParty") ou invoke("SendAnswer", answerId)
   */
  async invoke<T = void>(methodName: string, ...args: any[]): Promise<T> {
    if (!this.connection) {
      throw new Error('SignalR connection is not initialized. Call connect() first.')
    }
    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error(`SignalR is not connected (state: ${this.connection.state}).`)
    }

    return this.connection.invoke<T>(methodName, ...args)
  }

  async send(methodName: string, ...args: any[]): Promise<void> {
    if (!this.connection) {
      throw new Error('SignalR connection is not initialized. Call connect() first.')
    }
    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error(`SignalR is not connected (state: ${this.connection.state}).`)
    }

    return this.connection.send(methodName, ...args)
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected
  }

  getConnectionState(): HubConnectionState | null {
    return this.connection?.state || null
  }
}

export default new SignalRService()
