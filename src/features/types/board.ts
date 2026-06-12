export type SquareType =
  | "START"
  | "PROPERTY"
  | "TAX"
  | "CHANCE"
  | "COMMUNITY_CHEST"
  | "JAIL"
  | "GO_TO_JAIL"
  | "FREE_PARKING";

export interface BaseBoardSquare {
  id: string;
  index: number;
  name: string;
}

export interface NonPropertySquare extends BaseBoardSquare {
  type: Exclude<SquareType, "PROPERTY">;
}

export interface PropertySquare extends BaseBoardSquare {
  type: "PROPERTY";
  price: number;
  rent: number;
  rentTiers?: {
    base: number;
    oneHouse: number;
    twoHouses: number;
    threeHouses: number;
    fourHouses: number;
    hotel: number;
  };
  buildingCost?: number;
  colorGroup: string;
}

export type BoardSquare = NonPropertySquare | PropertySquare;
