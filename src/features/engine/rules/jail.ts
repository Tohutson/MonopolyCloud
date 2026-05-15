import { GameState } from "@/features/types/game";
import { JAIL_FINE, JAIL_POSITION } from "./constants";
import { moveCurrentPlayerToPosition } from "./movement";
import { addLog } from "./logging";

export function sendCurrentPlayerToJail(state: GameState): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const nextState = moveCurrentPlayerToPosition(
    state,
    JAIL_POSITION,
    `${currentPlayer.name} is moved to jail!`,
  );

  return {
    ...nextState,
    players: nextState.players.map((player, index) =>
      index === nextState.currentPlayerIndex
        ? {
            ...player,
            jailState: {
              ...player.jailState,
              isInJail: true,
              turnsAttempted: 0,
            },
          }
        : player,
    ),
    log: addLog(nextState, `${currentPlayer.name} is sent to jail!`),
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
