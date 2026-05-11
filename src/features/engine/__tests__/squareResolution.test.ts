import { describe, expect, it } from "vitest";
import { resolveLandedSquare } from "../rules/squareResolution";
import {
  createActiveGameForTest,
  markPropertyOwned,
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

  it("logs Chance without applying a card effect", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 7);

    const nextState = resolveLandedSquare(state);

    expect(nextState.log[0].message).toBe(
      "Player 1 landed on Chance. (No card effects implemented yet)",
    );
  });

  it("logs Community Chest without applying a card effect", () => {
    const state = setCurrentPlayerPosition(createActiveGameForTest(), 2);

    const nextState = resolveLandedSquare(state);

    expect(nextState.log[0].message).toBe(
      "Player 1 landed on Community Chest.",
    );
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
