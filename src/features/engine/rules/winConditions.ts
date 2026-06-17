import { addLog } from "./logging";
import { GameState } from "@/features/types/game";

export function checkWinCondition(state: GameState): GameState {
  if (state.status === "FINISHED") {
    return state;
  }

  const activePlayers = state.players.filter(
    (player) => player.status === "ACTIVE",
  );

  if (activePlayers.length === 1) {
    const winner = activePlayers[0];
    return {
      ...state,
      status: "FINISHED",
      winnerId: winner.id,
      log: addLog(state, `${winner.name} wins the game!`),
    };
  }

  return {
    ...state,
  };
}
