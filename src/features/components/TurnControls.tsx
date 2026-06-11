import { GameAction } from "../types/actions";
import { DiceRoll, GameState } from "../types/game";
import {
  controlPanelClass,
  controlPrimaryButtonClass,
  controlSecondaryButtonClass,
  controlHeaderKickerClass,
  controlHeaderTitleClass,
} from "./controlStyles";
import { DiceRollDisplay } from "./DiceRollDisplay";

interface TurnControlsProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  displayedDiceRoll?: DiceRoll | null;
  isDiceRolling?: boolean;
  isTurnAnimating?: boolean;
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
    <section className={controlPanelClass}>
      <div className="border-b border-slate-950 pb-3">
        <p className={controlHeaderKickerClass}>Round Desk</p>
        <h2 className={controlHeaderTitleClass}>Turn Controls</h2>
      </div>

      <DiceRollDisplay
        roll={diceRollToDisplay}
        isRolling={isDiceRolling}
        emptyMessage="No dice rolled yet."
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className={controlPrimaryButtonClass}
          disabled={!canStart}
          onClick={() => dispatch({ type: "START_GAME" })}
        >
          Start Game
        </button>
        <button
          className={controlPrimaryButtonClass}
          disabled={!canRoll}
          onClick={() => dispatch({ type: "ROLL_DICE" })}
        >
          Roll Dice
        </button>
        <button
          className={controlPrimaryButtonClass}
          disabled={!canEndTurn}
          onClick={() => dispatch({ type: "END_TURN" })}
        >
          End Turn
        </button>
        <button
          className={controlSecondaryButtonClass}
          onClick={() => dispatch({ type: "RESET_GAME" })}
        >
          Reset Game
        </button>
      </div>
    </section>
  );
}
