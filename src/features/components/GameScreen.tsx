"use client";

import { useGameStore } from "../store/useGameStore";
import { CurrentSquarePanel } from "./CurrentSquarePanel";
import { GameBoard } from "./GameBoard";
import { GameLog } from "./GameLog";
import { PlayerPanel } from "./PlayerPanel";
import { TurnControls } from "./TurnControls";

export function GameScreen() {
  const state = useGameStore((store) => store.state);
  const dispatch = useGameStore((store) => store.dispatch);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const currentSquare = state.board[currentPlayer.position];

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="border border-slate-950 bg-white px-5 py-4 shadow-[6px_6px_0_#d6a531]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
                Local Prototype
              </p>
              <h1 className="mt-1 text-4xl font-black uppercase tracking-wide sm:text-5xl">
                Cloudopoly
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
                A premium board-game interface for the serverless AWS edition.
              </p>
            </div>

            <div className="border border-slate-950 px-4 py-3 text-sm">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Game Status
              </span>
              <strong className="text-lg uppercase tracking-wide">
                {state.status.replace("_", " ")}
              </strong>
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0">
            <GameBoard state={state} />
          </section>

          <aside className="space-y-4 xl:max-h-[calc(100vh-150px)] xl:overflow-y-auto xl:pr-1">
            <TurnControls state={state} dispatch={dispatch} />
            <PlayerPanel state={state} />
            <CurrentSquarePanel
              currentPlayer={currentPlayer}
              currentSquare={currentSquare}
            />
            <GameLog entries={state.log} />
          </aside>
        </div>
      </div>
    </main>
  );
}
