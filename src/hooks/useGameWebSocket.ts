import { useState, useEffect, useRef, useCallback } from "react";
import { GameEvent } from "../types";
import { Room } from "../types/game";
import { v4 as uuidv4 } from "uuid";

export function useGameWebSocket(url: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId] = useState<string>(() => {
    const saved = localStorage.getItem("esun10_player_id");

    if (saved) {
      return saved;
    }

    const clientId = uuidv4();

    localStorage.setItem("esun10_player_id", clientId);

    return clientId;
  });
  const [playerName, setPlayerNameState] = useState<string>(() => {
    return localStorage.getItem("esun10_player_name") || "";
  });

  const ws = useRef<WebSocket | null>(null);

  const setPlayerName = (name: string) => {
    localStorage.setItem("esun10_player_name", name);
    setPlayerNameState(name);
  };

  useEffect(() => {
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      console.log("Conectado al servidor de ESUN 10 PERO");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;

        switch (type) {
          case "imageGenerated":
            setRoom((prev) =>
              prev ? { ...prev, imageUrl: payload.url } : null,
            );
            break;
          case GameEvent.RoomCreated:
          case GameEvent.RoomJoined:
            setRoom(payload.room);
            break;
          case GameEvent.PlayerJoined:
          case GameEvent.PlayerLeft:
          case GameEvent.GameStateUpdated:
            setRoom(payload.room);
            break;
          case GameEvent.GuesserSelected:
            setRoom((prev) =>
              prev
                ? { ...prev, guesserId: payload.guesserId, state: "premise" }
                : null,
            );
            break;
          case GameEvent.PremisePlayerSelected:
            setRoom((prev) =>
              prev
                ? {
                    ...prev,
                    currentPremisePlayerId: payload.playerId,
                    state: "premise",
                  }
                : null,
            );
            break;
          case GameEvent.PremiseSubmitted:
            setRoom((prev) =>
              prev ? { ...prev, premises: payload.premises } : null,
            );
            break;
          case GameEvent.GuessSubmitted:
            setRoom((prev) =>
              prev
                ? {
                    ...prev,
                    guessAttempts: payload.guessAttempts,
                    state: payload.isCorrect ? "round_end" : "premise",
                    roundResult: payload.isCorrect
                      ? { success: true, number: payload.guessAttempts }
                      : undefined,
                  }
                : null,
            );
            break;
          case GameEvent.RoundEnded:
            setRoom((prev) =>
              prev
                ? {
                    ...prev,
                    state: "round_end",
                    roundResult: {
                      success: payload.success,
                      number: payload.number,
                    },
                  }
                : null,
            );
            break;
          case GameEvent.TimerSync:
            setRoom((prev) =>
              prev ? { ...prev, timer: payload.timer } : null,
            );
            break;
          case GameEvent.MaxTimeUpdated:
            setRoom((prev) =>
              prev ? { ...prev, maxTime: payload.maxTime } : null,
            );
            break;
          case GameEvent.AdminChanged:
            setRoom((prev) =>
              prev ? { ...prev, adminId: payload.newAdminId } : null,
            );
            break;
          case GameEvent.MessageReceived:
            setRoom((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                chat: [...prev.chat, payload.message].slice(-100),
              };
            });
            break;
          case GameEvent.StatsUpdated:
            setRoom((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                players: prev.players.map((p) =>
                  p.id === payload.playerId
                    ? { ...p, stats: payload.stats }
                    : p,
                ),
              };
            });
            break;
          case GameEvent.GameEnded:
          case GameEvent.RoomLeft:
          case GameEvent.RoomNotFound:
          case GameEvent.RoomFull:
            alert(`Evento del servidor: ${type}`);
            setRoom(null);
            break;
        }
      } catch (err) {
        console.error("Error parseando mensaje WS:", err);
      }
    };

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = useCallback((msg: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }
  }, []);

  return { room, playerId, playerName, setPlayerName, sendMessage };
}
