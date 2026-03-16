import {
  HttpTransportType,
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
  HubConnection,
} from '@microsoft/signalr'

export enum RankedEvent {
  // Client → Server
  JoinSearchOpponent = 'JoinSearchOpponent',
  LeaveSearchOpponent = 'LeaveSearchOpponent',
  SendAnswer = 'SendAnswer',

  // Server → Client
  OpponentFound = 'OnOpponentFound',
  Countdown = 'OnCountdown',
  QuestionSend = 'OnQuestionSend',
  UserAnswer = 'OnUserAnswer',
  AllPlayerAnswered = 'OnAllPlayerAnswered',
  QuestionAnswerSend = 'OnQuestionAnswerSend',
  ScoreUpdate = 'OnScoreUpdate',
  PartyFinished = 'OnPartyFinished',
  UserWin = 'OnUserWin',
  UserLoose = 'OnUserLoose',
  Error = 'OnError',
}

type EventHandler = (...args: unknown[]) => void

class RankedSignalRService {
  private connection: HubConnection | null = null
  private handlers: Map<string, Set<EventHandler>> = new Map()

  async connect(token?: string): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return
    }

    const url = import.meta.env.VITE_BASE_API_URL + 'ranked'

    this.connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => token || '',
        withCredentials: false,
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Critical)
      .build()

    for (const [eventName, callbacks] of this.handlers.entries()) {
      for (const cb of callbacks) {
        this.connection.on(eventName, cb)
      }
    }

    this.connection.onreconnecting((error) => {
      console.warn('Ranked SignalR reconnecting...', error)
    })

    this.connection.onreconnected((connectionId) => {
      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
        console.log('Ranked SignalR reconnected:', connectionId)
    })

    this.connection.onclose(() => {
      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Ranked SignalR connection closed')
    })

    try {
      await this.connection.start()
      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
        console.log('Ranked SignalR connected successfully')
    } catch (error) {
      console.error('Error connecting to Ranked SignalR:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      this.handlers.clear()
      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Ranked SignalR disconnected')
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

  async invoke<T = void>(methodName: string, ...args: any[]): Promise<T> {
    if (!this.connection) {
      throw new Error('Ranked SignalR connection is not initialized. Call connect() first.')
    }
    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error(`Ranked SignalR is not connected (state: ${this.connection.state}).`)
    }
    return this.connection.invoke<T>(methodName, ...args)
  }

  async send(methodName: string, ...args: any[]): Promise<void> {
    if (!this.connection) {
      throw new Error('Ranked SignalR connection is not initialized. Call connect() first.')
    }
    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error(`Ranked SignalR is not connected (state: ${this.connection.state}).`)
    }
    return this.connection.send(methodName, ...args)
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected
  }
}

export default new RankedSignalRService()
