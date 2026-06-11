import { describe, expect, it } from "vitest";
import { Card } from "../../types/cards";
import { drawAndExecuteCard } from "../cards/drawAndExecuteCard";
import { drawCard } from "../cards/drawCard";
import { executeCard, findNearest } from "../cards/executeCard";
import { createChanceDeck, createCommunityChestDeck } from "../cards/createDecks";
import { JAIL_POSITION } from "../rules/constants";
import {
  createActiveGameForTest,
  setCurrentPlayerIndex,
  setCurrentPlayerPosition,
} from "./testUtils";

describe("card decks", () => {
  it("creates full Chance and Community Chest decks", () => {
    expect(createChanceDeck()).toHaveLength(16);
    expect(createCommunityChestDeck()).toHaveLength(16);
  });

  it("draws the top card and rotates it to the bottom", () => {
    const deck = createChanceDeck();
    const { card, newDeck } = drawCard(deck);

    expect(card).toBe(deck[0]);
    expect(newDeck).toHaveLength(deck.length);
    expect(newDeck.at(-1)).toBe(card);
    expect(newDeck[0]).toBe(deck[1]);
  });
});

describe("executeCard", () => {
  it("moves to a position and collects the pass-Go reward when wrapping", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 36);
    const card: Card = {
      id: "test-move-to",
      deck: "chance",
      description: "Advance to St. Charles Place.",
      type: "MOVE_TO",
      position: 11,
    };

    const nextState = executeCard(state, card);

    expect(nextState.players[0].position).toBe(11);
    expect(nextState.players[0].cash).toBe(1700);
    expect(nextState.log[0].message).toBe(
      "Player 1 drew a card: Advance to St. Charles Place.",
    );
  });

  it("moves backward without collecting the pass-Go reward", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 2);
    const card: Card = {
      id: "test-back-three",
      deck: "chance",
      description: "Go back 3 spaces.",
      type: "MOVE_RELATIVE",
      relative: -3,
    };

    const nextState = executeCard(state, card);

    expect(nextState.players[0].position).toBe(39);
    expect(nextState.players[0].cash).toBe(1500);
  });

  it("pays each other player", () => {
    const card: Card = {
      id: "test-pay-each",
      deck: "chance",
      description: "Pay each player $50.",
      type: "PAY_EACH_PLAYER",
      amount: 50,
    };

    const nextState = executeCard(createActiveGameForTest(), card);

    expect(nextState.players[0].cash).toBe(1450);
    expect(nextState.players[1].cash).toBe(1550);
  });

  it("receives from each other player", () => {
    const card: Card = {
      id: "test-receive-each",
      deck: "community",
      description: "Collect $10 from every player.",
      type: "RECEIVE_EACH_PLAYER",
      amount: 10,
    };

    const nextState = executeCard(createActiveGameForTest(), card);

    expect(nextState.players[0].cash).toBe(1510);
    expect(nextState.players[1].cash).toBe(1490);
  });

  it("sends the current player to jail", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 36);
    const card: Card = {
      id: "test-go-to-jail",
      deck: "chance",
      description: "Go directly to Jail.",
      type: "GO_TO_JAIL",
    };

    const nextState = executeCard(state, card);

    expect(nextState.players[0].position).toBe(JAIL_POSITION);
    expect(nextState.players[0].jailState.isInJail).toBe(true);
    expect(nextState.players[0].jailState.turnsAttempted).toBe(0);
  });

  it("adds a Get Out of Jail Free card to the current player", () => {
    const card: Card = {
      id: "test-jail-card",
      deck: "community",
      description: "Get Out of Jail Free.",
      type: "GET_OUT_OF_JAIL_FREE",
    };

    const nextState = executeCard(createActiveGameForTest(), card);

    expect(nextState.players[0].getOutOfJailCards).toBe(1);
    expect(nextState.players[0].jailState.isInJail).toBe(false);
    expect(nextState.log[0].message).toBe(
      "Player 1 drew a card: Get Out of Jail Free. Player 1 kept it for later.",
    );
  });

  it("finds the nearest utility and railroad from the current position", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 22);

    expect(findNearest(state, "utility").index).toBe(28);
    expect(findNearest(state, "railroad").index).toBe(25);
  });
});

describe("drawAndExecuteCard", () => {
  it("draws, executes, and rotates a Chance card", () => {
    const state = {
      ...setCurrentPlayerPosition(createActiveGameForTest(), 7),
      chanceDeck: [
        {
          id: "test-chance-receive",
          deck: "chance",
          description: "Bank pays you dividend of $50.",
          type: "RECEIVE_FROM_BANK",
          amount: 50,
        } satisfies Card,
        ...createChanceDeck(),
      ],
    };

    const nextState = drawAndExecuteCard(state, "chance");

    expect(nextState.players[0].cash).toBe(1550);
    expect(nextState.chanceDeck.at(-1)?.id).toBe("test-chance-receive");
  });

  it("draws from the active player's Community Chest deck state", () => {
    const state = {
      ...setCurrentPlayerIndex(createActiveGameForTest(), 1),
      communityChestDeck: [
        {
          id: "test-community-pay",
          deck: "community",
          description: "Doctor's fees. Pay $50.",
          type: "PAY",
          amount: 50,
        } satisfies Card,
        ...createCommunityChestDeck(),
      ],
    };

    const nextState = drawAndExecuteCard(state, "community");

    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[1].cash).toBe(1450);
    expect(nextState.communityChestDeck.at(-1)?.id).toBe("test-community-pay");
  });
});
