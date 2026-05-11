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

export function payCurrentPlayer(
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
      cash: player.cash + amount,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(state, message),
  };
}

export function payRent(
  state: GameState,
  payerId: string,
  ownerId: string,
  payerName: string,
  ownerName: string,
  amount: number,
  propertyName: string,
): GameState {
  const updatedPlayers = state.players.map((player) => {
    if (player.id === payerId) {
      return {
        ...player,
        cash: player.cash - amount,
      };
    }

    if (player.id === ownerId) {
      return {
        ...player,
        cash: player.cash + amount,
      };
    }

    return player;
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(
      state,
      `${payerName} paid $${amount} rent to ${ownerName} for ${propertyName}.`,
    ),
  };
}
