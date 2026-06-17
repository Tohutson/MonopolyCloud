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

  const nextPlayerIndex = getNextActivePlayerIndex(state);

  if (nextPlayerIndex === null) {
    return state;
  }

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

function getNextActivePlayerIndex(state: GameState): number | null {
  for (let offset = 1; offset <= state.players.length; offset += 1) {
    const playerIndex = (state.currentPlayerIndex + offset) % state.players.length;

    if (state.players[playerIndex].status === "ACTIVE") {
      return playerIndex;
    }
  }

  return null;
}
