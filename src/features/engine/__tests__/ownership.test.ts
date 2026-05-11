import { describe, expect, it } from "vitest";
import {
  getPropertyOwnerId,
  isPropertyOwnedByCurrentPlayer,
} from "../rules/ownership";
import {
  createActiveGameForTest,
  markPropertyOwned,
  setCurrentPlayerIndex,
} from "./testUtils";

describe("ownership rules", () => {
  it("returns null for an unowned property", () => {
    const state = createActiveGameForTest();

    expect(getPropertyOwnerId(state, "mediterranean-avenue")).toBeNull();
  });

  it("returns the owner id for an owned property", () => {
    const state = markPropertyOwned(
      createActiveGameForTest(),
      "mediterranean-avenue",
      "player-1",
    );

    expect(getPropertyOwnerId(state, "mediterranean-avenue")).toBe("player-1");
  });

  it("detects whether the current player owns a property", () => {
    const state = markPropertyOwned(
      createActiveGameForTest(),
      "mediterranean-avenue",
      "player-1",
    );
    const playerTwoState = setCurrentPlayerIndex(state, 1);

    expect(isPropertyOwnedByCurrentPlayer(state, "mediterranean-avenue")).toBe(
      true,
    );
    expect(
      isPropertyOwnedByCurrentPlayer(playerTwoState, "mediterranean-avenue"),
    ).toBe(false);
  });
});
