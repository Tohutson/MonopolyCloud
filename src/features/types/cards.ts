export type DeckType = "chance" | "community";

export type AdvanceTarget = "utility" | "railroad";

export type CardType =
  | "MOVE_TO"
  | "MOVE_RELATIVE"
  | "PAY"
  | "RECEIVE"
  | "PAY_EACH_PLAYER"
  | "RECEIVE_EACH_PLAYER"
  | "RECEIVE_FROM_BANK"
  | "GO_TO_JAIL"
  | "GET_OUT_OF_JAIL_FREE"
  | "ADVANCE_TO_NEAREST"
  | "REPAIRS";

export interface Card {
  id: string;
  deck: DeckType;
  description: string;
  type: CardType;
  amount?: number;
  position?: number;
  relative?: number;
  target?: AdvanceTarget;
  houseAmount?: number;
  hotelAmount?: number;
}
