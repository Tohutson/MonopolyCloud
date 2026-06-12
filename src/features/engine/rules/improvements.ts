import { PropertySquare } from "@/features/types/board";
import { GameState, OwnedProperty } from "@/features/types/game";
import { getPropertyOwnerId } from "./ownership";

export interface ImprovementCheck {
  allowed: boolean;
  reason?: string;
}

export interface NormalizedOwnedProperty {
  propertyId: string;
  ownerId: string;
  houses: number;
  hotel: boolean;
  mortgaged: boolean;
}

export function normalizeOwnedProperty(
  ownedProperty: OwnedProperty,
): NormalizedOwnedProperty {
  return {
    propertyId: ownedProperty.propertyId,
    ownerId: ownedProperty.ownerId,
    houses: ownedProperty.houses ?? 0,
    hotel: ownedProperty.hotel ?? false,
    mortgaged: ownedProperty.mortgaged ?? ownedProperty.isMortgaged ?? false,
  };
}

export function getOwnedPropertyRecord(
  state: GameState,
  propertyId: string,
): NormalizedOwnedProperty | null {
  const ownedProperty = state.ownedProperties.find(
    (property) => property.propertyId === propertyId,
  );

  return ownedProperty ? normalizeOwnedProperty(ownedProperty) : null;
}

export function isColorProperty(
  property: PropertySquare,
): property is PropertySquare & {
  rentTiers: NonNullable<PropertySquare["rentTiers"]>;
  buildingCost: number;
} {
  return Boolean(
    property.rentTiers &&
      property.buildingCost &&
      property.colorGroup !== "railroad" &&
      property.colorGroup !== "utility",
  );
}

export function getColorGroupProperties(
  state: GameState,
  color: string,
): PropertySquare[] {
  return state.board.filter(
    (square): square is PropertySquare =>
      square.type === "PROPERTY" &&
      square.colorGroup === color &&
      isColorProperty(square),
  );
}

export function ownsFullColorGroup(
  state: GameState,
  playerId: string,
  color: string,
): boolean {
  const properties = getColorGroupProperties(state, color);

  return (
    properties.length > 0 &&
    properties.every(
      (property) => getPropertyOwnerId(state, property.id) === playerId,
    )
  );
}

export function hasMortgageInColorGroup(
  state: GameState,
  color: string,
): boolean {
  return colorGroupHasMortgagedProperty(state, color);
}

export function colorGroupHasMortgagedProperty(
  state: GameState,
  color: string,
): boolean {
  return getColorGroupProperties(state, color).some(
    (property) => getOwnedPropertyRecord(state, property.id)?.mortgaged,
  );
}

export function hasImprovementInColorGroup(
  state: GameState,
  color: string,
): boolean {
  return colorGroupHasBuildings(state, color);
}

export function colorGroupHasBuildings(
  state: GameState,
  color: string,
): boolean {
  return getColorGroupProperties(state, color).some((property) => {
    const ownedProperty = getOwnedPropertyRecord(state, property.id);
    return Boolean(
      ownedProperty &&
        (ownedProperty.houses > 0 || ownedProperty.hotel),
    );
  });
}

export function canBuildOnProperty(
  state: GameState,
  playerId: string,
  propertyId: string,
): ImprovementCheck {
  const property = getProperty(state, propertyId);
  if (!property || !isColorProperty(property)) {
    return { allowed: false, reason: "Only color properties can have buildings." };
  }

  const ownedProperty = getOwnedPropertyRecord(state, propertyId);
  if (!ownedProperty || ownedProperty.ownerId !== playerId) {
    return { allowed: false, reason: "Player does not own this property." };
  }

  if (!ownsFullColorGroup(state, playerId, property.colorGroup)) {
    return { allowed: false, reason: "Full color group is required." };
  }

  if (colorGroupHasMortgagedProperty(state, property.colorGroup)) {
    return { allowed: false, reason: "A property in this group is mortgaged." };
  }

  return { allowed: true };
}

