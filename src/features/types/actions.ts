export type GameAction =
  | { type: "START_GAME" }
  | { type: "ROLL_DICE" }
  | { type: "COMPLETE_MOVE" }
  | { type: "RESOLVE_SQUARE" }
  | { type: "BUY_PROPERTY"; propertyId: string }
  | { type: "DECLINE_PROPERTY"; propertyId: string }
  | { type: "PLACE_AUCTION_BID"; bidderId: string; amount: number }
  | { type: "PASS_AUCTION_BID"; bidderId: string }
  | { type: "END_TURN" }
  | { type: "PAY_TO_LEAVE_JAIL" }
  | { type: "USE_JAIL_CARD" }
  | { type: "ROLL_FOR_JAIL_RELEASE" }
  | { type: "RESET_GAME" };
