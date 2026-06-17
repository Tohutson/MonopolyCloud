import { describe, expect, it } from "vitest";
import { checkWinCondition } from "../rules/winConditions";
import { createActiveGameForTest } from "./testUtils";

describe("checkWinCondition", () => {
  it("does not mark a player bankrupt only because cash is negative", () => {
    const state = {
      ...createActiveGameForTest(),
      players: createActiveGameForTest().players.map((player, index) =>
        index === 0 ? { ...player, cash: -1 } : player,
      ),
    };

    const nextState = checkWinCondition(state);

    expect(nextState.players[0].status).toBe("ACTIVE");
    expect(nextState.players[1].status).toBe("ACTIVE");
  });

  it("finishes the game when one active player remains", () => {
    const state = {
      ...createActiveGameForTest(),
      players: createActiveGameForTest().players.map((player, index) =>
        index === 0 ? { ...player, status: "BANKRUPT" as const } : player,
      ),
    };

    const nextState = checkWinCondition(state);

    expect(nextState.status).toBe("FINISHED");
    expect(nextState.winnerId).toBe("player-2");
  });

  it("adds a win log for the winner", () => {
    const state = {
      ...createActiveGameForTest(),
      players: createActiveGameForTest().players.map((player, index) =>
        index === 0 ? { ...player, status: "BANKRUPT" as const } : player,
      ),
    };

    const nextState = checkWinCondition(state);

    expect(nextState.log[0].message).toBe("Player 2 wins the game!");
  });

  it("keeps the game active when both players are still active", () => {
    const state = createActiveGameForTest();

    const nextState = checkWinCondition(state);

    expect(nextState.status).toBe("ACTIVE");
    expect(nextState.winnerId).toBeNull();
    expect(nextState.players[0].status).toBe("ACTIVE");
    expect(nextState.players[1].status).toBe("ACTIVE");
    expect(nextState.log).toEqual([]);
  });
});
