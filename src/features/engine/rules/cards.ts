import { CardEffect } from "@/features/types/card";
import { GameState } from "@/features/types/game";
import {
  chargeCurrentPlayer,
  payCurrentPlayer,
} from "@/features/engine/rules/payments";
import { JAIL_POSITION } from "./constants";
import { moveCurrentPlayerToPosition } from "@/features/engine/rules/movement";

const chanceCards: CardEffect[] = [
  {
    id: "chance-1",
    message: "You have won a prize of $50!",
    type: "GAIN_MONEY",
    amount: 50,
  },
  {
    id: "chance-2",
    message: "You have to pay a fine of $25.",
    type: "LOSE_MONEY",
    amount: 25,
  },
  {
    id: "chance-3",
    message: "You are moved to Go.",
    type: "MOVE_TO_POSITION",
    position: 0,
  },
  {
    id: "chance-4",
    message: "You are sent to jail.",
    type: "GO_TO_JAIL",
  },
];

const communityChestCards: CardEffect[] = [
  {
    id: "community-chest-1",
    message: "You have won a prize of $100!",
    type: "GAIN_MONEY",
    amount: 100,
  },
  {
    id: "community-chest-2",
    message: "You have to pay a fine of $50.",
    type: "LOSE_MONEY",
    amount: 50,
  },
  {
    id: "community-chest-3",
    message: "You are moved to Go.",
    type: "MOVE_TO_POSITION",
    position: 0,
  },
];

function drawRandomCard(cards: CardEffect[]): CardEffect {
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
}

export function applyChanceCard(state: GameState): GameState {
  const card = drawRandomCard(chanceCards);
  return applyCardEffect(state, card);
}

export function applyCommunityChestCard(state: GameState): GameState {
  const card = drawRandomCard(communityChestCards);
  return applyCardEffect(state, card);
}

export function applyCardEffect(state: GameState, card: CardEffect): GameState {
  switch (card.type) {
    case "GAIN_MONEY": {
      return payCurrentPlayer(
        state,
        card.amount || 0,
        `${state.players[state.currentPlayerIndex].name} drew a card: ${card.message}`,
      );
    }

    case "LOSE_MONEY":
      return chargeCurrentPlayer(
        state,
        card.amount || 0,
        `${state.players[state.currentPlayerIndex].name} drew a card: ${card.message}`,
      );
    case "MOVE_TO_POSITION":
      return moveCurrentPlayerToPosition(
        state,
        card.position || 0,
        `${state.players[state.currentPlayerIndex].name} drew a card: ${card.message}`,
      );

    case "GO_TO_JAIL":
      return moveCurrentPlayerToPosition(
        state,
        JAIL_POSITION,
        `${state.players[state.currentPlayerIndex].name} drew a card: ${card.message}`,
      );

    default:
      return state;
  }
}
