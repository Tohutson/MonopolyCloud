import { GameState, OwnedProperty } from "../../types/game";

export function getOwnedProperty(
  state: GameState,
  propertyId: string,
): OwnedProperty | null {
  return (
    state.ownedProperties.find(
      (property) => property.propertyId === propertyId,
    ) ?? null
  );
}

export function getPropertyOwnerId(
  state: GameState,
  propertyId: string,
): string | null {
  const ownedProperty = getOwnedProperty(state, propertyId);

  return ownedProperty?.ownerId ?? null;
}

export function isPropertyMortgaged(
  state: GameState,
  propertyId: string,
): boolean {
  const ownedProperty = getOwnedProperty(state, propertyId);

  return ownedProperty?.mortgaged ?? ownedProperty?.isMortgaged ?? false;
}

export function getOwnedPropertiesForPlayer(
  state: GameState,
  playerId: string,
): OwnedProperty[] {
  return state.ownedProperties.filter(
    (property) => property.ownerId === playerId,
  );
}

export function isPropertyOwnedByCurrentPlayer(
  state: GameState,
  propertyId: string,
): boolean {
  const currentPlayer = state.players[state.currentPlayerIndex];
  return getPropertyOwnerId(state, propertyId) === currentPlayer.id;
}
