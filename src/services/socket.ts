import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private url: string

  constructor(url: string) {
    this.url = url
  }

  connect(): void {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket ? this.socket.connected : false
  }

  emit(event: string, data: any, callback?: (response: any) => void): void {
    if (this.socket) {
      this.socket.emit(event, data, callback)
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export const socketService = new SocketService('http://localhost:3000')
