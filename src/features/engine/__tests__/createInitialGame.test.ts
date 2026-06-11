import { describe, expect, it } from "vitest";
import { createInitialGame } from "../createInitialGame";

describe("createInitialGame", () => {
  it("creates a fresh not-started local game", () => {
    const state = createInitialGame();

    expect(state.status).toBe("NOT_STARTED");
    expect(state.players).toHaveLength(2);
    expect(state.players[0].position).toBe(0);
    expect(state.players[1].position).toBe(0);
    expect(state.players[0].cash).toBe(1500);
    expect(state.players[1].cash).toBe(1500);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.board).toHaveLength(40);
    expect(state.ownedProperties).toEqual([]);
    expect(state.lastDiceRoll).toBeNull();
    expect(state.pendingRoll).toBeNull();
    expect(state.hasRolledThisTurn).toBe(false);
    expect(state.rolledDoublesCount).toBe(0);
    expect(state.diceRollSequence).toBe(0);
    expect(state.winnerId).toBeNull();
    expect(state.log).toEqual([]);
  });
});
