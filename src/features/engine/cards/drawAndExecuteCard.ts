import { DeckType } from "@/features/types/cards";
import { GameState } from "@/features/types/game";
import { drawCard } from "./drawCard";
import { executeCard } from "./executeCard";

export function drawAndExecuteCard(
  state: GameState,
  deckType: DeckType,
): GameState {
  const deck =
    deckType === "chance" ? state.chanceDeck : state.communityChestDeck;
  const { card, newDeck } = drawCard(deck);
  const stateWithRotatedDeck =
    deckType === "chance"
      ? { ...state, chanceDeck: newDeck }
      : { ...state, communityChestDeck: newDeck };

  return executeCard(stateWithRotatedDeck, card);
}
