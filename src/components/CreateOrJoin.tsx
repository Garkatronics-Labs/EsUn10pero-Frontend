import React, { useState } from "react";
import { ClientMessage } from "../types/game";

interface Props {
  playerId: string;
  playerName: string;
  setPlayerName: (name: string) => void;
  sendMessage: (msg: ClientMessage) => void;
}

export function CreateOrJoin({
  playerId,
  playerName,
  setPlayerName,
  sendMessage,
}: Props) {
  const [localName, setLocalName] = useState(playerName);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomTitle, setRoomTitle] = useState("");

  const handleSaveName = () => {
    if (localName.trim()) setPlayerName(localName.trim());
  };

  const handleCreate = () => {
    if (!playerName) return alert("Por favor guarda tu nombre primero");
    sendMessage({
      type: "createRoom",
      payload: { name: roomTitle || "Sala de Diversión", playerId, playerName },
    });
  };

  const handleJoin = () => {
    if (!playerName) return alert("Por favor guarda tu nombre primero");
    if (!roomIdInput.trim()) return alert("Ingresa un código de sala");
    sendMessage({
      type: "joinRoom",
      payload: {
        roomId: roomIdInput.trim().toUpperCase(),
        playerId,
        playerName,
      },
    });
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 text-white">
      <h1 className="text-3xl font-extrabold text-center text-indigo-400 mb-6 tracking-wide">
        ES UN 10 PERO...
      </h1>

      {/* Sección de Nombre de Usuario */}
      <div className="mb-6 p-4 bg-slate-900 rounded-xl border border-slate-700">
        <label className="block text-sm font-semibold mb-2 text-slate-400">
          Tu Nombre de Jugador:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-600 focus:outline-none focus:border-indigo-500"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
          />
          <button
            onClick={handleSaveName}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded font-bold transition"
          >
            Guardar
          </button>
        </div>
        {playerName && (
          <p className="text-xs text-green-400 mt-2">
            ✓ Registrado como: {playerName}
          </p>
        )}
      </div>

      {/* Crear Sala */}
      <div className="mb-6 border-b border-slate-700 pb-6">
        <h2 className="text-xl font-bold mb-3 text-indigo-300">
          Crear una Nueva Sala
        </h2>
        <input
          type="text"
          placeholder="Nombre opcional de la sala..."
          className="w-full px-3 py-2 mb-3 rounded bg-slate-900 border border-slate-700 text-white"
          value={roomTitle}
          onChange={(e) => setRoomTitle(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="w-full bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-lg font-bold transition"
        >
          Crear Sala
        </button>
      </div>

      {/* Unirse a Sala */}
      <div>
        <h2 className="text-xl font-bold mb-3 text-indigo-300">
          Unirse a una Sala Existente
        </h2>
        <input
          type="text"
          placeholder="CÓDIGO DE SALA (Ej: A4B1CD)"
          className="w-full px-3 py-2 mb-3 rounded bg-slate-900 border border-slate-700 text-center uppercase font-mono font-bold text-xl text-yellow-400 tracking-widest"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
        />
        <button
          onClick={handleJoin}
          className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 rounded-lg font-bold transition"
        >
          Unirse a la Sala
        </button>
      </div>
    </div>
  );
}
