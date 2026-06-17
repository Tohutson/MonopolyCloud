import { GameState } from "../../types/game";
import { addLog } from "../rules/logging";
import { getPropertyOwnerId } from "../rules/ownership";
import { createAuctionState } from "./auctionActions";

export function declinePropertyAction(
  state: GameState,
  propertyId: string,
): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.turnPhase !== "PROPERTY_DECISION") {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.status !== "ACTIVE") {
    return state;
  }

  const currentSquare = state.board[currentPlayer.position];

  if (currentSquare.type !== "PROPERTY") {
    return state;
  }

  if (currentSquare.id !== propertyId) {
    return state;
  }

  if (getPropertyOwnerId(state, currentSquare.id)) {
    return state;
  }

  const auctionState = createAuctionState(
    state,
    currentSquare.id,
    currentPlayer.id,
  );

  if (!auctionState) {
    return {
      ...state,
      turnPhase: "OPTIONAL_ACTIONS",
      log: addLog(
        state,
        `Auction ended for ${currentSquare.name} with no bids.`,
      ),
    };
  }

  return {
    ...state,
    turnPhase: "AUCTION",
    auctionState,
    log: addLog(
      state,
      `${currentPlayer.name} declined ${currentSquare.name}. Auction will start.`,
    ),
  };
}
