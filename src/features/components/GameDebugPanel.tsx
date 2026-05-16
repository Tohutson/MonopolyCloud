"use client";

import { useGameStore } from "../store/useGameStore";

export function GameDebugPanel() {
  const state = useGameStore((store) => store.state);
  const dispatch = useGameStore((store) => store.dispatch);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const currentSquare = state.board[currentPlayer.position];

  return (
    <section className="rounded-xl border p-4">
      <h2 className="font-semibold">Game Debug Panel</h2>

      <p>Status: {state.status}</p>
      <p>Current player index: {state.currentPlayerIndex}</p>
      <p>Players: {state.players.length}</p>
      <p>Board squares: {state.board.length}</p>

      <p>Current player: {currentPlayer.name}</p>
      <p>Current square: {currentSquare.name}</p>
      <p>Cash: ${currentPlayer.cash}</p>

      {state.lastDiceRoll ? (
        <p>
          Last roll: {state.lastDiceRoll.die1} + {state.lastDiceRoll.die2} ={" "}
          {state.lastDiceRoll.total}
        </p>
      ) : (
        <p>No dice rolled yet.</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          className="rounded bg-black px-3 py-2 text-white"
          onClick={() => {
            dispatch({ type: "START_GAME" });
          }}
        >
          Start Game
        </button>

        <button
          className="rounded border px-3 py-2"
          onClick={() => {
            dispatch({ type: "RESET_GAME" });
          }}
        >
          Reset Game
        </button>

        <button
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          disabled={
            state.status !== "ACTIVE" ||
            state.hasRolledThisTurn ||
            Boolean(state.pendingRoll)
          }
          onClick={() => {
            dispatch({ type: "ROLL_DICE" });
          }}
        >
          Roll Dice
        </button>

        <button
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          disabled={
            state.hasRolledThisTurn !== true ||
            state.status !== "ACTIVE" ||
            Boolean(state.pendingRoll)
          }
          onClick={() => {
            dispatch({ type: "END_TURN" });
          }}
        >
          End Turn
        </button>
      </div>
      <div>
        <h3>Log</h3>

        {state.log.map((entry) => (
          <p key={entry.id}>{entry.message}</p>
        ))}
      </div>
    </section>
  );
}
