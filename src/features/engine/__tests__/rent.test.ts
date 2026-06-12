import { describe, expect, it } from "vitest";
import { calculateRentForProperty } from "../rules/rent";
import {
  createActiveGameForTest,
  markPropertyOwned,
  propertySquareById,
  setLastDiceRoll,
} from "./testUtils";

const railroadIds = [
  "reading-railroad",
  "pennsylvania-railroad",
  "b-and-o-railroad",
  "short-line-railroad",
];

function stateWithOwnedProperties(
  propertyIds: string[],
  ownerId: string,
) {
  return propertyIds.reduce(
    (state, propertyId) => markPropertyOwned(state, propertyId, ownerId),
    createActiveGameForTest(),
  );
}

describe("calculateRentForProperty", () => {
  it.each([
    { ownedRailroads: railroadIds.slice(0, 1), expectedRent: 25 },
    { ownedRailroads: railroadIds.slice(0, 2), expectedRent: 50 },
    { ownedRailroads: railroadIds.slice(0, 3), expectedRent: 100 },
    { ownedRailroads: railroadIds.slice(0, 4), expectedRent: 200 },
  ])(
    "charges $expectedRent rent when the owner has $ownedRailroads.length railroad(s)",
    ({ ownedRailroads, expectedRent }) => {
      const state = stateWithOwnedProperties(ownedRailroads, "player-2");

      const rent = calculateRentForProperty(
        state,
        propertySquareById("reading-railroad"),
        "player-2",
      );

      expect(rent).toBe(expectedRent);
    },
  );

  it("returns base rent for normal properties", () => {
    const state = stateWithOwnedProperties(
      ["mediterranean-avenue", "reading-railroad", "electric-company"],
      "player-2",
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("mediterranean-avenue"),
      "player-2",
    );

    expect(rent).toBe(2);
  });

  it("doubles base rent for an unimproved monopoly with no mortgages", () => {
    const state = stateWithOwnedProperties(
      ["mediterranean-avenue", "baltic-avenue"],
      "player-2",
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("mediterranean-avenue"),
      "player-2",
    );

    expect(rent).toBe(4);
  });

  it.each([
    { houses: 1, expectedRent: 200 },
    { houses: 2, expectedRent: 600 },
    { houses: 3, expectedRent: 1400 },
    { houses: 4, expectedRent: 1700 },
  ])("charges $expectedRent rent with $houses house(s)", ({ houses, expectedRent }) => {
    const state = markPropertyOwned(
      markPropertyOwned(createActiveGameForTest(), "park-place", "player-2"),
      "boardwalk",
      "player-2",
      { houses },
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("boardwalk"),
      "player-2",
    );

    expect(rent).toBe(expectedRent);
  });

  it("charges hotel rent", () => {
    const state = markPropertyOwned(
      markPropertyOwned(createActiveGameForTest(), "park-place", "player-2"),
      "boardwalk",
      "player-2",
      { hotel: true },
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("boardwalk"),
      "player-2",
    );

    expect(rent).toBe(2000);
  });

  it("collects no rent from mortgaged property and skips double rent with a group mortgage", () => {
    const state = markPropertyOwned(
      markPropertyOwned(
        createActiveGameForTest(),
        "mediterranean-avenue",
        "player-2",
        { isMortgaged: true },
      ),
      "baltic-avenue",
      "player-2",
    );

    expect(
      calculateRentForProperty(
        state,
        propertySquareById("mediterranean-avenue"),
        "player-2",
      ),
    ).toBe(0);
    expect(
      calculateRentForProperty(
        state,
        propertySquareById("baltic-avenue"),
        "player-2",
      ),
    ).toBe(4);
  });

  it("does not count non-railroad properties toward railroad rent", () => {
    const state = stateWithOwnedProperties(
      ["reading-railroad", "mediterranean-avenue", "electric-company"],
      "player-2",
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("reading-railroad"),
      "player-2",
    );

    expect(rent).toBe(25);
  });

  it("does not count railroads owned by another player", () => {
    const state = markPropertyOwned(
      stateWithOwnedProperties(["reading-railroad"], "player-2"),
      "pennsylvania-railroad",
      "player-1",
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("reading-railroad"),
      "player-2",
    );

    expect(rent).toBe(25);
  });

  it("charges four times the dice total when the owner has one utility", () => {
    const state = setLastDiceRoll(
      stateWithOwnedProperties(["electric-company"], "player-2"),
      7,
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("electric-company"),
      "player-2",
    );

    expect(rent).toBe(28);
  });

  it("charges ten times the dice total when the owner has both utilities", () => {
    const state = setLastDiceRoll(
      stateWithOwnedProperties(["electric-company", "water-works"], "player-2"),
      7,
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("electric-company"),
      "player-2",
    );

    expect(rent).toBe(70);
  });

  it("does not count utilities owned by another player", () => {
    const state = setLastDiceRoll(
      markPropertyOwned(
        stateWithOwnedProperties(["electric-company"], "player-2"),
        "water-works",
        "player-1",
      ),
      7,
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("electric-company"),
      "player-2",
    );

    expect(rent).toBe(28);
  });

  it("falls back to base rent for utilities when there is no dice roll", () => {
    const state = stateWithOwnedProperties(
      ["electric-company", "water-works"],
      "player-2",
    );

    const rent = calculateRentForProperty(
      state,
      propertySquareById("electric-company"),
      "player-2",
    );

    expect(rent).toBe(20);
  });
});
