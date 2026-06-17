import { GameState } from "../../types/game";
import { checkWinCondition } from "../rules/winConditions";
import { resolveLandedSquare } from "../rules/squareResolution";
import { getPropertyOwnerId } from "../rules/ownership";

export function resolveSquareAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.turnPhase !== "RESOLVE_SQUARE") {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.status !== "ACTIVE") {
    return state;
  }

  const resolvedState = resolveLandedSquare(state);
  const checkedState = checkWinCondition(resolvedState);

  if (checkedState.status === "FINISHED") {
    return checkedState;
  }

  return {
    ...checkedState,
    turnPhase: needsPropertyDecision(checkedState)
      ? "PROPERTY_DECISION"
      : "OPTIONAL_ACTIONS",
  };
}

function needsPropertyDecision(state: GameState): boolean {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const currentSquare = state.board[currentPlayer.position];

  return (
    currentSquare.type === "PROPERTY" &&
    !getPropertyOwnerId(state, currentSquare.id)
  );
}
