import { GameAction } from "../types/actions";
import { GameState } from "../types/game";
import { JAIL_FINE, MAX_JAIL_ATTEMPTS } from "../engine/rules/constants";
import {
  controlBodyTextClass,
  controlHeaderKickerClass,
  controlHeaderTitleClass,
  controlMutedTextClass,
  controlPanelClass,
  controlPrimaryButtonClass,
  controlSecondaryButtonClass,
  controlDangerButtonClass,
} from "./controlStyles";
import { DiceRollDisplay } from "./DiceRollDisplay";

interface JailControlsProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  displayedDiceRoll?: GameState["lastDiceRoll"];
  isDiceRolling?: boolean;
}

export function JailControls({
  state,
  dispatch,
  displayedDiceRoll,
  isDiceRolling = false,
}: JailControlsProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];

  const canAct =
    state.status === "ACTIVE" &&
    currentPlayer.jailState.isInJail &&
    state.turnPhase === "ROLL_READY" &&
    !isDiceRolling;

  const canPayFine = canAct && currentPlayer.cash >= JAIL_FINE;

  const canUseCard =
    canAct && currentPlayer.getOutOfJailCards > 0;

  const canRollForRelease = canAct;
  const canEndTurn =
    state.status === "ACTIVE" &&
    state.turnPhase === "OPTIONAL_ACTIONS" &&
    !isDiceRolling;

  return (
    <section className={controlPanelClass}>
      <div className="border-b border-slate-950 pb-3">
        <p className={controlHeaderKickerClass}>Jail Turn</p>
        <h2 className={controlHeaderTitleClass}>Jail Controls</h2>
      </div>

      <DiceRollDisplay
        roll={displayedDiceRoll ?? state.lastDiceRoll}
        isRolling={isDiceRolling}
        emptyMessage="No jail roll yet."
        title={isDiceRolling ? "Rolling" : "Last Jail Roll"}
      />

      <div className={controlBodyTextClass}>
        <p>
          <strong>{currentPlayer.name}</strong> is in Jail.
        </p>
        <p className={controlMutedTextClass}>
          Attempts: {currentPlayer.jailState.turnsAttempted} /{" "}
          {MAX_JAIL_ATTEMPTS}
        </p>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          className={controlPrimaryButtonClass}
          disabled={!canPayFine}
          onClick={() => dispatch({ type: "PAY_TO_LEAVE_JAIL" })}
        >
          Pay ${JAIL_FINE} to Leave Jail
        </button>
        <button
          className={controlSecondaryButtonClass}
          disabled={!canUseCard}
          onClick={() => dispatch({ type: "USE_JAIL_CARD" })}
        >
          Use Get Out of Jail Free Card
        </button>
        <button
          className={controlPrimaryButtonClass}
          disabled={!canRollForRelease}
          onClick={() => dispatch({ type: "ROLL_FOR_JAIL_RELEASE" })}
        >
          Roll for Doubles to Try to Leave Jail
        </button>
        <button
          className={controlSecondaryButtonClass}
          disabled={!canEndTurn}
          onClick={() => dispatch({ type: "END_TURN" })}
        >
          End Turn (Stay in Jail)
        </button>
        <button
          className={controlDangerButtonClass}
          onClick={() => dispatch({ type: "RESET_GAME" })}
        >
          Reset Game
        </button>
      </div>
    </section>
  );
}
