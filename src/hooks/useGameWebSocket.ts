import { useState, useEffect, useRef, useCallback } from "react";
import { Room, ClientMessage } from "../types/game";
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
          case "roomCreated":
          case "roomJoined":
            setRoom(payload.room);
            break;
          case "playerJoined":
          case "playerLeft":
          case "gameStateUpdated":
            setRoom(payload.room);
            break;
          case "hintSubmitted":
            if (room)
              setRoom({ ...room, hint: payload.hint, state: "guessing" });
            break;
          case "timerSync":
            setRoom((prev) =>
              prev ? { ...prev, timer: payload.timer } : null,
            );
            break;
          case "maxTimeUpdated":
            setRoom((prev) =>
              prev ? { ...prev, maxTime: payload.maxTime } : null,
            );
            break;
          case "adminChanged":
            setRoom((prev) =>
              prev ? { ...prev, adminId: payload.newAdminId } : null,
            );
            break;
          case "messageReceived":
            setRoom((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                chat: [...prev.chat, payload.message].slice(-100),
              };
            });
            break;
          case "gameEnded":
          case "roomLeft":
          case "roomNotFound":
          case "roomFull":
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

  const sendMessage = useCallback((msg: ClientMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }
  }, []);

  return { room, playerId, playerName, setPlayerName, sendMessage };
}
