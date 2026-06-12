import { describe, expect, it } from "vitest";
import { gameReducer } from "../gameReducer";
import {
  canBuildHouse,
  canMortgageProperty,
  getOwnedPropertyRecord,
  ownsFullColorGroup,
} from "../rules/improvements";
import {
  createActiveGameForTest,
  markPropertyOwned,
  markTurnRolled,
  setCurrentPlayerCash,
} from "./testUtils";

const darkBlueIds = ["park-place", "boardwalk"];

function ownProperties(propertyIds: string[], ownerId = "player-1") {
  return propertyIds.reduce(
    (state, propertyId) => markPropertyOwned(state, propertyId, ownerId),
    markTurnRolled(createActiveGameForTest()),
  );
}

function buyHouse(state = ownProperties(darkBlueIds), propertyId = "boardwalk") {
  return gameReducer(state, { type: "BUY_HOUSE", propertyId });
}

describe("property improvement rules", () => {
  it("detects full color groups and ignores railroads/utilities", () => {
    const fullBrown = ownProperties(
      ["mediterranean-avenue", "baltic-avenue"],
      "player-1",
    );
    const missingBrown = ownProperties(["mediterranean-avenue"], "player-1");
    const railroads = ownProperties(
      ["reading-railroad", "pennsylvania-railroad"],
      "player-1",
    );

    expect(ownsFullColorGroup(fullBrown, "player-1", "brown")).toBe(true);
    expect(ownsFullColorGroup(missingBrown, "player-1", "brown")).toBe(false);
    expect(ownsFullColorGroup(railroads, "player-1", "railroad")).toBe(false);
    expect(ownsFullColorGroup(railroads, "player-1", "utility")).toBe(false);
  });

  it("does not allow buying houses without a full group, with a mortgage, or without cash", () => {
    const missingGroup = ownProperties(["boardwalk"]);
    const mortgagedGroup = markPropertyOwned(
      markPropertyOwned(markTurnRolled(createActiveGameForTest()), "park-place", "player-1", {
        isMortgaged: true,
      }),
      "boardwalk",
      "player-1",
    );
    const noCash = setCurrentPlayerCash(ownProperties(darkBlueIds), 0);

    expect(canBuildHouse(missingGroup, "player-1", "boardwalk").allowed).toBe(
      false,
    );
    expect(canBuildHouse(mortgagedGroup, "player-1", "boardwalk").allowed).toBe(
      false,
    );
    expect(canBuildHouse(noCash, "player-1", "boardwalk").allowed).toBe(false);
  });

  it("buys houses, charges the player, enforces even building, and caps at four houses", () => {
    const firstHouse = buyHouse();
    expect(firstHouse.players[0].cash).toBe(1300);
    expect(getOwnedPropertyRecord(firstHouse, "boardwalk")?.houses).toBe(1);
    expect(firstHouse.log[0].message).toBe(
      "Player 1 bought a house on Boardwalk for $200.",
    );

    const unevenAttempt = buyHouse(firstHouse, "boardwalk");
    expect(unevenAttempt).toBe(firstHouse);

    const balanced = buyHouse(firstHouse, "park-place");
    const secondOnBoardwalk = buyHouse(balanced, "boardwalk");
    const secondOnParkPlace = buyHouse(secondOnBoardwalk, "park-place");
    const thirdOnBoardwalk = buyHouse(secondOnParkPlace, "boardwalk");
    const thirdOnParkPlace = buyHouse(thirdOnBoardwalk, "park-place");
    const fourthOnBoardwalk = buyHouse(thirdOnParkPlace, "boardwalk");

    expect(getOwnedPropertyRecord(fourthOnBoardwalk, "boardwalk")?.houses).toBe(
      4,
    );
    expect(buyHouse(fourthOnBoardwalk, "boardwalk")).toBe(fourthOnBoardwalk);
  });

  it("buys hotels only from exactly four houses and converts the houses", () => {
    const noHouses = ownProperties(darkBlueIds);
    expect(gameReducer(noHouses, { type: "BUY_HOTEL", propertyId: "boardwalk" })).toBe(
      noHouses,
    );

    const withFourHouses = markPropertyOwned(
      markPropertyOwned(markTurnRolled(createActiveGameForTest()), "park-place", "player-1", {
        houses: 4,
      }),
      "boardwalk",
      "player-1",
      { houses: 4 },
    );
    const hotelState = gameReducer(withFourHouses, {
      type: "BUY_HOTEL",
      propertyId: "boardwalk",
    });

    expect(hotelState.players[0].cash).toBe(1300);
    expect(getOwnedPropertyRecord(hotelState, "boardwalk")).toMatchObject({
      houses: 0,
      hotel: true,
    });
    expect(gameReducer(hotelState, { type: "BUY_HOTEL", propertyId: "boardwalk" })).toBe(
      hotelState,
    );

    const mortgagedGroup = markPropertyOwned(
      markPropertyOwned(markTurnRolled(createActiveGameForTest()), "park-place", "player-1", {
        houses: 4,
        isMortgaged: true,
      }),
      "boardwalk",
      "player-1",
      { houses: 4 },
    );
    expect(gameReducer(mortgagedGroup, { type: "BUY_HOTEL", propertyId: "boardwalk" })).toBe(
      mortgagedGroup,
    );
  });

  it("sells houses for half price and enforces even selling", () => {
    const state = markPropertyOwned(
      markPropertyOwned(markTurnRolled(createActiveGameForTest()), "park-place", "player-1", {
        houses: 1,
      }),
      "boardwalk",
      "player-1",
      { houses: 2 },
    );

    expect(gameReducer(state, { type: "SELL_HOUSE", propertyId: "park-place" })).toBe(
      state,
    );

    const nextState = gameReducer(state, {
      type: "SELL_HOUSE",
      propertyId: "boardwalk",
    });

    expect(nextState.players[0].cash).toBe(1600);
    expect(getOwnedPropertyRecord(nextState, "boardwalk")?.houses).toBe(1);
    expect(nextState.log[0].message).toBe(
      "Player 1 sold a house on Boardwalk for $100.",
    );
  });

  it("sells hotels for half price and converts them back to four houses", () => {
    const state = markPropertyOwned(
      markPropertyOwned(markTurnRolled(createActiveGameForTest()), "park-place", "player-1"),
      "boardwalk",
      "player-1",
      { hotel: true },
    );

    const nextState = gameReducer(state, {
      type: "SELL_HOTEL",
      propertyId: "boardwalk",
    });

    expect(nextState.players[0].cash).toBe(1600);
    expect(getOwnedPropertyRecord(nextState, "boardwalk")).toMatchObject({
      houses: 4,
      hotel: false,
    });
    expect(nextState.log[0].message).toBe(
      "Player 1 sold a hotel on Boardwalk for $100.",
    );
  });

  it("blocks mortgaging a color group with improvements and allows it after buildings are sold", () => {
    const improved = markPropertyOwned(
      markPropertyOwned(markTurnRolled(createActiveGameForTest()), "park-place", "player-1"),
      "boardwalk",
      "player-1",
      { houses: 1 },
    );

    expect(canMortgageProperty(improved, "player-1", "park-place").allowed).toBe(
      false,
    );
    expect(gameReducer(improved, { type: "MORTGAGE_PROPERTY", propertyId: "park-place" })).toBe(
      improved,
    );

    const sold = gameReducer(improved, {
      type: "SELL_HOUSE",
      propertyId: "boardwalk",
    });
    const mortgaged = gameReducer(sold, {
      type: "MORTGAGE_PROPERTY",
      propertyId: "park-place",
    });

    expect(mortgaged.players[0].cash).toBe(1775);
    expect(getOwnedPropertyRecord(mortgaged, "park-place")?.isMortgaged).toBe(
      true,
    );
  });
});
