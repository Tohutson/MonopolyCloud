import { describe, expect, it } from "vitest";
import { resolveLandedSquare } from "../rules/squareResolution";
import {
  createActiveGameForTest,
  markPropertyOwned,
  setLastDiceRoll,
  setCurrentPlayerPosition,
} from "./testUtils";

describe("resolveLandedSquare", () => {
  it("logs the current Start behavior", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 0);

    const nextState = resolveLandedSquare(state);

    expect(nextState.log[0].message).toBe(
      "Player 1 passed Start and collected $200.",
    );
  });

  it("charges income tax", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 4);

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1300);
    expect(nextState.players[1].cash).toBe(1500);
    expect(nextState.log[0].message).toBe("Player 1 paid tax of $200.");
  });

  it("charges luxury tax", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 38);

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1400);
    expect(nextState.players[1].cash).toBe(1500);
    expect(nextState.log[0].message).toBe("Player 1 paid tax of $100.");
  });

  it("logs when an unowned property is available", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 1);

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.log[0].message).toBe(
      "Player 1 landed on Mediterranean Avenue. It is available for $60.",
    );
  });

  it("does not charge rent on the current player's own property", () => {
    const state = markPropertyOwned(
      setCurrentPlayerPosition(createActiveGameForTest(), 1),
      "mediterranean-avenue",
      "player-1",
    );

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[1].cash).toBe(1500);
    expect(nextState.log[0].message).toBe(
      "Player 1 landed on their own property, Mediterranean Avenue.",
    );
  });

  it("charges rent when landing on an opponent-owned property", () => {
    const state = markPropertyOwned(
      setCurrentPlayerPosition(createActiveGameForTest(), 1),
      "mediterranean-avenue",
      "player-2",
    );

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1498);
    expect(nextState.players[1].cash).toBe(1502);
    expect(nextState.log[0].message).toBe(
      "Player 1 paid $2 rent to Player 2 for Mediterranean Avenue.",
    );
  });

  it("charges calculated railroad rent when landing on an opponent-owned railroad", () => {
    const state = markPropertyOwned(
      markPropertyOwned(
        markPropertyOwned(
          setCurrentPlayerPosition(createActiveGameForTest(), 5),
          "reading-railroad",
          "player-2",
        ),
        "pennsylvania-railroad",
        "player-2",
      ),
      "b-and-o-railroad",
      "player-2",
    );

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1400);
    expect(nextState.players[1].cash).toBe(1600);
    expect(nextState.log[0].message).toBe(
      "Player 1 paid $100 rent to Player 2 for Reading Railroad.",
    );
  });

  it("charges calculated utility rent when landing on an opponent-owned utility", () => {
    const state = setLastDiceRoll(
      markPropertyOwned(
        markPropertyOwned(
          setCurrentPlayerPosition(createActiveGameForTest(), 12),
          "electric-company",
          "player-2",
        ),
        "water-works",
        "player-2",
      ),
      7,
    );

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1430);
    expect(nextState.players[1].cash).toBe(1570);
    expect(nextState.log[0].message).toBe(
      "Player 1 paid $70 rent to Player 2 for Electric Company.",
    );
  });

  it("does not charge rent on the current player's own railroad", () => {
    const state = markPropertyOwned(
      setCurrentPlayerPosition(createActiveGameForTest(), 5),
      "reading-railroad",
      "player-1",
    );

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[1].cash).toBe(1500);
    expect(nextState.log[0].message).toBe(
      "Player 1 landed on their own property, Reading Railroad.",
    );
  });

  it("does not charge rent on the current player's own utility", () => {
    const state = setLastDiceRoll(
      markPropertyOwned(
        setCurrentPlayerPosition(createActiveGameForTest(), 12),
        "electric-company",
        "player-1",
      ),
      7,
    );

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[1].cash).toBe(1500);
    expect(nextState.log[0].message).toBe(
      "Player 1 landed on their own property, Electric Company.",
    );
  });

  it("logs availability for an unowned railroad", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 5);

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[1].cash).toBe(1500);
    expect(nextState.log[0].message).toBe(
      "Player 1 landed on Reading Railroad. It is available for $200.",
    );
  });

  it("logs availability for an unowned utility", () => {
    const state = setLastDiceRoll(
      setCurrentPlayerPosition(createActiveGameForTest(), 12),
      7,
    );

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[1].cash).toBe(1500);
    expect(nextState.log[0].message).toBe(
      "Player 1 landed on Electric Company. It is available for $150.",
    );
  });

  it("applies Chance card behavior without depending on the random card", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 7);

    const nextState = resolveLandedSquare(state);

    expect(nextState.players).toHaveLength(state.players.length);
    expect(nextState.log).toHaveLength(state.log.length + 1);
    expect(nextState.log[0].message).toContain("Player 1 drew a card:");
  });

  it("applies Community Chest card behavior without depending on the random card", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 2);

    const nextState = resolveLandedSquare(state);

    expect(nextState.players).toHaveLength(state.players.length);
    expect(nextState.log).toHaveLength(state.log.length + 1);
    expect(nextState.log[0].message).toContain("Player 1 drew a card:");
  });

  it("logs Free Parking", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 20);

    const nextState = resolveLandedSquare(state);

    expect(nextState.log[0].message).toBe("Player 1 landed on Free Parking.");
  });

  it("logs visiting jail", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 10);

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].position).toBe(10);
    expect(nextState.log[0].message).toBe("Player 1 is visiting jail.");
  });

  it("moves the current player to jail from Go To Jail", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 30);

    const nextState = resolveLandedSquare(state);

    expect(nextState.players[0].position).toBe(10);
    expect(nextState.log[0].message).toBe("Player 1 was sent to Jail.");
  });
});
