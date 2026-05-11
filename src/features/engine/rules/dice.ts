import { DiceRoll } from "@/features/types/game";

export function rollTwoDice(): DiceRoll {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;

  return {
    die1,
    die2,
    total: die1 + die2,
  };
}
