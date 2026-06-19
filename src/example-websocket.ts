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
        console.log("Conexión WebSocket establecida");
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error("Error en WebSocket:", error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);
          this.handleMessage(type, payload);
        } catch (error) {
          console.error("Error al parsear mensaje:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("Conexión WebSocket cerrada");
      };
    });
  }

  private handleMessage(type: string, payload: any): void {
    switch (type) {
      case "roomCreated":
        console.log("Sala creada:", payload);
        break;
      case "roomJoined":
        console.log("Te uniste a la sala:", payload);
        break;
      case "playerJoined":
        console.log("Jugador se unió:", payload);
        break;
      case "gameStarted":
        console.log("Juego iniciado:", payload);
        break;
      case "guesserSelected":
        console.log("Adivinador seleccionado:", payload);
        break;
      case "premisePlayerSelected":
        console.log("Autor de premisa seleccionado:", payload);
        break;
      case "premiseSubmitted":
        console.log("Premisa guardada:", payload);
        break;
      case "guessSubmitted":
        console.log("Resultado del intento:", payload);
        break;
      case "roundEnded":
        console.log("Ronda terminada:", payload);
        break;
      case "statsUpdated":
        console.log("Estadísticas actualizadas:", payload);
        break;
      case "messageReceived":
        console.log("Mensaje recibido:", payload);
        break;
      default:
        console.log(`Mensaje desconocido: ${type}`, payload);
    }
  }

  send(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error("WebSocket no está abierto");
    }
  }

  createRoom(name: string, playerId: string, playerName: string): void {
    this.send("createRoom", { name, playerId, playerName });
  }

  joinRoom(roomId: string, playerId: string, playerName: string): void {
    this.send("joinRoom", { roomId, playerId, playerName });
  }

  startGame(roomId: string, adminId: string): void {
    this.send("startGame", { roomId, adminId });
  }

  submitPremise(roomId: string, playerId: string, text: string): void {
    this.send("submitPremise", { roomId, playerId, text });
  }

  submitGuess(roomId: string, playerId: string, guess: number): void {
    this.send("submitGuess", { roomId, playerId, guess });
  }

  voteToSkip(roomId: string, voterId: string): void {
    this.send("voteToSkip", { roomId, voterId });
  }

  sendMessage(
    roomId: string,
    playerId: string,
    playerName: string,
    message: string,
  ): void {
    this.send("sendMessage", { roomId, playerId, playerName, message });
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