export function canBuildHouse(
  state: GameState,
  playerId: string,
  propertyId: string,
): ImprovementCheck {
  const property = getProperty(state, propertyId);
  if (!property || !isColorProperty(property)) {
    return { allowed: false, reason: "Only color properties can have houses." };
  }

  const ownedProperty = getOwnedPropertyRecord(state, propertyId);
  if (!ownedProperty || ownedProperty.ownerId !== playerId) {
    return { allowed: false, reason: "Player does not own this property." };
  }

  if (!ownsFullColorGroup(state, playerId, property.colorGroup)) {
    return { allowed: false, reason: "Full color group is required." };
  }

  if (hasMortgageInColorGroup(state, property.colorGroup)) {
    return { allowed: false, reason: "A property in this group is mortgaged." };
  }

  if (ownedProperty.hotel) {
    return { allowed: false, reason: "This property already has a hotel." };
  }

  if (ownedProperty.houses >= 4) {
    return { allowed: false, reason: "This property already has four houses." };
  }

  const groupProperties = getColorGroupProperties(
    state,
    property.colorGroup,
  ).filter((groupProperty) => {
    const groupOwnedProperty = getOwnedPropertyRecord(state, groupProperty.id);
    return !groupOwnedProperty?.hotel;
  });
  const minimumHouses = Math.min(
    ...groupProperties.map(
      (groupProperty) =>
        getOwnedPropertyRecord(state, groupProperty.id)?.houses ?? 0,
    ),
  );

  if (ownedProperty.houses !== minimumHouses) {
    return { allowed: false, reason: "Houses must be built evenly." };
  }

  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player || player.cash < property.buildingCost) {
    return { allowed: false, reason: "Player does not have enough cash." };
  }

  return { allowed: true };
}

export function canBuildHotel(
  state: GameState,
  playerId: string,
  propertyId: string,
): ImprovementCheck {
  const property = getProperty(state, propertyId);
  if (!property || !isColorProperty(property)) {
    return { allowed: false, reason: "Only color properties can have hotels." };
  }

  const ownedProperty = getOwnedPropertyRecord(state, propertyId);
  if (!ownedProperty || ownedProperty.ownerId !== playerId) {
    return { allowed: false, reason: "Player does not own this property." };
  }

  if (!ownsFullColorGroup(state, playerId, property.colorGroup)) {
    return { allowed: false, reason: "Full color group is required." };
  }

  if (hasMortgageInColorGroup(state, property.colorGroup)) {
    return { allowed: false, reason: "A property in this group is mortgaged." };
  }

  if (ownedProperty.hotel) {
    return { allowed: false, reason: "This property already has a hotel." };
  }

  if (ownedProperty.houses !== 4) {
    return { allowed: false, reason: "Four houses are required first." };
  }

  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player || player.cash < property.buildingCost) {
    return { allowed: false, reason: "Player does not have enough cash." };
  }

  return { allowed: true };
}

export function canSellHouse(
  state: GameState,
  playerId: string,
  propertyId: string,
): ImprovementCheck {
  const property = getProperty(state, propertyId);
  if (!property || !isColorProperty(property)) {
    return { allowed: false, reason: "Only color properties can have houses." };
  }

  const ownedProperty = getOwnedPropertyRecord(state, propertyId);
  if (!ownedProperty || ownedProperty.ownerId !== playerId) {
    return { allowed: false, reason: "Player does not own this property." };
  }

  if (ownedProperty.hotel) {
    return { allowed: false, reason: "Sell the hotel before selling houses." };
  }

  if (ownedProperty.houses < 1) {
    return { allowed: false, reason: "This property has no houses." };
  }

  const groupProperties = getColorGroupProperties(
    state,
    property.colorGroup,
  ).filter((groupProperty) => {
    const groupOwnedProperty = getOwnedPropertyRecord(state, groupProperty.id);
    return !groupOwnedProperty?.hotel;
  });
  const maximumHouses = Math.max(
    ...groupProperties.map(
      (groupProperty) =>
        getOwnedPropertyRecord(state, groupProperty.id)?.houses ?? 0,
    ),
  );

  if (ownedProperty.houses !== maximumHouses) {
    return { allowed: false, reason: "Houses must be sold evenly." };
  }

  return { allowed: true };
}

