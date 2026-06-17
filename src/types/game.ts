export interface Player {
  id: string;
  name: string;
  socketId: string;
  isReady: boolean;
  votesToSkip: number;
  score: number;
}

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}

export interface Room {
  id: string;
  adminId: string;
  name: string;
  players: Player[];
  state: "waiting" | "round_start" | "hinting" | "guessing" | "round_end";
  currentTurn: number;
  selectedCard: number | null;
  hint: string | null;
  timer: number;
  maxTime: number;
  chat: ChatMessage[];
  imageUrl?: string;
}

// Mensajes enviados DESDE el cliente HACIA el servidor
export type ClientMessage =
  | {
      type: "createRoom";
      payload: { name: string; playerId: string; playerName: string };
    }
  | {
      type: "joinRoom";
      payload: { roomId: string; playerId: string; playerName: string };
    }
  | { type: "leaveRoom"; payload: { roomId: string; playerId: string } }
  | { type: "startGame"; payload: { roomId: string; adminId: string } }
  | {
      type: "selectCard";
      payload: { roomId: string; playerId: string; cardNumber: number };
    }
  | {
      type: "submitHint";
      payload: { roomId: string; playerId: string; hint: string };
    }
  | {
      type: "submitGuess";
      payload: { roomId: string; playerId: string; guess: number };
    }
  | {
      type: "voteToSkip";
      payload: { roomId: string; voterId: string; targetIndex: number };
    }
  | { type: "endGame"; payload: { roomId: string; adminId: string } }
  | {
      type: "sendMessage";
      payload: {
        roomId: string;
        playerId: string;
        playerName: string;
        message: string;
      };
    }
  | {
      type: "updateMaxTime";
      payload: { roomId: string; adminId: string; maxTime: number };
    };
