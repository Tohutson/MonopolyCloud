export type CardEffectType =
  | "GAIN_MONEY"
  | "LOSE_MONEY"
  | "MOVE_TO_POSITION"
  | "GO_TO_JAIL";

export interface CardEffect {
  id: string;
  message: string;
  type: CardEffectType;
  amount?: number;
  position?: number;
}
