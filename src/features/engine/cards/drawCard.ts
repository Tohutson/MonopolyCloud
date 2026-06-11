import { Card } from "@/features/types/cards";

export function drawCard(deck: Card[]): { card: Card; newDeck: Card[] } {
  if (deck.length === 0) {
    throw new Error("Cannot draw from an empty deck.");
  }

  const [card, ...remainingDeck] = deck;

  return {
    card,
    newDeck: [...remainingDeck, card],
  };
}
