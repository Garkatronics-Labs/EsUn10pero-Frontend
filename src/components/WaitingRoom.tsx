import React from "react";
import { Room, ClientMessage } from "../types/game";

interface Props {
  room: Room;
  playerId: string;
  sendMessage: (msg: ClientMessage) => void;
}

export function WaitingRoom({ room, playerId, sendMessage }: Props) {
  const isAdmin = room.adminId === playerId;

  const handleStart = () => {
    if (room.players.length < 2)
      return alert("Se necesitan mínimo 2 jugadores.");
    sendMessage({
      type: "startGame",
      payload: { roomId: room.id, adminId: room.adminId },
    });
  };

  const handleTimeChange = (time: number) => {
    sendMessage({
      type: "updateMaxTime",
      payload: { roomId: room.id, adminId: room.adminId, maxTime: time },
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-slate-800 p-6 rounded-2xl shadow-xl text-white border border-slate-700">
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-400">{room.name}</h2>
          <p className="text-sm text-slate-400">
            Código de Sala:{" "}
            <span className="font-mono font-bold text-yellow-400 bg-slate-900 px-2 py-0.5 rounded">
              {room.id}
            </span>
          </p>
        </div>
        <button
          onClick={() =>
            sendMessage({
              type: "leaveRoom",
              payload: { roomId: room.id, playerId },
            })
          }
          className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded font-semibold text-xs"
        >
          Salir de Sala
        </button>
      </div>

      {/* Panel del Administrador */}
      {isAdmin && (
        <div className="mb-6 bg-slate-900 p-4 rounded-xl border border-indigo-900/50">
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">
            Configuración del Admin
          </h3>
          <label className="block text-xs text-slate-400 mb-2">
            Tiempo máximo por turno: {room.maxTime} segundos
          </label>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={room.maxTime}
            onChange={(e) => handleTimeChange(Number(e.target.value))}
            className="w-full accent-indigo-500 mb-4"
          />
          <button
            onClick={handleStart}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition text-lg shadow-lg"
          >
            ¡Iniciar Partida! 🎮
          </button>
        </div>
      )}

      {/* Lista de Jugadores */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-slate-300">
          Jugadores Conectados ({room.players.length}/10)
        </h3>
        <div className="space-y-2">
          {room.players.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-slate-900 px-4 py-3 rounded-lg border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.name}</span>
                {p.id === room.adminId && (
                  <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded font-bold border border-yellow-500/30">
                    LÍDER
                  </span>
                )}
                {p.id === playerId && (
                  <span className="text-xs text-indigo-400 font-mono">
                    (Tú)
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Conectado
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
