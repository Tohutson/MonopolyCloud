import { GameState } from "../../types/game";
import { addLog } from "./logging";
import { resolveDebt } from "./bankruptcy";

export function chargeCurrentPlayer(
  state: GameState,
  amount: number,
  message: string,
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];

  return resolveDebt(state, currentPlayer.id, amount, { type: "BANK" }, message);
}

export function payCurrentPlayer(
  state: GameState,
  amount: number,
  message: string,
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.status !== "ACTIVE") {
    return state;
  }

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
  return resolveDebt(
    state,
    payerId,
    amount,
    { type: "PLAYER", playerId: ownerId },
    `${payerName} paid $${amount} rent to ${ownerName} for ${propertyName}.`,
  );
}
