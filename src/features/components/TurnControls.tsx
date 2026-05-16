import { motion, useReducedMotion } from "motion/react";
import { GameAction } from "../types/actions";
import { DiceRoll, GameState } from "../types/game";

interface TurnControlsProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  displayedDiceRoll?: DiceRoll | null;
  isDiceRolling?: boolean;
  isTurnAnimating?: boolean;
}

const primaryButtonClass =
  "border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-black uppercase tracking-wide text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200 disabled:hover:text-slate-500";

const secondaryButtonClass =
  "border border-slate-950 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:bg-amber-50";

function DiceFace({
  value,
  isRolling,
  index,
}: {
  value: number;
  isRolling: boolean;
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      animate={
        isRolling && !shouldReduceMotion
          ? { rotate: [0, -12, 12, 0], y: [0, -3, 2, 0] }
          : { rotate: 0, y: 0 }
      }
      className="flex h-10 w-10 items-center justify-center border border-slate-950 bg-white text-lg font-black"
      transition={{
        duration: 0.36,
        repeat: isRolling && !shouldReduceMotion ? Infinity : 0,
        delay: index * 0.04,
      }}
    >
      {value}
    </motion.span>
  );
}

export function TurnControls({
  state,
  dispatch,
  displayedDiceRoll,
  isDiceRolling = false,
  isTurnAnimating = false,
}: TurnControlsProps) {
  const canStart = state.status === "NOT_STARTED";
  const canRoll =
    state.status === "ACTIVE" &&
    !state.hasRolledThisTurn &&
    !state.pendingRoll &&
    !isTurnAnimating;
  const canEndTurn =
    state.status === "ACTIVE" &&
    state.hasRolledThisTurn &&
    !state.pendingRoll &&
    !isTurnAnimating;
  const diceRollToDisplay = displayedDiceRoll ?? state.lastDiceRoll;

  return (
    <section className="border border-slate-950 bg-white p-4 shadow-[4px_4px_0_#d6a531]">
      <div className="border-b border-slate-950 pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          Round Desk
        </p>
        <h2 className="text-xl font-black uppercase tracking-wide">
          Turn Controls
        </h2>
      </div>

      {diceRollToDisplay ? (
        <div className="mt-4 border border-slate-950 bg-stone-50 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {isDiceRolling ? "Rolling" : "Last Roll"}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <DiceFace
              value={diceRollToDisplay.die1}
              isRolling={isDiceRolling}
              index={0}
            />
            <span className="text-sm font-black">+</span>
            <DiceFace
              value={diceRollToDisplay.die2}
              isRolling={isDiceRolling}
              index={1}
            />
            <span className="text-sm font-black">=</span>
            <span className="border border-amber-600 bg-amber-100 px-3 py-2 text-lg font-black">
              {diceRollToDisplay.total}
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-4 border border-slate-200 bg-stone-50 p-3 text-sm font-medium text-slate-600">
          No dice rolled yet.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className={primaryButtonClass}
          disabled={!canStart}
          onClick={() => dispatch({ type: "START_GAME" })}
        >
          Start Game
        </button>
        <button
          className={primaryButtonClass}
          disabled={!canRoll}
          onClick={() => dispatch({ type: "ROLL_DICE" })}
        >
          Roll Dice
        </button>
        <button
          className={primaryButtonClass}
          disabled={!canEndTurn}
          onClick={() => dispatch({ type: "END_TURN" })}
        >
          End Turn
        </button>
        <button
          className={secondaryButtonClass}
          onClick={() => dispatch({ type: "RESET_GAME" })}
        >
          Reset Game
        </button>
      </div>
    </section>
  );
}