export function canSellHotel(
  state: GameState,
  playerId: string,
  propertyId: string,
): ImprovementCheck {
  const property = getProperty(state, propertyId);
  if (!property || !isColorProperty(property)) {
    return { allowed: false, reason: "Only color properties can have hotels." };
  }

  const ownedProperty = getOwnedPropertyRecord(state, propertyId);
  if (!ownedProperty || ownedProperty.ownerId !== playerId) {
    return { allowed: false, reason: "Player does not own this property." };
  }

  if (!ownedProperty.hotel) {
    return { allowed: false, reason: "This property has no hotel." };
  }

  return { allowed: true };
}

export function canMortgageProperty(
  state: GameState,
  playerId: string,
  propertyId: string,
): ImprovementCheck {
  const property = getProperty(state, propertyId);
  if (!property) {
    return { allowed: false, reason: "Property does not exist." };
  }

  const ownedProperty = getOwnedPropertyRecord(state, propertyId);
  if (!ownedProperty || ownedProperty.ownerId !== playerId) {
    return { allowed: false, reason: "Player does not own this property." };
  }

  if (ownedProperty.mortgaged) {
    return { allowed: false, reason: "This property is already mortgaged." };
  }

  if (
    isColorProperty(property) &&
    hasImprovementInColorGroup(state, property.colorGroup)
  ) {
    return {
      allowed: false,
      reason: "Sell all buildings in this color group first.",
    };
  }

  return { allowed: true };
}

export function canUnmortgageProperty(
  state: GameState,
  playerId: string,
  propertyId: string,
): ImprovementCheck {
  const property = getProperty(state, propertyId);
  if (!property) {
    return { allowed: false, reason: "Property does not exist." };
  }

  const ownedProperty = getOwnedPropertyRecord(state, propertyId);
  if (!ownedProperty || ownedProperty.ownerId !== playerId) {
    return { allowed: false, reason: "Player does not own this property." };
  }

  if (!ownedProperty.mortgaged) {
    return { allowed: false, reason: "This property is not mortgaged." };
  }

  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player || player.cash < getUnmortgageCost(property)) {
    return { allowed: false, reason: "Player does not have enough cash." };
  }

  return { allowed: true };
}

export function getMortgageValue(property: PropertySquare): number {
  return property.mortgageValue;
}

export function getUnmortgageCost(property: PropertySquare): number {
  return Math.round(getMortgageValue(property) * 1.1);
}

export function getMortgageValueForProperty(
  state: GameState,
  propertyId: string,
): number | null {
  const property = getProperty(state, propertyId);

  return property ? getMortgageValue(property) : null;
}

export function getUnmortgageCostForProperty(
  state: GameState,
  propertyId: string,
): number | null {
  const property = getProperty(state, propertyId);

  return property ? getUnmortgageCost(property) : null;
}

export function getPlayerMortgageableProperties(
  state: GameState,
  playerId: string,
): NormalizedOwnedProperty[] {
  return getPlayerOwnedPropertyRecords(state, playerId).filter((ownedProperty) =>
    canMortgageProperty(state, playerId, ownedProperty.propertyId).allowed,
  );
}

export function getPlayerMortgagedProperties(
  state: GameState,
  playerId: string,
): NormalizedOwnedProperty[] {
  return getPlayerOwnedPropertyRecords(state, playerId).filter(
    (ownedProperty) => ownedProperty.mortgaged,
  );
}

export function getPlayerPotentialMortgageCash(
  state: GameState,
  playerId: string,
): number {
  return getPlayerMortgageableProperties(state, playerId).reduce(
    (total, ownedProperty) =>
      total + (getMortgageValueForProperty(state, ownedProperty.propertyId) ?? 0),
    0,
  );
}

export function canPlayerRaiseCashViaMortgages(
  state: GameState,
  playerId: string,
  amountNeeded: number,
): boolean {
  return getPlayerPotentialMortgageCash(state, playerId) >= amountNeeded;
}

function getPlayerOwnedPropertyRecords(
  state: GameState,
  playerId: string,
): NormalizedOwnedProperty[] {
  return state.ownedProperties
    .filter((ownedProperty) => ownedProperty.ownerId === playerId)
    .map(normalizeOwnedProperty);
}

function getProperty(
  state: GameState,
  propertyId: string,
): PropertySquare | null {
  const square = state.board.find((candidate) => candidate.id === propertyId);

  return square?.type === "PROPERTY" ? square : null;
}
