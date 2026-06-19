import React from "react";
import { Room } from "../types/game";

interface Props {
  room: Room;
  playerId: string;
}

export function Scoreboard({ room, playerId }: Props) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-xl text-white">
      <h3 className="font-bold text-sm tracking-wide uppercase text-slate-300 mb-3 pb-2 border-b border-slate-700">
        🏆 Puntajes
      </h3>
      <div className="space-y-2">
        {room.players.map((p) => {
          const isGuesser = p.id === room.guesserId;
          const isPremiseAuthor = p.id === room.currentPremisePlayerId;
          const isMe = p.id === playerId;

          let roleTag = "";
          if (isGuesser) roleTag = "🔍";
          else if (isPremiseAuthor) roleTag = "✍️";

          return (
            <div
              key={p.id}
              className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/60"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate">
                  {roleTag && <span className="mr-1">{roleTag}</span>}
                  {p.name}
                  {isMe && (
                    <span className="text-xs text-indigo-400 font-mono ml-1">
                      (Tú)
                    </span>
                  )}
                </span>
              </div>
              <div className="text-right flex items-center gap-2 shrink-0">
                <span className="text-xs text-emerald-400 font-bold">
                  ✅ {p.stats?.wins ?? 0}
                </span>
                <span className="text-xs text-red-400 font-bold">
                  ❌ {p.stats?.fails ?? 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
