import React from "react";
import { useGameWebSocket } from "./hooks/useGameWebSocket";
import { CreateOrJoin } from "./components/CreateOrJoin";
import { WaitingRoom } from "./components/WaitingRoom";
import { GameBoard } from "./components/GameBoard";
import { ChatBox } from "./components/ChatBox";
import { Scoreboard } from "./components/Scoreboard";

const WS_URL = "ws://localhost:5000/ws";

export default function App() {
  const { room, playerId, playerName, setPlayerName, sendMessage } =
    useGameWebSocket(WS_URL);

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-900 py-6 px-4">
        <CreateOrJoin
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          sendMessage={sendMessage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">
      {room.state === "waiting" ? (
        <WaitingRoom
          room={room}
          playerId={playerId}
          sendMessage={sendMessage}
        />
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header del Juego Activo */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-indigo-400">
                ES UN 10 PERO...
              </h1>
              <p className="text-xs text-slate-400">
                Sala: {room.name} ({room.id})
              </p>
            </div>
            {room.adminId === playerId && (
              <button
                onClick={() =>
                  sendMessage({
                    type: "endGame",
                    payload: { roomId: room.id, adminId: room.adminId },
                  })
                }
                className="bg-red-600 hover:bg-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                Terminar Partida (Admin)
              </button>
            )}
          </div>

          {/* Grid de Contenido Principal (Layout fluido tipo Tabla) */}
          <div className="block lg:table lg:w-full lg:table-fixed lg:border-separate lg:border-spacing-x-4 space-y-4 lg:space-y-0">
            <div className="block lg:table-cell lg:w-2/3 lg:vertical-align-top">
              <GameBoard
                room={room}
                playerId={playerId}
                sendMessage={sendMessage}
              />
            </div>
            <div className="block lg:table-cell lg:w-1/3 lg:vertical-align-top space-y-4">
              <Scoreboard room={room} />
              <ChatBox
                room={room}
                playerId={playerId}
                playerName={playerName}
                sendMessage={sendMessage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
