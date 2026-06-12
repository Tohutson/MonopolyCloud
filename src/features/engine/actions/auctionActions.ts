import { PropertySquare } from "@/features/types/board";
import { AuctionState, GameState } from "@/features/types/game";
import { addLog } from "../rules/logging";
import { getPropertyOwnerId } from "../rules/ownership";

export function createAuctionState(
  state: GameState,
  propertyId: string,
  declinedByPlayerId: string,
): AuctionState | null {
  const firstBidderId =
    getActivePlayerIds(state).find((playerId) => playerId === declinedByPlayerId) ??
    getActivePlayerIds(state)[0];

  if (!firstBidderId) {
    return null;
  }

  return {
    propertyId,
    currentBidderId: firstBidderId,
    topBidderId: null,
    topBid: 0,
    passedPlayerIds: [],
    declinedByPlayerId,
  };
}

export function placeAuctionBidAction(
  state: GameState,
  bidderId: string,
  amount: number,
): GameState {
  if (!canActInAuction(state, bidderId)) {
    return state;
  }

  const auctionState = state.auctionState;
  if (!auctionState) {
    return state;
  }

  const property = getAuctionProperty(state, auctionState.propertyId);
  const bidder = state.players.find((player) => player.id === bidderId);

  if (!property || !bidder) {
    return state;
  }

  if (getPropertyOwnerId(state, property.id)) {
    return state;
  }

  if (amount <= auctionState.topBid) {
    return state;
  }

  if (amount > bidder.cash) {
    return state;
  }

  const updatedAuctionState: AuctionState = {
    ...auctionState,
    topBidderId: bidderId,
    topBid: amount,
  };

  return advanceOrCompleteAuction(
    {
      ...state,
      auctionState: updatedAuctionState,
      log: addLog(state, `${bidder.name} bid $${amount} for ${property.name}.`),
    },
    bidderId,
  );
}

export function passAuctionBidAction(
  state: GameState,
  bidderId: string,
): GameState {
  if (!canActInAuction(state, bidderId)) {
    return state;
  }

  const auctionState = state.auctionState;
  if (!auctionState) {
    return state;
  }

  const property = getAuctionProperty(state, auctionState.propertyId);
  const bidder = state.players.find((player) => player.id === bidderId);

  if (!property || !bidder) {
    return state;
  }

  if (getPropertyOwnerId(state, property.id)) {
    return state;
  }

  const updatedAuctionState: AuctionState = {
    ...auctionState,
    passedPlayerIds: [...auctionState.passedPlayerIds, bidderId],
  };

  return advanceOrCompleteAuction(
    {
      ...state,
      auctionState: updatedAuctionState,
      log: addLog(state, `${bidder.name} passed on ${property.name}.`),
    },
    bidderId,
  );
}

function canActInAuction(state: GameState, bidderId: string): boolean {
  if (state.status !== "ACTIVE") {
    return false;
  }

  if (state.turnPhase !== "AUCTION") {
    return false;
  }

  const auctionState = state.auctionState;
  if (!auctionState) {
    return false;
  }

  if (auctionState.currentBidderId !== bidderId) {
    return false;
  }

  if (auctionState.passedPlayerIds.includes(bidderId)) {
    return false;
  }

  const bidder = state.players.find((player) => player.id === bidderId);

  return bidder?.status === "ACTIVE";
}

function advanceOrCompleteAuction(
  state: GameState,
  previousBidderId: string,
): GameState {
  const auctionState = state.auctionState;

  if (!auctionState) {
    return state;
  }

  const property = getAuctionProperty(state, auctionState.propertyId);

  if (!property) {
    return {
      ...state,
      auctionState: null,
      turnPhase: "OPTIONAL_ACTIONS",
    };
  }

  if (!auctionState.topBidderId) {
    const remainingBidderIds = getRemainingBidderIds(state, auctionState);

    if (remainingBidderIds.length === 0) {
      return completeAuctionWithNoBids(state, property);
    }

    return rotateAuctionBidder(state, previousBidderId, remainingBidderIds);
  }

  const challengerIds = getRemainingBidderIds(state, auctionState).filter(
    (playerId) => playerId !== auctionState.topBidderId,
  );

  if (challengerIds.length === 0) {
    return completeAuctionWithWinner(state, property, auctionState);
  }

  return rotateAuctionBidder(state, previousBidderId, challengerIds);
}

function rotateAuctionBidder(
  state: GameState,
  previousBidderId: string,
  validBidderIds: string[],
): GameState {
  const auctionState = state.auctionState;

  if (!auctionState) {
    return state;
  }

  const nextBidderId =
    getNextPlayerId(state, previousBidderId, validBidderIds) ??
    validBidderIds[0];

  return {
    ...state,
    auctionState: {
      ...auctionState,
      currentBidderId: nextBidderId,
    },
  };
}

function completeAuctionWithNoBids(
  state: GameState,
  property: PropertySquare,
): GameState {
  return {
    ...state,
    auctionState: null,
    turnPhase: "OPTIONAL_ACTIONS",
    log: addLog(state, `Auction ended for ${property.name} with no bids.`),
  };
}

function completeAuctionWithWinner(
  state: GameState,
  property: PropertySquare,
  auctionState: AuctionState,
): GameState {
  const winner = state.players.find(
    (player) => player.id === auctionState.topBidderId,
  );

  if (!winner) {
    return state;
  }

  return {
    ...state,
    players: state.players.map((player) =>
      player.id === winner.id
        ? {
            ...player,
            cash: player.cash - auctionState.topBid,
          }
        : player,
    ),
    ownedProperties: [
      ...state.ownedProperties,
      {
        propertyId: property.id,
        ownerId: winner.id,
      },
    ],
    auctionState: null,
    turnPhase: "OPTIONAL_ACTIONS",
    log: addLog(
      state,
      `${winner.name} won ${property.name} at auction for $${auctionState.topBid}.`,
    ),
  };
}

function getAuctionProperty(
  state: GameState,
  propertyId: string,
): PropertySquare | null {
  const property = state.board.find((square) => square.id === propertyId);

  return property?.type === "PROPERTY" ? property : null;
}

function getRemainingBidderIds(
  state: GameState,
  auctionState: AuctionState,
): string[] {
  return getActivePlayerIds(state).filter(
    (playerId) => !auctionState.passedPlayerIds.includes(playerId),
  );
}

function getActivePlayerIds(state: GameState): string[] {
  return state.players
    .filter((player) => player.status === "ACTIVE")
    .map((player) => player.id);
}

function getNextPlayerId(
  state: GameState,
  currentPlayerId: string,
  validPlayerIds: string[],
): string | null {
  const startIndex = state.players.findIndex(
    (player) => player.id === currentPlayerId,
  );

  if (startIndex < 0) {
    return validPlayerIds[0] ?? null;
  }

  for (let offset = 1; offset <= state.players.length; offset += 1) {
    const player = state.players[(startIndex + offset) % state.players.length];

    if (validPlayerIds.includes(player.id)) {
      return player.id;
    }
  }

  return null;
}
