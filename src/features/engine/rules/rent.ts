import { GameState } from "@/features/types/game";
import { PropertySquare } from "@/features/types/board";

export function calculateRentForProperty(
  state: GameState,
  property: PropertySquare,
  ownerId: string,
): number {
  if (property.colorGroup === "railroad") {
    const railroadCount = countOwnedPropertiesInGroup(
      state,
      ownerId,
      "railroad",
    );
    return property.rent * 2 ** Math.max(0, railroadCount - 1);
  }
  if (property.colorGroup === "utility") {
    const diceRoll = state.lastDiceRoll;
    if (!diceRoll) {
      return property.rent; // default rent if no dice roll info
    }
    const utilityCount = countOwnedPropertiesInGroup(state, ownerId, "utility");
    const multiplier = utilityCount === 1 ? 4 : 10;
    return diceRoll.total * multiplier;
  }
  return property.rent;
}

function countOwnedPropertiesInGroup(
  state: GameState,
  ownerId: string,
  colorGroup: string,
): number {
  const ownedPropertyIds = state.ownedProperties
    .filter((p) => p.ownerId === ownerId)
    .map((p) => p.propertyId);
  const ownedProperties = state.board.filter(
    (square): square is PropertySquare =>
      ownedPropertyIds.includes(square.id) && square.type === "PROPERTY",
  );
  return ownedProperties.filter((p) => p.colorGroup === colorGroup).length;
}
