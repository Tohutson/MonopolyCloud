import { GameState } from "../../types/game";
import { addLog } from "./logging";

export function chargeCurrentPlayer(
  state: GameState,
  amount: number,
  message: string,
): GameState {
  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      cash: player.cash - amount,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(state, message),
  };
}
