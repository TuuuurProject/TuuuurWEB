import * as signalR from '@microsoft/signalr'

export enum GroupEvent {
  Join = 1,
  Leave = 2,
  Start = 3,
  Delete = 4,
}

type EventHandler = (...args: unknown[]) => void

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private handlers: Map<string, Set<EventHandler>> = new Map()

  async connect(token?: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    const url = import.meta.env.VITE_API_URL + 'notifications'

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => token || '',
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    this.connection.onreconnecting((error) => {
      console.warn('SignalR reconnecting...', error)
    })

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId)
    })

    this.connection.onclose((error) => {
      console.log('SignalR connection closed:', error)
    })

    try {
      await this.connection.start()
      console.log('SignalR connected successfully')
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

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null
  }
}

export default new SignalRService()
