import { JAIL_FINE, MAX_JAIL_ATTEMPTS } from "../engine/rules/constants";
import { GameAction } from "../types/actions";
import { DiceRoll, GameState } from "../types/game";
import {
  controlBodyTextClass,
  controlHeaderKickerClass,
  controlHeaderTitleClass,
  controlMutedTextClass,
  controlPanelClass,
  controlPrimaryButtonClass,
  controlSecondaryButtonClass,
} from "./controlStyles";
import { DiceRollDisplay } from "./DiceRollDisplay";

interface TurnControlsProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  displayedDiceRoll?: DiceRoll | null;
  isDiceRolling?: boolean;
  isTurnAnimating?: boolean;
  onOpenAssets: () => void;
  onOpenBuildings: () => void;
}

export function TurnControls({
  state,
  dispatch,
  displayedDiceRoll,
  isDiceRolling = false,
  isTurnAnimating = false,
  onOpenAssets,
  onOpenBuildings,
}: TurnControlsProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const currentSquare = state.board[currentPlayer.position];
  const ownedCurrentProperty =
    currentSquare.type === "PROPERTY"
      ? state.ownedProperties.find(
          (ownedProperty) => ownedProperty.propertyId === currentSquare.id,
        )
      : null;
  const playerOwnsAnyProperty = state.ownedProperties.some(
    (ownedProperty) => ownedProperty.ownerId === currentPlayer.id,
  );

  const canStart = state.status === "NOT_STARTED";
  const canAct =
    state.status === "ACTIVE" && !isDiceRolling && !isTurnAnimating;
  const canRoll = canAct && state.turnPhase === "ROLL_READY";
  const canEndTurn = canAct && state.turnPhase === "OPTIONAL_ACTIONS";
  const canMakePropertyDecision =
    canAct &&
    state.turnPhase === "PROPERTY_DECISION" &&
    currentSquare.type === "PROPERTY" &&
    !ownedCurrentProperty;
  const canBuyProperty =
    canMakePropertyDecision &&
    currentSquare.type === "PROPERTY" &&
    currentPlayer.cash >= currentSquare.price;
  const canStartAuction = canMakePropertyDecision;
  const isJailTurn =
    state.status === "ACTIVE" &&
    currentPlayer.jailState.isInJail &&
    state.turnPhase === "ROLL_READY";
  const canPayFine = canAct && isJailTurn && currentPlayer.cash >= JAIL_FINE;
  const canUseJailCard =
    canAct && isJailTurn && currentPlayer.getOutOfJailCards > 0;
  const canRollForRelease = canAct && isJailTurn;
  const diceRollToDisplay = displayedDiceRoll ?? state.lastDiceRoll;
  const canManageBuildings =
    canAct && state.turnPhase === "OPTIONAL_ACTIONS" && playerOwnsAnyProperty;

  return (
    <section className={controlPanelClass}>
      <div className="border-b border-slate-950 pb-3">
        <p className={controlHeaderKickerClass}>Action Dock</p>
        <h2 className={controlHeaderTitleClass}>Turn Controls</h2>
      </div>

      <DiceRollDisplay
        roll={diceRollToDisplay}
        isRolling={isDiceRolling}
        emptyMessage="No dice rolled yet."
        title={isJailTurn ? "Jail Roll" : "Last Roll"}
      />

      <div className={controlBodyTextClass}>
        <p>
          Phase:{" "}
          <strong className="uppercase tracking-wide">
            {state.turnPhase.replaceAll("_", " ")}
          </strong>
        </p>
        {currentPlayer.jailState.isInJail && (
          <p className={controlMutedTextClass}>
            Jail attempts: {currentPlayer.jailState.turnsAttempted} /{" "}
            {MAX_JAIL_ATTEMPTS}
          </p>
        )}
      </div>

      <div className="mt-4 grid min-h-[278px] auto-rows-fr grid-cols-2 gap-2">
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
          disabled={!canBuyProperty || currentSquare.type !== "PROPERTY"}
          onClick={() => {
            if (currentSquare.type === "PROPERTY") {
              dispatch({ type: "BUY_PROPERTY", propertyId: currentSquare.id });
            }
          }}
        >
          Buy Property
        </button>
        <button
          className={controlSecondaryButtonClass}
          disabled={!canStartAuction || currentSquare.type !== "PROPERTY"}
          onClick={() => {
            if (currentSquare.type === "PROPERTY") {
              dispatch({
                type: "DECLINE_PROPERTY",
                propertyId: currentSquare.id,
              });
            }
          }}
        >
          Decline (Start Auction)
        </button>
        <button
          className={controlPrimaryButtonClass}
          disabled={!canPayFine}
          onClick={() => dispatch({ type: "PAY_TO_LEAVE_JAIL" })}
        >
          Pay Bail
        </button>
        <button
          className={controlSecondaryButtonClass}
          disabled={!canRollForRelease}
          onClick={() => dispatch({ type: "ROLL_FOR_JAIL_RELEASE" })}
        >
          Attempt Doubles
        </button>
        <button
          className={controlSecondaryButtonClass}
          disabled={!canUseJailCard}
          onClick={() => dispatch({ type: "USE_JAIL_CARD" })}
        >
          Use Jail Card
        </button>
        <button
          className={controlPrimaryButtonClass}
          disabled={!canEndTurn}
          onClick={() => dispatch({ type: "END_TURN" })}
        >
          End Turn
        </button>
        <button className={controlSecondaryButtonClass} onClick={onOpenAssets}>
          View Assets
        </button>
        <button
          className={controlSecondaryButtonClass}
          disabled={!canManageBuildings}
          onClick={onOpenBuildings}
        >
          Manage Buildings
        </button>
      </div>

      <button
        className={`${controlSecondaryButtonClass} mt-3`}
        onClick={() => dispatch({ type: "RESET_GAME" })}
      >
        Reset Game
      </button>
    </section>
  );
}
