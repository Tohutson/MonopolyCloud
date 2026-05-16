import { GameState } from "../../types/game";
import { addLog } from "../rules/logging";

export function endTurnAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (!state.hasRolledThisTurn) {
    return state;
  }

  if (state.pendingRoll) {
    return state;
  }

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    currentPlayerIndex: nextPlayerIndex,
    hasRolledThisTurn: false,
    lastDiceRoll: null,
    log: addLog(state, `${state.players[nextPlayerIndex].name}'s turn started.`),
  };
}
