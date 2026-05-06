export type GameAction =
  | { type: "START_GAME" }
  | { type: "ROLL_DICE" }
  | { type: "BUY_PROPERTY"; propertyId: string }
  | { type: "END_TURN" }
  | { type: "RESET_GAME" };
