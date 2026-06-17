import React, { useState, useRef, useEffect } from "react";
import { Room, ClientMessage } from "../types/game";

interface Props {
  room: Room;
  playerId: string;
  playerName: string;
  sendMessage: (msg: ClientMessage) => void;
}

export function ChatBox({ room, playerId, playerName, sendMessage }: Props) {
  const [text, setText] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.chat]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage({
      type: "sendMessage",
      payload: { roomId: room.id, playerId, playerName, message: text.trim() },
    });
    setText("");
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl h-[450px] flex flex-col overflow-hidden shadow-xl text-white">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
        <h3 className="font-bold text-sm tracking-wide uppercase text-slate-300">
          💬 Chat de la Sala
        </h3>
      </div>

      {/* Cuerpo del Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
        {room.chat.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-[85%] ${msg.sender === playerName ? "bg-indigo-600/30 border border-indigo-500/30 ml-auto text-right" : "bg-slate-900 border border-slate-700 mr-auto text-left"}`}
          >
            <span className="block text-[10px] font-bold text-indigo-400 mb-0.5">
              {msg.sender}
            </span>
            <p className="break-words">{msg.message}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input de Envío */}
      <form
        onSubmit={handleSend}
        className="p-2 bg-slate-900 border-t border-slate-700 flex gap-2"
      >
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-xs px-3 py-1.5 rounded font-bold transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
