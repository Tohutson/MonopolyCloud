import { beforeEach, describe, expect, it } from "vitest";
import { createInitialGame } from "../../engine/createInitialGame";
import { useGameStore } from "../useGameStore";

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.setState({
      state: createInitialGame(),
    });
  });

  it("dispatches START_GAME through the reducer", () => {
    useGameStore.getState().dispatch({
      type: "START_GAME",
    });

    expect(useGameStore.getState().state.status).toBe("ACTIVE");
  });

  it("dispatches RESET_GAME back to a fresh initial state", () => {
    useGameStore.setState({
      state: {
        ...createInitialGame(),
        status: "ACTIVE",
        currentPlayerIndex: 1,
        ownedProperties: [
          {
            propertyId: "boardwalk",
            ownerId: "player-1",
          },
        ],
        log: [{ id: "test-log", message: "Previous event." }],
      },
    });

    useGameStore.getState().dispatch({
      type: "RESET_GAME",
    });

    const resetState = useGameStore.getState().state;

    expect(resetState.status).toBe("NOT_STARTED");
    expect(resetState.currentPlayerIndex).toBe(0);
    expect(resetState.ownedProperties).toEqual([]);
    expect(resetState.log).toEqual([]);
  });
});
