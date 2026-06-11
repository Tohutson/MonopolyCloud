import { GameState } from "../../types/game";
import { PASS_GO_REWARD } from "../rules/constants";

export function completeMoveAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.turnPhase !== "MOVING") {
    return state;
  }

  const pendingRoll = state.pendingRoll;

  if (!pendingRoll) {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.id !== pendingRoll.playerId) {
    return state;
  }

  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      position: pendingRoll.finalPosition,
      cash: pendingRoll.passedStart ? player.cash + PASS_GO_REWARD : player.cash,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    pendingRoll: null,
    turnPhase: "RESOLVE_SQUARE",
  };
}
