import { describe, expect, it } from "vitest";
import { CardEffect } from "../../types/card";
import { JAIL_POSITION } from "../rules/constants";
import {
  applyCardEffect,
  applyChanceCard,
  applyCommunityChestCard,
} from "../rules/cards";
import {
  createActiveGameForTest,
  setCurrentPlayerPosition,
} from "./testUtils";

describe("card rules", () => {
  it("applies a GAIN_MONEY card to only the current player", () => {
    const state = createActiveGameForTest();
    const card: CardEffect = {
      id: "test-gain-money",
      message: "Bank error in your favor. Collect $50.",
      type: "GAIN_MONEY",
      amount: 50,
    };

    const nextState = applyCardEffect(state, card);

    expect(nextState.players[0].cash).toBe(1550);
    expect(nextState.players[1]).toEqual(state.players[1]);
    expect(nextState.log[0].message).toBe(
      "Player 1 drew a card: Bank error in your favor. Collect $50.",
    );
  });

  it("applies a LOSE_MONEY card to only the current player", () => {
    const state = createActiveGameForTest();
    const card: CardEffect = {
      id: "test-lose-money",
      message: "Doctor's fee. Pay $25.",
      type: "LOSE_MONEY",
      amount: 25,
    };

    const nextState = applyCardEffect(state, card);

    expect(nextState.players[0].cash).toBe(1475);
    expect(nextState.players[1]).toEqual(state.players[1]);
    expect(nextState.log[0].message).toBe(
      "Player 1 drew a card: Doctor's fee. Pay $25.",
    );
  });

  it("applies a MOVE_TO_POSITION card to only the current player", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 7);
    const card: CardEffect = {
      id: "test-move-to-position",
      message: "Advance to Go.",
      type: "MOVE_TO_POSITION",
      position: 0,
    };

    const nextState = applyCardEffect(state, card);

    expect(nextState.players[0].position).toBe(0);
    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[1]).toEqual(state.players[1]);
    expect(nextState.log[0].message).toBe(
      "Player 1 drew a card: Advance to Go.",
    );
  });

  it("applies a GO_TO_JAIL card to only the current player", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 36);
    const card: CardEffect = {
      id: "test-go-to-jail",
      message: "Go directly to Jail.",
      type: "GO_TO_JAIL",
    };

    const nextState = applyCardEffect(state, card);

    expect(nextState.players[0].position).toBe(JAIL_POSITION);
    expect(nextState.players[0].jailState.isInJail).toBe(true);
    expect(nextState.players[0].jailState.turnsAttempted).toBe(0);
    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[1]).toEqual(state.players[1]);
    expect(nextState.log[0].message).toBe(
      "Player 1 drew a card: Go directly to Jail.",
    );
  });

  it("applies a random Chance card without changing the player list", () => {
    const state = createActiveGameForTest();

    const nextState = applyChanceCard(state);

    expect(nextState.players).toHaveLength(state.players.length);
    expect(nextState.log).toHaveLength(state.log.length + 1);
    expect(nextState.log[0].message).toContain("Player 1 drew a card:");
  });

  it("applies a random Community Chest card without changing the player list", () => {
    const state = createActiveGameForTest();

    const nextState = applyCommunityChestCard(state);

    expect(nextState.players).toHaveLength(state.players.length);
    expect(nextState.log).toHaveLength(state.log.length + 1);
    expect(nextState.log[0].message).toContain("Player 1 drew a card:");
  });
});
