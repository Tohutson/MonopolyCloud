"use client";

import { useGameStore } from "../store/useGameStore";

export function GameDebugPanel() {
  const state = useGameStore((store) => store.state);
  const dispatch = useGameStore((store) => store.dispatch);

  return (
    <section className="rounded-xl border p-4">
      <h2 className="font-semibold">Game Debug Panel</h2>

      <p>Status: {state.status}</p>
      <p>Current player index: {state.currentPlayerIndex}</p>
      <p>Players: {state.players.length}</p>
      <p>Board squares: {state.board.length}</p>

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
      </div>
    </section>
  );
}
