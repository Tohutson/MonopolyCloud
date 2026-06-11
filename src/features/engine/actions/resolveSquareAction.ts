import { GameState } from "../../types/game";
import { checkWinCondition } from "../rules/winConditions";
import { resolveLandedSquare } from "../rules/squareResolution";

export function resolveSquareAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.turnPhase !== "RESOLVE_SQUARE") {
    return state;
  }

  const resolvedState = resolveLandedSquare(state);
  const checkedState = checkWinCondition(resolvedState);

  return {
    ...checkedState,
    turnPhase: "OPTIONAL_ACTIONS",
  };
}
