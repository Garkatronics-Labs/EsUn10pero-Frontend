import React, { useState } from "react";
import { Room, ClientMessage } from "../types/game";
import Deck from "./Deck";

interface Props {
  room: Room;
  playerId: string;
  sendMessage: (msg: ClientMessage) => void;
}

function getPlayerName(room: Room, playerId: string): string {
  return room.players.find((p) => p.id === playerId)?.name ?? "???";
}

function getRole(room: Room, playerId: string): string {
  if (playerId === room.guesserId) return "🔍 Adivinador";
  if (playerId === room.currentPremisePlayerId) return "✍️ Autor";
  return "👀 Espectador";
}

export function GameBoard({ room, playerId, sendMessage }: Props) {
  const [premiseInput, setPremiseInput] = useState("");

  // Deck animation: closed while waiting, fans open when guesser can pick
  const [deckOpen, setDeckOpen] = useState(false);

  const isGuesser = room.guesserId === playerId;
  const isPremiseAuthor = room.currentPremisePlayerId === playerId;

  // Auto-open deck when guesser arrives at guessing phase
  React.useEffect(() => {
    if (room.state === "guessing" && isGuesser) {
      // Small delay so the stacked preview is briefly visible
      const timer = setTimeout(() => setDeckOpen(true), 400);
      return () => clearTimeout(timer);
    } else {
      setDeckOpen(false);
    }
  }, [room.state, isGuesser]);

  const handlePremiseSubmit = () => {
    const fullText = `Es un 10 pero ${premiseInput.trim()}`;
    if (premiseInput.trim().length === 0) return;
    sendMessage({
      type: "submitPremise",
      payload: { roomId: room.id, playerId, text: fullText },
    });
    setPremiseInput("");
  };

  const handleGuessSubmit = (cardNumber: number) => {
    setDeckOpen(false);
    sendMessage({
      type: "submitGuess",
      payload: { roomId: room.id, playerId, guess: cardNumber },
    });
  };

  const handleVoteSkip = () => {
    sendMessage({
      type: "voteToSkip",
      payload: { roomId: room.id, voterId: playerId },
    });
  };

  // Mostrar resultado de ronda
  if (room.state === "round_end" && room.roundResult) {
    return <RoundEndDisplay room={room} />;
  }

  const roleLabel = getRole(room, playerId);

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl text-white">
      {/* Header de Estado y Timer */}
      <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
        <div>
          <span className="text-xs bg-indigo-600 px-2 py-1 rounded font-bold tracking-wider uppercase">
            {room.state}
          </span>
          <p className="text-sm text-slate-400 mt-1">
            Adivina:{" "}
            <span className="text-yellow-400 font-bold">
              {getPlayerName(room, room.guesserId)}
            </span>{" "}
            {isGuesser && (
              <span className="text-xs text-yellow-400/60">(Tú)</span>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Tu rol: {roleLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className={`text-2xl font-mono font-bold px-4 py-2 rounded-xl bg-slate-900 border ${room.timer <= 5 ? "text-red-500 border-red-500 animate-pulse" : "text-emerald-400 border-slate-700"}`}
          >
            ⏱ {room.timer}s
          </div>
          {room.state === "guessing" && (
            <span className="text-xs font-mono text-slate-400">
              Intentos: {room.guessAttempts}/{room.maxGuessesPerRound}
            </span>
          )}
        </div>
      </div>

      {/* --- FASE PREMISE (Escribir premisa "Es un 10 pero...") --- */}
      {room.state === "premise" && (
        <div className="text-center py-6">
          {isPremiseAuthor ? (
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-indigo-300 mb-2">
                Escribe la premisa:
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Algo que describa por qué esta persona es un 10, pero con un
                defecto gracioso.
              </p>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex gap-2">
                <span className="font-bold text-slate-400 self-center whitespace-nowrap">
                  Es un 10 pero
                </span>
                <input
                  type="text"
                  placeholder="no limpia la taza que usa."
                  className="flex-1 bg-transparent border-none outline-none text-white font-medium"
                  value={premiseInput}
                  onChange={(e) => setPremiseInput(e.target.value)}
                />
              </div>
              <button
                onClick={handlePremiseSubmit}
                className="mt-4 bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-bold transition"
              >
                Enviar Premisa
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg text-slate-300 italic">
                Esperando a que{" "}
                <span className="text-indigo-400 font-bold">
                  {getPlayerName(room, room.currentPremisePlayerId)}
                </span>{" "}
                escriba la premisa...
              </p>
              <div className="mt-4 space-y-1">
                {room.premises.map((premise, idx) => (
                  <p
                    key={idx}
                    className="text-sm text-slate-400 font-serif italic"
                  >
                    "{premise.text}"
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- FASE GUESSING (El adivinador deduce el número) --- */}
      {room.state === "guessing" && (
        <div className="text-center py-6">
          {/* Premisas existentes */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400 block mb-2">
              {isGuesser ? "Premisas de la Ronda" : "Premisas Enviadas"}
            </span>
            {room.premises.map((premise, idx) => {
              const authorName = getPlayerName(room, premise.playerId);
              return (
                <p
                  key={idx}
                  className="text-lg font-serif italic text-yellow-300 border-b border-slate-700/50 pb-1"
                >
                  "{premise.text}"
                  <span className="block text-xs text-slate-500 not-italic">
                    — {authorName}
                  </span>
                </p>
              );
            })}
          </div>

          {isGuesser ? (
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold text-indigo-300 mb-3">
                {deckOpen ? "Selecciona un número" : "Preparando cartas..."}
              </h3>
              <div className="flex justify-center">
                <Deck
                  isOpen={deckOpen}
                  onSelect={handleGuessSubmit}
                  disabled={!deckOpen}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1)}
                </Deck>
              </div>
              {deckOpen && (
                <p className="text-sm text-slate-400 mt-6">
                  Haz clic en la carta con el número que creas correcto
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-slate-300 font-medium">
                Analizando las premisas...
              </p>
              <p className="text-sm text-yellow-400 mt-1">
                Esperando la deducción de {getPlayerName(room, room.guesserId)}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Botón de Votación para Saltar */}
      {!isGuesser && !isPremiseAuthor && room.state === "premise" && (
        <div className="mt-8 border-t border-slate-700 pt-4 flex justify-between items-center bg-slate-900/50 p-3 rounded-xl">
          <p className="text-xs text-slate-400">
            ¿El autor está tardando demasiado?
          </p>
          <button
            onClick={handleVoteSkip}
            className="bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/40 px-3 py-1.5 rounded-lg text-xs font-bold transition"
          >
            Votar Skip a {getPlayerName(room, room.currentPremisePlayerId)} (
            {room.players.find((p) => p.id === room.currentPremisePlayerId)
              ?.votesToSkip ?? 0}
            /{Math.floor(room.players.length / 2) + 1})
          </button>
        </div>
      )}
    </div>
  );
}

function RoundEndDisplay({ room }: { room: Room }) {
  const result = room.roundResult!;

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl text-white">
      <div className="text-center py-6">
        <h2 className="text-3xl font-black mb-4">
          {result.success ? (
            <span className="text-emerald-400">🎉 ¡Ronda Completada! 🎉</span>
          ) : (
            <span className="text-red-400">
              😞 Ronda Fallida — El número era {result.number}
            </span>
          )}
        </h2>

        {/* Premisas de la ronda */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 max-w-xl mx-auto">
          <span className="text-xs uppercase tracking-wider font-mono text-slate-400 block mb-3">
            Premisas de la Ronda
          </span>
          {room.premises.map((premise, idx) => {
            const authorName =
              room.players.find((p) => p.id === premise.playerId)?.name ??
              "???";
            return (
              <p
                key={idx}
                className="text-lg font-serif italic text-yellow-300 border-b border-slate-700/50 pb-2 mb-2"
              >
                "{premise.text}"
                <span className="block text-xs text-slate-500 not-italic">
                  — {authorName}
                </span>
              </p>
            );
          })}
        </div>

        <p className="text-sm text-slate-400">
          Esperando la siguiente ronda...
        </p>
      </div>
    </div>
  );
}
