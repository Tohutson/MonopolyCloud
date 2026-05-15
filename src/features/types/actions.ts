export type GameAction =
  | { type: "START_GAME" }
  | { type: "ROLL_DICE" }
  | { type: "BUY_PROPERTY"; propertyId: string }
  | { type: "END_TURN" }
  | { type: "PAY_TO_LEAVE_JAIL" }
  | { type: "USE_JAIL_CARD" }
  | { type: "ROLL_FOR_JAIL_RELEASE" }
  | { type: "RESET_GAME" };
