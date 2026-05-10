import { GameState } from "../../types/game";

export function getPropertyOwnerId(
  state: GameState,
  propertyId: string,
): string | null {
  const ownedProperty = state.ownedProperties.find(
    (property) => property.propertyId === propertyId,
  );

  return ownedProperty?.ownerId ?? null;
}
