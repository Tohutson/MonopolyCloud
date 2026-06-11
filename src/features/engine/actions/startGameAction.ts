import { GameState } from "../../types/game";
import { addLog } from "../rules/logging";

export function startGameAction(state: GameState): GameState {
  if (state.status === "FINISHED") {
    return state;
  }

  return {
    ...state,
    turnPhase: "ROLL_READY",
    status: "ACTIVE",
    rolledDoublesCount: 0,
    log: addLog(state, "Game started."),
  };
}
