// Ejemplo de cómo conectar al WebSocket de Elysia desde el frontend
class GameClient {
  private ws: WebSocket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Conexión WebSocket establecida');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);
          this.handleMessage(type, payload);
        } catch (error) {
          console.error('Error al parsear mensaje:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Conexión WebSocket cerrada');
      };
    });
  }

  private handleMessage(type: string, payload: any): void {
    switch (type) {
      case 'roomCreated':
        console.log('Sala creada:', payload);
        break;
      case 'roomJoined':
        console.log('Te uniste a la sala:', payload);
        break;
      case 'playerJoined':
        console.log('Jugador se unió:', payload);
        break;
      case 'gameStarted':
        console.log('Juego iniciado:', payload);
        break;
      case 'turnAssigned':
        console.log('Turno asignado:', payload);
        break;
      case 'cardSelected':
        console.log('Carta seleccionada:', payload);
        break;
      case 'guessResult':
        console.log('Resultado de adivinanza:', payload);
        break;
      case 'messageReceived':
        console.log('Mensaje recibido:', payload);
        break;
      default:
        console.log(`Mensaje desconocido: ${type}`, payload);
    }
  }

  send(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket no está abierto');
    }
  }

  createRoom(name: string, playerId: string, playerName: string): void {
    this.send('createRoom', { name, playerId, playerName });
  }

  joinRoom(roomId: string, playerId: string, playerName: string): void {
    this.send('joinRoom', { roomId, playerId, playerName });
  }

  startGame(roomId: string, adminId: string): void {
    this.send('startGame', { roomId, adminId });
  }

  selectCard(roomId: string, playerId: string, cardNumber: number): void {
    this.send('selectCard', { roomId, playerId, cardNumber });
  }

  submitHint(roomId: string, playerId: string, hint: string): void {
    this.send('submitHint', { roomId, playerId, hint });
  }

  submitGuess(roomId: string, playerId: string, guess: number): void {
    this.send('submitGuess', { roomId, playerId, guess });
  }

  sendMessage(roomId: string, playerId: string, playerName: string, message: string): void {
    this.send('sendMessage', { roomId, playerId, playerName, message });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Exportar la clase para usarla en otros módulos
export default GameClient;
