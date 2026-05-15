import { GameAction } from "../types/actions";
import { GameState } from "../types/game";

interface JailControlsProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function JailControls({ state, dispatch }: JailControlsProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];

  const canAct =
    state.status === "ACTIVE" &&
    currentPlayer.jailState.isInJail &&
    !state.hasRolledThisTurn;

  const canPayFine = canAct && currentPlayer.cash >= 50;

  const canUseCard =
    canAct && currentPlayer.jailState.getOutOfJailFreeCards > 0;

  const canEndTurn = state.status === "ACTIVE" && state.hasRolledThisTurn;

  return (
    <section className="border border-slate-950 bg-white p-4 shadow-[4px_4px_0_#d6a531]">
      <div className="border-b border-slate-950 pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          Jail Turn
        </p>
        <h2 className="text-xl font-black uppercase tracking-wide">
          Jail Controls
        </h2>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p>
          <strong>{currentPlayer.name}</strong> is in Jail.
        </p>
        <p className="text-slate-600">
          Attempts: {currentPlayer.jailState.turnsAttempted} / 3
        </p>
      </div>
      <div className="mt-4 grid gap-2">
        <button
          className="w-full rounded border border-slate-950 bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          disabled={!canPayFine}
          onClick={() => dispatch({ type: "PAY_TO_LEAVE_JAIL" })}
        >
          Pay $50 to Leave Jail
        </button>
        <button
          className="w-full rounded border border-slate-950 bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          disabled={!canUseCard}
          onClick={() => dispatch({ type: "USE_JAIL_CARD" })}
        >
          Use "Get Out of Jail Free" Card
        </button>
        <button
          className="w-full rounded border border-slate-950 bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          disabled={!canEndTurn}
          onClick={() => dispatch({ type: "ROLL_FOR_JAIL_RELEASE" })}
        >
          Roll for Doubles to Try to Leave Jail
        </button>
        <button
          className="w-full rounded border border-slate-950 bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          disabled={!canEndTurn}
          onClick={() => dispatch({ type: "END_TURN" })}
        >
          End Turn (Stay in Jail)
        </button>
        <button
          className="w-full rounded border border-slate-950 bg-red-500 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => dispatch({ type: "RESET_GAME" })}
        >
          Reset Game
        </button>
      </div>
    </section>
  );
}
