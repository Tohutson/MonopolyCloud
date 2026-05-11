import { describe, expect, it } from "vitest";
import { chargeCurrentPlayer, payRent } from "../rules/payments";
import { createActiveGameForTest, setCurrentPlayerIndex } from "./testUtils";

describe("payment rules", () => {
  it("charges the current player only and adds a log entry", () => {
    const state = setCurrentPlayerIndex(createActiveGameForTest(), 1);

    const nextState = chargeCurrentPlayer(state, 75, "Player 2 paid $75.");

    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[1].cash).toBe(1425);
    expect(nextState.log[0].message).toBe("Player 2 paid $75.");
  });

  it("moves rent from the payer to the owner and leaves other players unchanged", () => {
    const state = {
      ...createActiveGameForTest(),
      players: [
        ...createActiveGameForTest().players,
        {
          id: "player-3",
          name: "Player 3",
          cash: 1500,
          position: 0,
          status: "ACTIVE" as const,
        },
      ],
    };

    const nextState = payRent(
      state,
      "player-1",
      "player-2",
      "Player 1",
      "Player 2",
      25,
      "Reading Railroad",
    );

    expect(nextState.players[0].cash).toBe(1475);
    expect(nextState.players[1].cash).toBe(1525);
    expect(nextState.players[2].cash).toBe(1500);
    expect(nextState.log[0].message).toBe(
      "Player 1 paid $25 rent to Player 2 for Reading Railroad.",
    );
  });
});
