import { describe, expect, it } from "vitest";
import { createInitialGame } from "./createInitialGame";
import { gameReducer } from "./gameReducer";

describe("gameReducer", () => {
  it("starts the game", () => {
    const initialState = createInitialGame();

    const nextState = gameReducer(initialState, {
      type: "START_GAME",
    });

    expect(nextState.status).toBe("ACTIVE");
    expect(nextState.log[0].message).toBe("Game started.");
  });

  it("resets the game", () => {
    const initialState = createInitialGame();

    const activeState = gameReducer(initialState, {
      type: "START_GAME",
    });

    const resetState = gameReducer(activeState, {
      type: "RESET_GAME",
    });

    expect(resetState.status).toBe("NOT_STARTED");
    expect(resetState.log).toEqual([]);
  });
});
