export interface PlayerStats {
  wins: number;
  fails: number;
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
  isReady: boolean;
  votesToSkip: number;
  stats: PlayerStats;
}

export interface Premise {
  playerId: string;
  text: string;
}

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}

export interface RoundResult {
  success: boolean;
  number: number;
}

export type GameRoomState = "waiting" | "premise" | "guessing" | "round_end";

export interface Room {
  id: string;
  adminId: string;
  name: string;
  players: Player[];
  state: GameRoomState;
  guesserId: string;
  currentPremisePlayerId: string;
  guessAttempts: number;
  maxGuessesPerRound: number;
  usedPremisePlayers: string[];
  premises: Premise[];
  timer: number;
  maxTime: number;
  chat: ChatMessage[];
  imageUrl?: string;
  roundResult?: RoundResult;
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
      type: "submitPremise";
      payload: { roomId: string; playerId: string; text: string };
    }
  | {
      type: "submitGuess";
      payload: { roomId: string; playerId: string; guess: number };
    }
  | {
      type: "voteToSkip";
      payload: { roomId: string; voterId: string };
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
