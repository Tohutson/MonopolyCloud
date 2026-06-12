import { PropertySquare } from "@/features/types/board";
import { GameState, OwnedProperty } from "@/features/types/game";
import { addLog } from "../rules/logging";
import {
  canBuildHotel,
  canBuildHouse,
  canMortgageProperty,
  canSellHotel,
  canSellHouse,
  canUnmortgageProperty,
  getMortgageValue,
  getUnmortgageCost,
  normalizeOwnedProperty,
} from "../rules/improvements";

export function buyHouseAction(
  state: GameState,
  propertyId: string,
): GameState {
  const currentPlayer = getCurrentPlayerForOptionalAction(state);
  const property = getProperty(state, propertyId);

  if (!currentPlayer || !property || !property.buildingCost) {
    return state;
  }

  if (!canBuildHouse(state, currentPlayer.id, propertyId).allowed) {
    return state;
  }

  return {
    ...state,
    players: updatePlayerCash(
      state,
      currentPlayer.id,
      -property.buildingCost,
    ),
    ownedProperties: updateOwnedProperty(state, propertyId, (ownedProperty) => ({
      ...ownedProperty,
      houses: ownedProperty.houses + 1,
      hotel: false,
    })),
    log: addLog(
      state,
      `${currentPlayer.name} bought a house on ${property.name} for $${property.buildingCost}.`,
    ),
  };
}

export function buyHotelAction(
  state: GameState,
  propertyId: string,
): GameState {
  const currentPlayer = getCurrentPlayerForOptionalAction(state);
  const property = getProperty(state, propertyId);

  if (!currentPlayer || !property || !property.buildingCost) {
    return state;
  }

  if (!canBuildHotel(state, currentPlayer.id, propertyId).allowed) {
    return state;
  }

  return {
    ...state,
    players: updatePlayerCash(
      state,
      currentPlayer.id,
      -property.buildingCost,
    ),
    ownedProperties: updateOwnedProperty(state, propertyId, (ownedProperty) => ({
      ...ownedProperty,
      houses: 0,
      hotel: true,
    })),
    log: addLog(
      state,
      `${currentPlayer.name} bought a hotel on ${property.name} for $${property.buildingCost}.`,
    ),
  };
}

export function sellHouseAction(
  state: GameState,
  propertyId: string,
): GameState {
  const currentPlayer = getCurrentPlayerForOptionalAction(state);
  const property = getProperty(state, propertyId);

  if (!currentPlayer || !property || !property.buildingCost) {
    return state;
  }

  if (!canSellHouse(state, currentPlayer.id, propertyId).allowed) {
    return state;
  }

  const saleValue = Math.floor(property.buildingCost / 2);

  return {
    ...state,
    players: updatePlayerCash(state, currentPlayer.id, saleValue),
    ownedProperties: updateOwnedProperty(state, propertyId, (ownedProperty) => ({
      ...ownedProperty,
      houses: ownedProperty.houses - 1,
    })),
    log: addLog(
      state,
      `${currentPlayer.name} sold a house on ${property.name} for $${saleValue}.`,
    ),
  };
}

export function sellHotelAction(
  state: GameState,
  propertyId: string,
): GameState {
  const currentPlayer = getCurrentPlayerForOptionalAction(state);
  const property = getProperty(state, propertyId);

  if (!currentPlayer || !property || !property.buildingCost) {
    return state;
  }

  if (!canSellHotel(state, currentPlayer.id, propertyId).allowed) {
    return state;
  }

  const saleValue = Math.floor(property.buildingCost / 2);

  return {
    ...state,
    players: updatePlayerCash(state, currentPlayer.id, saleValue),
    ownedProperties: updateOwnedProperty(state, propertyId, (ownedProperty) => ({
      ...ownedProperty,
      houses: 4,
      hotel: false,
    })),
    log: addLog(
      state,
      `${currentPlayer.name} sold a hotel on ${property.name} for $${saleValue}.`,
    ),
  };
}

export function mortgagePropertyAction(
  state: GameState,
  propertyId: string,
): GameState {
  const currentPlayer = getCurrentPlayerForOptionalAction(state);
  const property = getProperty(state, propertyId);

  if (!currentPlayer || !property) {
    return state;
  }

  if (!canMortgageProperty(state, currentPlayer.id, propertyId).allowed) {
    return state;
  }

  const mortgageValue = getMortgageValue(property);

  return {
    ...state,
    players: updatePlayerCash(state, currentPlayer.id, mortgageValue),
    ownedProperties: updateOwnedProperty(state, propertyId, (ownedProperty) => ({
      ...ownedProperty,
      isMortgaged: true,
    })),
    log: addLog(
      state,
      `${currentPlayer.name} mortgaged ${property.name} for $${mortgageValue}.`,
    ),
  };
}

export function unmortgagePropertyAction(
  state: GameState,
  propertyId: string,
): GameState {
  const currentPlayer = getCurrentPlayerForOptionalAction(state);
  const property = getProperty(state, propertyId);

  if (!currentPlayer || !property) {
    return state;
  }

  if (!canUnmortgageProperty(state, currentPlayer.id, propertyId).allowed) {
    return state;
  }

  const unmortgageCost = getUnmortgageCost(property);

  return {
    ...state,
    players: updatePlayerCash(state, currentPlayer.id, -unmortgageCost),
    ownedProperties: updateOwnedProperty(state, propertyId, (ownedProperty) => ({
      ...ownedProperty,
      isMortgaged: false,
    })),
    log: addLog(
      state,
      `${currentPlayer.name} unmortgaged ${property.name} for $${unmortgageCost}.`,
    ),
  };
}

function getCurrentPlayerForOptionalAction(state: GameState) {
  if (state.status !== "ACTIVE" || state.turnPhase !== "OPTIONAL_ACTIONS") {
    return null;
  }

  return state.players[state.currentPlayerIndex];
}

function updatePlayerCash(
  state: GameState,
  playerId: string,
  cashChange: number,
) {
  return state.players.map((player) =>
    player.id === playerId
      ? {
          ...player,
          cash: player.cash + cashChange,
        }
      : player,
  );
}

function updateOwnedProperty(
  state: GameState,
  propertyId: string,
  updater: (ownedProperty: Required<OwnedProperty>) => Required<OwnedProperty>,
) {
  return state.ownedProperties.map((ownedProperty) =>
    ownedProperty.propertyId === propertyId
      ? updater(normalizeOwnedProperty(ownedProperty))
      : ownedProperty,
  );
}

function getProperty(
  state: GameState,
  propertyId: string,
): PropertySquare | null {
  const square = state.board.find((candidate) => candidate.id === propertyId);

  return square?.type === "PROPERTY" ? square : null;
}
