import { addLog } from "./logging";
import { GameState } from "@/features/types/game";

export function checkWinCondition(state: GameState): GameState {
  const updatedPlayers = state.players.map((player) => {
    if (player.cash < 0) {
      return {
        ...player,
        status: "BANKRUPT" as const,
      };
    }
    return player;
  });

  const activePlayers = updatedPlayers.filter(
    (player) => player.status === "ACTIVE",
  );

  if (activePlayers.length === 1) {
    const winner = activePlayers[0];
    return {
      ...state,
      players: updatedPlayers,
      status: "FINISHED",
      winnerId: winner.id,
      log: addLog(state, `${winner.name} wins the game!`),
    };
  }

  return {
    ...state,
    players: updatedPlayers,
  };
}
