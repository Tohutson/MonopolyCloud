import { GameState } from "../../types/game";
import { addLog } from "../rules/logging";
import { getPropertyOwnerId } from "../rules/ownership";

export function buyPropertyAction(
  state: GameState,
  propertyId: string,
): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const currentSquare = state.board[currentPlayer.position];

  if (currentSquare.type !== "PROPERTY") {
    return state;
  }

  if (currentSquare.id !== propertyId) {
    return state;
  }

  const ownerId = getPropertyOwnerId(state, currentSquare.id);

  if (ownerId) {
    return {
      ...state,
      log: addLog(state, `${currentSquare.name} is already owned.`),
    };
  }

  if (currentPlayer.cash < currentSquare.price) {
    return {
      ...state,
      log: addLog(
        state,
        `${currentPlayer.name} cannot afford ${currentSquare.name}.`,
      ),
    };
  }

  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      cash: player.cash - currentSquare.price,
    };
  });

  const updatedOwnedProperties = [
    ...state.ownedProperties,
    {
      propertyId,
      ownerId: currentPlayer.id,
    },
  ];

  const updatedLog = addLog(
    state,
    `${currentPlayer.name} bought ${currentSquare.name} for $${currentSquare.price}.`,
  );

  return {
    ...state,
    players: updatedPlayers,
    ownedProperties: updatedOwnedProperties,
    log: updatedLog,
  };
}
