import { GameState } from "@/features/types/game";
import { JAIL_FINE, JAIL_POSITION } from "./constants";
import { addLog } from "./logging";

export function sendCurrentPlayerToJail(
  state: GameState,
  message?: string,
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];

  return {
    ...state,
    players: state.players.map((player, index) =>
      index === state.currentPlayerIndex
        ? {
            ...player,
            position: JAIL_POSITION,
            jailState: {
              ...player.jailState,
              isInJail: true,
              turnsAttempted: 0,
            },
          }
        : player,
    ),
    log: addLog(state, message ?? `${currentPlayer.name} is sent to jail!`),
  };
}

export function releaseCurrentPlayerFromJail(state: GameState): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];

  return {
    ...state,
    players: state.players.map((player, index) =>
      index === state.currentPlayerIndex
        ? {
            ...player,
            jailState: {
              ...player.jailState,
              isInJail: false,
              turnsAttempted: 0,
            },
          }
        : player,
    ),
    log: addLog(state, `${currentPlayer.name} is released from jail!`),
  };
}

export function currentPlayerCanPayJailFine(state: GameState): boolean {
  const currentPlayer = state.players[state.currentPlayerIndex];
  return currentPlayer.cash >= JAIL_FINE;
}
