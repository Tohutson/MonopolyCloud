import { GameState } from "../../types/game";
import { addLog } from "../rules/logging";

export function endTurnAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.turnPhase !== "OPTIONAL_ACTIONS") {
    return state;
  }

  if (state.pendingRoll) {
    return state;
  }

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    currentPlayerIndex: nextPlayerIndex,
    turnPhase: "ROLL_READY",
    lastDiceRoll: null,
    pendingRoll: null,
    rolledDoublesCount: 0,
    log: addLog(
      state,
      `${state.players[nextPlayerIndex].name}'s turn started.`,
    ),
  };
}
