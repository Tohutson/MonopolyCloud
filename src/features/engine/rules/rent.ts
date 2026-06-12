import { GameState } from "@/features/types/game";
import { PropertySquare } from "@/features/types/board";
import {
  getOwnedPropertyRecord,
  hasMortgageInColorGroup,
  isColorProperty,
  ownsFullColorGroup,
} from "./improvements";

export function calculateRentForProperty(
  state: GameState,
  property: PropertySquare,
  ownerId: string,
): number {
  const ownedProperty = getOwnedPropertyRecord(state, property.id);
  if (ownedProperty?.mortgaged) {
    return 0;
  }

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

  if (isColorProperty(property)) {
    if (ownedProperty?.hotel) {
      return property.rentTiers.hotel;
    }

    switch (ownedProperty?.houses ?? 0) {
      case 1:
        return property.rentTiers.oneHouse;
      case 2:
        return property.rentTiers.twoHouses;
      case 3:
        return property.rentTiers.threeHouses;
      case 4:
        return property.rentTiers.fourHouses;
      default:
        return ownsFullColorGroup(state, ownerId, property.colorGroup) &&
          !hasMortgageInColorGroup(state, property.colorGroup)
          ? property.rentTiers.base * 2
          : property.rentTiers.base;
    }
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
