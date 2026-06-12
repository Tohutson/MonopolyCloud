import { GameState } from "../types/game";
import { Player } from "../types/player";

interface GameHeaderProps {
  state: GameState;
  currentPlayer: Player;
}

function getPlayerStatusLabel(player: Player) {
  if (player.status === "BANKRUPT") {
    return "Bankrupt";
  }

  if (player.jailState.isInJail) {
    return "In jail";
  }

  return "Active";
}

export function GameHeader({ state, currentPlayer }: GameHeaderProps) {
  return (
    <header className="border border-slate-950 bg-white px-5 py-4 shadow-[6px_6px_0_#d6a531]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
            Local Prototype
          </p>
          <h1 className="mt-1 text-4xl font-black uppercase tracking-wide sm:text-5xl">
            Cloudopoly
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.16em]">
            <span className="border border-slate-950 bg-slate-950 px-3 py-1 text-white">
              {state.status.replace("_", " ")}
            </span>
            <span className="border border-slate-950 bg-amber-50 px-3 py-1 text-slate-950">
              {state.turnPhase.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        <section className="border border-slate-950 bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
            Current Player
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide">
                {currentPlayer.name}
              </h2>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-slate-600">
                {getPlayerStatusLabel(currentPlayer)}
              </p>
            </div>
            <p className="shrink-0 border border-slate-950 bg-white px-3 py-2 text-xl font-black">
              ${currentPlayer.cash}
            </p>
          </div>
          {currentPlayer.getOutOfJailCards > 0 && (
            <p className="mt-3 border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700">
              Get Out of Jail Free cards: {currentPlayer.getOutOfJailCards}
            </p>
          )}
        </section>
      </div>
    </header>
  );
}
