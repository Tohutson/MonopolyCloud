import { GameState } from "../../types/game";
import { addLog } from "../rules/logging";

export function startGameAction(state: GameState): GameState {
  if (state.status === "FINISHED") {
    return state;
  }

  return {
    ...state,
    status: "ACTIVE",
    log: addLog(state, "Game started."),
  };
}
