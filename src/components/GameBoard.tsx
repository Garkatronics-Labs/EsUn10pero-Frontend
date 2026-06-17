import React, { useState } from "react";
import { Room, ClientMessage } from "../types/game";
import { useEffect } from "react";

interface Props {
  room: Room;
  playerId: string;
  sendMessage: (msg: ClientMessage) => void;
}

export function GameBoard({ room, playerId, sendMessage }: Props) {
  const [hintInput, setHintInput] = useState("");
  const [guessInput, setGuessInput] = useState<number>(5);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const totalPlayers = room.players.length;
  const selectorPlayer = room.players[room.currentTurn];
  const guesserPlayer = room.players[(room.currentTurn + 1) % totalPlayers];

  if (!selectorPlayer || !guesserPlayer)
    return <div className="text-white">Cargando estado de la ronda...</div>;

  const isSelector = selectorPlayer.id === playerId;
  const isGuesser = guesserPlayer.id === playerId;

  useEffect(() => {
    if (room.state !== "hinting") return;

    const loadImage = async () => {
      try {
        const res = await fetch(`/rooms/${room.id}/image`);
        if (!res.ok) return;

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        setGeneratedImageUrl(url);
      } catch (e) {
        console.error("Error loading room image", e);
      }
    };

    loadImage();

    return () => {
      if (generatedImageUrl) URL.revokeObjectURL(generatedImageUrl);
    };
  }, [room.state, room.id]);

  const handleCardSelection = (num: number) => {
    sendMessage({
      type: "selectCard",
      payload: { roomId: room.id, playerId, cardNumber: num },
    });
  };

  const handleHintSubmit = () => {
    if (!hintInput.trim()) return;
    sendMessage({
      type: "submitHint",
      payload: { roomId: room.id, playerId, hint: hintInput.trim() },
    });
    setHintInput("");
  };

  const handleGuessSubmit = () => {
    sendMessage({
      type: "submitGuess",
      payload: { roomId: room.id, playerId, guess: guessInput },
    });
  };

  const handleVoteSkip = () => {
    sendMessage({
      type: "voteToSkip",
      payload: {
        roomId: room.id,
        voterId: playerId,
        targetIndex: room.currentTurn,
      },
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl text-white">
      {/* Header de Estado y Timer */}
      <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
        <div>
          <span className="text-xs bg-indigo-600 px-2 py-1 rounded font-bold tracking-wider uppercase">
            {room.state}
          </span>
          <p className="text-sm text-slate-400 mt-1">
            Selector:{" "}
            <span className="text-indigo-400 font-bold">
              {selectorPlayer.name}
            </span>{" "}
            | Adivina:{" "}
            <span className="text-yellow-400 font-bold">
              {guesserPlayer.name}
            </span>
          </p>
        </div>
        <div
          className={`text-2xl font-mono font-bold px-4 py-2 rounded-xl bg-slate-900 border ${room.timer <= 5 ? "text-red-500 border-red-500 animate-pulse" : "text-emerald-400 border-slate-700"}`}
        >
          ⏱ {room.timer}s
        </div>
      </div>

      {/* --- FASE 1: ROUND START (Selección de Carta) --- */}
      {room.state === "round_start" && (
        <div className="text-center py-6">
          {isSelector ? (
            <div>
              <h3 className="text-xl font-bold text-indigo-300 mb-4">
                Elige la puntuación secreta de la carta (1 al 10):
              </h3>
              <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <img
                    key={num}
                    src={`/EsUn10pero-Frontend/assets/${num}.png`}
                    alt={`Card ${num}`}
                    onClick={() => handleCardSelection(num)}
                    className="aspect-square bg-slate-900 border-2 border-indigo-500 hover:bg-indigo-600 rounded-xl transition cursor-pointer object-cover"
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-lg text-slate-300 italic">
              Esperando a que {selectorPlayer.name} elija una carta...
            </p>
          )}
        </div>
      )}

      {/* --- FASE 2: HINTING (Escribir la pista "Es un 10 pero...") --- */}
      {room.state === "hinting" && (
        <div className="text-center py-6">
          {isSelector ? (
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-indigo-300 mb-2">
                Elegiste la carta:{" "}
                <span className="text-white text-2xl font-black bg-indigo-600 px-3 py-1 rounded">
                  {room.selectedCard}
                </span>
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Escribe la pista condicionante para que {guesserPlayer.name}{" "}
                intente adivinar el número exacto.
              </p>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex gap-2">
                <span className="font-bold text-slate-400 self-center">
                  Es un 10 pero...
                </span>
                <input
                  type="text"
                  placeholder="no limpia la taza que usa."
                  className="flex-1 bg-transparent border-none outline-none text-white font-medium"
                  value={hintInput}
                  onChange={(e) => setHintInput(e.target.value)}
                />
              </div>
              <button
                onClick={handleHintSubmit}
                className="mt-4 bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-bold transition"
              >
                Enviar Pista
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg text-slate-300">¡Carta Seleccionada!</p>
              {!isGuesser && room.selectedCard && (
                <p className="text-sm text-indigo-400 mt-2">
                  Puntuación Secreta visible para el grupo:{" "}
                  <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded">
                    {room.selectedCard}
                  </span>
                </p>
              )}
              {isGuesser && (
                <p className="text-sm text-yellow-400 font-medium mt-1">
                  No puedes ver el número. Esperando la pista de{" "}
                  {selectorPlayer.name}...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- FASE 3: GUESSING (El adivinar deduce el número) --- */}
      {room.state === "guessing" && (
        <div className="text-center py-6">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 max-w-xl mx-auto">
            {generatedImageUrl && (
              <div className="mb-4">
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="mx-auto rounded-xl border border-slate-700 max-h-64"
                />
              </div>
            )}
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400 block mb-1">
              Premisa de la Ronda
            </span>
            <p className="text-xl font-serif italic text-yellow-300">
              "Es un 10 pero {room.hint}"
            </p>
          </div>

          {isGuesser ? (
            <div className="max-w-xs mx-auto">
              <h3 className="text-lg font-bold text-indigo-300 mb-3">
                ¿Qué número crees que es?
              </h3>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>1 (Pésimo)</span>
                <span>10 (Perfecto)</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                className="w-full accent-yellow-400 mb-4"
                value={guessInput}
                onChange={(e) => setGuessInput(Number(e.target.value))}
              />
              <div className="text-3xl font-black font-mono text-yellow-400 mb-4 bg-slate-900 py-2 rounded-lg border border-slate-700">
                {guessInput}
              </div>
              <button
                onClick={handleGuessSubmit}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-extrabold py-2.5 rounded-xl transition"
              >
                Enviar Respuesta
              </button>
            </div>
          ) : (
            <div>
              <p className="text-slate-300 font-medium">
                Analizando la pista...
              </p>
              <p className="text-sm text-yellow-400 mt-1">
                Esperando la deducción de {guesserPlayer.name}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Botón de Votación para Cancelar / Saltar Turno (Skip) */}
      {!isSelector &&
        (room.state === "round_start" ||
          room.state === "hinting" ||
          room.state === "guessing") && (
          <div className="mt-8 border-t border-slate-700 pt-4 flex justify-between items-center bg-slate-900/50 p-3 rounded-xl">
            <p className="text-xs text-slate-400">
              ¿El selector está tardando demasiado o rompió las reglas?
            </p>
            <button
              onClick={handleVoteSkip}
              className="bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/40 px-3 py-1.5 rounded-lg text-xs font-bold transition"
            >
              Votar Skip a {selectorPlayer.name} ({selectorPlayer.votesToSkip}/
              {Math.floor(totalPlayers / 2) + 1})
            </button>
          </div>
        )}
    </div>
  );
}
