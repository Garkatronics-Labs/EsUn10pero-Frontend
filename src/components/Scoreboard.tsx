import React from "react";
import { Room } from "../types/game";

interface Props {
  room: Room;
}

export function Scoreboard({ room }: Props) {
  // Ordenar jugadores por puntaje descendente
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-xl text-white">
      <h3 className="font-bold text-sm tracking-wide uppercase text-slate-300 mb-3 pb-2 border-b border-slate-700">
        🏆 Tabla de Clasificación
      </h3>
      <div className="space-y-2">
        {sortedPlayers.map((p, idx) => (
          <div
            key={p.id}
            className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/60"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">
                #{idx + 1}
              </span>
              <span className="font-medium text-sm">{p.name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-400">
                {p.score} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
